/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import User from "../user/user.model";
import { ROLE } from "../user/user.interface";
import { Ride } from "../ride/ride.model";
import { RideStatus } from "../ride/ride.interface";

const changeBlockStatus = async (userId: string) => {
  if (!userId) {
    throw new AppError(httpStatus.NOT_FOUND, "Id not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Not Found");
  }
  if (user.role == ROLE.admin) {
    throw new AppError(httpStatus.BAD_REQUEST, "Can't block admin");
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isBlocked: !user?.isBlocked },
    { new: true, runValidators: true }
  ).select("name email isBlocked");

  return updatedUser;
};

const changeOnlineStatus = async (userId: string) => {
  if (!userId) {
    throw new AppError(httpStatus.NOT_FOUND, "User ID not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isOnline: !user.isOnline },
    { new: true, runValidators: true }
  ).select("name email isOnline role");

  return updatedUser;
};
const getAllUser = async () => {
  const users = await User.find({}).sort({ createdAt: -1 });
  if (!users) {
    throw new AppError(httpStatus.NOT_FOUND, "Not any rider or driver");
  }
  const totalCountDriver = await User.countDocuments({ role: ROLE.driver });
  const totalCountRider = await User.countDocuments({ role: ROLE.rider });

  return { users: users, meta: { totalCountDriver, totalCountRider } };
};
const getAllRide = async (query: any = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    riderName,
    driverName,
    startDate,
    endDate,
    minFare,
    maxFare,
  } = query;

  // Build match stage
  const matchStage: any = {};

  // Status filter
  if (status && status !== "all") {
    matchStage.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // Fare range filter
  if (minFare || maxFare) {
    matchStage.fare = {};
    if (minFare) matchStage.fare.$gte = Number(minFare);
    if (maxFare) matchStage.fare.$lte = Number(maxFare);
  }

  const aggregationPipeline: any[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "rider",
        foreignField: "_id",
        as: "riderInfo",
      },
    },
    {
      $unwind: {
        path: "$riderInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "driver",
        foreignField: "_id",
        as: "driverInfo",
      },
    },
    {
      $unwind: {
        path: "$driverInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // Add additional filtering for rider and driver names
  const additionalFilters = [];
  if (riderName) {
    additionalFilters.push({
      "riderInfo.name": { $regex: riderName, $options: "i" },
    });
  }
  if (driverName) {
    additionalFilters.push({
      "driverInfo.name": { $regex: driverName, $options: "i" },
    });
  }

  if (additionalFilters.length > 0) {
    aggregationPipeline.push({
      $match: {
        $and: additionalFilters,
      },
    });
  }

  // Continue with projection and sorting
  aggregationPipeline.push(
    {
      $project: {
        _id: 1,
        pickupLocation: 1,
        destinationLocation: 1,
        status: 1,
        fare: 1,
        statusHistory: 1,
        createdAt: 1,
        updatedAt: 1,
        rider: {
          _id: "$riderInfo._id",
          name: "$riderInfo.name",
          email: "$riderInfo.email",
          phone: "$riderInfo.phone",
          isOnline: "$riderInfo.isOnline",
          isBlocked: "$riderInfo.isBlocked",
        },
        driver: {
          _id: "$driverInfo._id",
          name: "$driverInfo.name",
          email: "$driverInfo.email",
          phone: "$driverInfo.phone",
          isOnline: "$driverInfo.isOnline",
          isBlocked: "$driverInfo.isBlocked",
          isApproved: "$driverInfo.isApproved",
          rating: "$driverInfo.rating",
          totalRides: "$driverInfo.totalRides",
          totalEarnings: "$driverInfo.totalEarnings",
          vehicleInfo: "$driverInfo.vehicleInfo",
          currentLocation: "$driverInfo.currentLocation",
        },
      },
    },
    { $sort: { createdAt: -1 } }
  );

  // Add pagination
  const skip = (page - 1) * limit;
  const paginatedPipeline = [
    ...aggregationPipeline,
    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  const rides = await Ride.aggregate(paginatedPipeline);

  // Get total count - SIMPLER VERSION
  const totalMatchStage = { ...matchStage };
  let total;
  // If we have name filters, we need to do a separate lookup-based count
  if (additionalFilters.length > 0) {
    // Use the same pipeline but just for counting
    const countPipeline: any[] = [
      { $match: totalMatchStage },
      {
        $lookup: {
          from: "users",
          localField: "rider",
          foreignField: "_id",
          as: "riderInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "driver",
          foreignField: "_id",
          as: "driverInfo",
        },
      },
      {
        $match: {
          $and: additionalFilters,
        },
      },
      { $count: "total" },
    ];

    const totalResult = await Ride.aggregate(countPipeline);
     total = totalResult[0]?.total || 0;
  } else {
    // Simple count without name filters
     total = await Ride.countDocuments(totalMatchStage);
  }

  if (!rides || rides.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No rides found");
  }

  return {
    data: rides,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const cancelRide = async (rideId: string) => {
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (
    rideInfo.status !== RideStatus.completed &&
    rideInfo.status !== RideStatus.paid
  ) {
    const updateObject = {
      status: RideStatus.canceled,
    };
    const pushUpdateStatus = {
      statusHistory: {
        updateStatus: RideStatus.canceled,
        timestamp: new Date(),
      },
    };
    const updateStatus = await Ride.findByIdAndUpdate(
      rideId,
      {
        $set: updateObject,
        $push: pushUpdateStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    return updateStatus;
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Already completed this ride");
  }
};
// status
const approveDriver = async (driverId: string, adminId: string) => {
  const driver = await User.findById(driverId);

  if (!driver || driver.role !== "driver") {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Driver not found or invalid role."
    );
  }
  const updatedDriver = await User.findByIdAndUpdate(
    driverId,
    {
      isApproved: true,
      approvalStatus: "approved",
      approvalReviewedAt: new Date(),
      approvedBy: adminId,
    },
    { new: true }
  ).select("-password");

  // TODO: Send notification to driver

  return updatedDriver;
};
const getPendingApprovals = async () => {
  const pendingDrivers = await User.find({
    role: "driver",
    approvalStatus: "pending",
  })
    .select("-password")
    .sort({ approvalRequestedAt: -1 });

  return pendingDrivers;
};

const rejectDriver = async (driverId: string, adminId: string) => {
  const driver = await User.findById(driverId);

  if (!driver || driver.role !== "driver") {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Driver not found or invalid role."
    );
  }

  const updatedDriver = await User.findByIdAndUpdate(
    driverId,
    {
      isApproved: false,
      approvalStatus: "rejected",
      approvalReviewedAt: new Date(),
      approvedBy: adminId,
    },
    { new: true }
  ).select("-password");

  return updatedDriver;
};

const getEarningsStats = async (
  timeRange: "daily" | "weekly" | "monthly" = "monthly"
) => {
  const currentDate = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "daily":
      startDate = new Date(currentDate.setHours(0, 0, 0, 0));
      break;
    case "weekly":
      startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
      break;
    case "monthly":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      break;
    default:
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
  }

  // Get total earnings
  const totalEarnings = await Ride.aggregate([
    {
      $match: {
        status: { $in: ["paid"] },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$fare" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Get earnings by date for chart
  const earningsByDate = await Ride.aggregate([
    {
      $match: {
        status: { $in: ["paid"] },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: timeRange === "daily" ? "%H:00" : "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        earnings: { $sum: "$fare" },
        rides: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Get earnings by vehicle type
  const earningsByVehicle = await Ride.aggregate([
    {
      $match: {
        status: { $in: ["paid"] },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$vehicleType",
        earnings: { $sum: "$fare" },
        rides: { $sum: 1 },
      },
    },
  ]);

  // Get top drivers
  const topDrivers = await Ride.aggregate([
    {
      $match: {
        status: { $in: ["paid"] },
        createdAt: { $gte: startDate },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "driver",
        foreignField: "_id",
        as: "driverInfo",
      },
    },
    {
      $unwind: "$driverInfo",
    },
    {
      $group: {
        _id: "$driver",
        earnings: { $sum: "$fare" },
        rides: { $sum: 1 },
        driverName: { $first: "$driverInfo.name" },
      },
    },
    {
      $sort: { earnings: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  return {
    totalEarnings: totalEarnings[0]?.total || 0,
    totalRides: totalEarnings[0]?.count || 0,
    earningsByDate,
    earningsByVehicle,
    topDrivers,
    timeRange,
  };
};

export const adminServices = {
  changeBlockStatus,
  changeOnlineStatus,
  approveDriver,
  getAllUser,
  getAllRide,
  cancelRide,
  getPendingApprovals,
  rejectDriver,
  getEarningsStats,
};
