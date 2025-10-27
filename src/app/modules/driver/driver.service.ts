/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Ride } from "../ride/ride.model";
import { calculateFare } from "../../utils/fareCalculator";
import { RideStatus } from "../ride/ride.interface";
import User from "../user/user.model";

const findNearbyRides = async (driverId: string) => {
  return { driverId };
};

const getDriverEarningsHistory = async (driverId: string) => {
  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    throw new AppError(400, "Invalid driver ID.");
  }
  const paidRides = await Ride.find({
    driver: driverId,
    status: RideStatus.paid,
  }).lean();
  if (!paidRides || paidRides.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No paid rides available for this driver."
    );
  }

  const paidRideDetails = paidRides.map((ride) => {
    const fare = calculateFare(
      ride.pickupLocation.location.coordinates,
      ride.destinationLocation.location.coordinates
    );

    return {
      rideId: ride._id,
      income: fare,
    };
  });

  return paidRideDetails;
};

const getDriverRideHistory = async (driverId: string, query: any = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    startDate,
    endDate,
    minFare,
    maxFare,
  } = query;

  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }

  // Build match stage
  const matchStage: any = {
    driver: new mongoose.Types.ObjectId(driverId),
    status: { $in: ["paid", "canceled", "completed"] }, // Include completed
  };

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

  // Search filter - FIXED
  if (search) {
    matchStage.$or = [
      { "pickupLocation.address": { $regex: search, $options: "i" } },
      { "destinationLocation.address": { $regex: search, $options: "i" } },
    ];
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
        preserveNullAndEmptyArrays: true, // Keep rides even if no rider info
      },
    },
    {
      $project: {
        _id: 1,
        pickupLocation: 1,
        destinationLocation: 1,
        status: 1,
        fare: 1,
        vehicleType: 1,
        paymentMethod: 1,
        statusHistory: 1,
        createdAt: 1,
        updatedAt: 1,
        acceptedAt: 1,
        startedAt: 1,
        completedAt: 1,
        rider: {
          _id: "$riderInfo._id",
          name: "$riderInfo.name",
          email: "$riderInfo.email",
          phone: "$riderInfo.phone",
          rating: "$riderInfo.rating",
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  // Add pagination
  const skip = (page - 1) * limit;
  const paginatedPipeline = [
    ...aggregationPipeline,
    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  const historyRides = await Ride.aggregate(paginatedPipeline);

  // Get total count
  const totalResult = await Ride.aggregate([
    { $match: matchStage },
    { $count: "total" },
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    driverInfo: {
      _id: driver._id,
      name: driver.name,
      phone: driver.phone,
      totalEarnings: driver.totalEarnings || 0,
      vehicleInfo: driver.vehicleInfo,
      rating: driver.rating,
    },
    history: historyRides,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
// src/controllers/driverController.js
const requestApproval = async (driverId: string) => {
  const driver = await User.findById(driverId);
  if (!driver || driver.role !== "driver") {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Only drivers can request approval"
    );
  }
  // Check if already approved
  if (driver.isApproved) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver is already approved");
  }
  // Check if already pending
  if (driver.approvalStatus === "pending") {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Approval request is already pending"
    );
  }

  // Update driver status
  const updatedDriver = await User.findByIdAndUpdate(
    driverId,
    {
      approvalStatus: "pending",
      approvalRequestedAt: new Date(),
    },
    { new: true }
  );

  // TODO: Send notification to admin

  return updatedDriver;
};

// -----------
const getDriverEarningsStats = async (
  driverId: string,
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

  // Get driver's total earnings
  const earningsStats = await Ride.aggregate([
    {
      $match: {
        driver: new mongoose.Types.ObjectId(driverId),
        status: { $in: ["paid"] },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$fare" },
        totalRides: { $sum: 1 },
        averageEarnings: { $avg: "$fare" },
      },
    },
  ]);

  // Get earnings by date for chart
  const earningsByDate = await Ride.aggregate([
    {
      $match: {
        driver: new mongoose.Types.ObjectId(driverId),
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

  const result = earningsStats[0] || {
    totalEarnings: 0,
    totalRides: 0,
    averageEarnings: 0,
  };

  return {
    ...result,
    earningsByDate,
    timeRange,
  };
};
export const DriverServices = {
  getDriverRideHistory,
  findNearbyRides,
  getDriverEarningsHistory,
  requestApproval,
  getDriverEarningsStats,
};
