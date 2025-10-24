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

const getAllUser = async () => {
  const users = await User.find({}).sort({ createdAt: -1 });
  if (!users) {
    throw new AppError(httpStatus.NOT_FOUND, "Not any rider or driver");
  }
  const totalCountDriver = await User.countDocuments({ role: ROLE.driver });
  const totalCountRider = await User.countDocuments({ role: ROLE.rider });

  return { users: users, meta: { totalCountDriver, totalCountRider } };
};
const getAllRide = async () => {
  const rides = await Ride.aggregate([
    {
      $sort: { createdAt: -1 },
    },

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
  ]);

  if (!rides || rides.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No rides found");
  }

  const totalCount = await Ride.countDocuments();

  return { data: rides, meta: totalCount };
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

export const adminServices = {
  changeBlockStatus,
  approveDriver,
  getAllUser,
  getAllRide,
  cancelRide,
  getPendingApprovals,
  rejectDriver,
};
