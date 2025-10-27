/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { calculateFare } from "../../utils/fareCalculator";
import { ROLE } from "../user/user.interface";
import User from "../user/user.model";
import { IRide, RideStatus } from "./ride.interface";
import { Ride } from "./ride.model";
import httpStatus from "http-status-codes";

const createRequest = async (payload: IRide) => {
  const activeRide = await Ride.findOne({
    rider: payload.rider,
    status: {
      $in: [
        RideStatus.requested,
        RideStatus.accepted,
        RideStatus.picked_up,
        RideStatus.in_transit,
      ],
    },
  });
  if (activeRide) {
    throw new Error(
      "You already have an active ride request or are on a ride."
    );
  }
  const fare = calculateFare(
    payload.pickupLocation?.location?.coordinates,
    payload.destinationLocation?.location?.coordinates
  );
  const payloadWithFare = {
    ...payload,
    fare: fare,
  };
  const createRide = await Ride.create(payloadWithFare);
  return createRide;
};

// find 5km under riders
const findNearbyRides = async (userId: string) => {
  const driver = await User.findById(userId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  if (
    !driver.currentLocation ||
    (driver.currentLocation.location.coordinates[0] === 0 &&
      driver.currentLocation.location.coordinates[1] === 0)
  ) {
    throw new Error("Please update your location to find nearby rides.");
  }
  const longitude = driver.currentLocation.location.coordinates[0];
  const latitude = driver.currentLocation.location.coordinates[1];
  const maxDistance = 5;
  const nearbyRides = await Ride.find({
    status: "requested",
    "pickupLocation.location": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance * 1000, // 5km = 5000m
      },
    },
  });
  return nearbyRides;
};
const getAllHistory = async (riderId: string, query: any = {}) => {
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

  // Build filter object
  const filter: any = { rider: new mongoose.Types.ObjectId(riderId) };

  // Simple filters
  if (status && status !== "all") filter.status = status;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (minFare || maxFare) {
    filter.fare = {};
    if (minFare) filter.fare.$gte = Number(minFare);
    if (maxFare) filter.fare.$lte = Number(maxFare);
  }

  // Search - Simple way
  if (search) {
    filter.$or = [
      { "pickupLocation.address": { $regex: search, $options: "i" } },
      { "destinationLocation.address": { $regex: search, $options: "i" } },
    ];
  }

  // Get total count
  const total = await Ride.countDocuments(filter);

  // Get paginated rides with population
  const rides = await Ride.find(filter)
    .populate("driver", "name phone rating totalTrips")
    .populate({
      path: "driver",
      populate: {
        path: "vehicle",
        select: "model color licensePlate",
      },
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    rides,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const cancelRequest = async (riderId: string, rideId: string) => {
  const rider = await User.findById(riderId);
  if (!rider) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
  }
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (rideInfo.status == RideStatus.requested) {
    if (rider.role !== ROLE.rider || rider.isBlocked) {
      throw new AppError(httpStatus.FORBIDDEN, "Rider not authorized");
    }
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
    throw new AppError(httpStatus.NOT_FOUND, "allow only request rides.");
  }
};

// driver control
const acceptsRequest = async (driverId: string, rideId: string) => {
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }

  if (rideInfo.status === RideStatus.requested) {
    if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
      throw new AppError(httpStatus.FORBIDDEN, "Driver not authorized");
    }

    const updateRideObject = {
      driver: driverId,
      status: RideStatus.accepted,
    };

    const updateRideStatusHistory = {
      updateStatus: "accepted",
      timestamp: new Date(),
    };

    const updateStatus = await Ride.findByIdAndUpdate(
      rideId,
      {
        $set: updateRideObject,
        $push: { statusHistory: updateRideStatusHistory },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    await User.findByIdAndUpdate(
      driverId,
      {
        $set: { isWorking: true },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return updateStatus;
  } else {
    throw new AppError(httpStatus.NOT_FOUND, "allow only request rides.");
  }
};

const picked_upRequest = async (driverId: string, rideId: string) => {
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (rideInfo.status == RideStatus.accepted) {
    if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
      throw new AppError(httpStatus.FORBIDDEN, "Driver not authorized");
    }
    const updateObject = {
      driver: driverId,
      status: RideStatus.picked_up,
    };
    const pushUpdateStatus = {
      statusHistory: { updateStatus: "picked_up", timestamp: new Date() },
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
    throw new AppError(httpStatus.NOT_FOUND, "allow only accepted rides.");
  }
};
const in_transitRequest = async (driverId: string, rideId: string) => {
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (rideInfo.status == RideStatus.picked_up) {
    if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
      throw new AppError(httpStatus.FORBIDDEN, "Driver not authorized");
    }
    const updateObject = {
      driver: driverId,
      status: RideStatus.in_transit,
    };
    const pushUpdateStatus = {
      statusHistory: {
        updateStatus: RideStatus.in_transit,
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
    throw new AppError(httpStatus.NOT_FOUND, "allow only picked_up rides.");
  }
};
const completedRequest = async (driverId: string, rideId: string) => {
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (rideInfo.status == RideStatus.in_transit) {
    if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
      throw new AppError(httpStatus.FORBIDDEN, "Driver not authorized");
    }
    const updateObject = {
      driver: driverId,
      status: RideStatus.completed,
    };
    const pushUpdateStatus = {
      statusHistory: {
        updateStatus: RideStatus.completed,
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
    throw new AppError(httpStatus.NOT_FOUND, "allow only in_transit rides.");
  }
};

const paidRequest = async (driverId: string, rideId: string) => {
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (rideInfo.status == RideStatus.completed) {
    if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
      throw new AppError(httpStatus.FORBIDDEN, "Driver not authorized");
    }
    const updateObject = {
      driver: driverId,
      status: RideStatus.paid,
    };
    const pushUpdateStatus = {
      statusHistory: {
        updateStatus: RideStatus.paid,
        timestamp: new Date(),
      },
    };

    // increase total earning
    let totalEarnings = 0;

    const fare = calculateFare(
      rideInfo.pickupLocation.location.coordinates,
      rideInfo.destinationLocation.location.coordinates
    );

    totalEarnings += fare; // total earn sum

    await User.findByIdAndUpdate(driverId, {
      $inc: { totalEarnings, totalRides: 1 },
    });
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

    await User.findByIdAndUpdate(
      driverId,
      {
        $set: { isWorking: false },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return updateStatus;
  } else {
    throw new AppError(httpStatus.NOT_FOUND, "allow only in_transit rides.");
  }
};

//TODO future, when create notification system
const findNearbyDrivers = async (rideId: string) => {
  const isRide = await Ride.findById(rideId);
  if (!isRide) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (
    !isRide.pickupLocation ||
    (isRide?.pickupLocation.location.coordinates[0] === 0 &&
      isRide?.pickupLocation.location.coordinates[1] === 0)
  ) {
    throw new Error("Please update your location to find nearby rides.");
  }

  const longitude = isRide.pickupLocation.location.coordinates[0];
  const latitude = isRide.pickupLocation.location.coordinates[1];
  const maxDistance = 5;
  const nearbyRides = await User.find({
    role: "driver",
    "currentLocation.location": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance * 1000,
      },
    },
  });

  return nearbyRides;
};

// ride.service.ts
const getDriverRides = async (driverId: string) => {
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }

  const rides = await Ride.aggregate([
    // Match rides for this driver
    {
      $match: {
        driver: new mongoose.Types.ObjectId(driverId),
        status: {
          $nin: ["paid", "canceled"],
        },
      },
    },
    // Lookup rider information from users collection
    {
      $lookup: {
        from: "users",
        localField: "rider",
        foreignField: "_id",
        as: "riderInfo",
      },
    },
    // Unwind the riderInfo array
    {
      $unwind: "$riderInfo",
    },
    // Project only necessary fields
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

        // Rider information only (no driver info)
        rider: {
          _id: "$riderInfo._id",
          name: "$riderInfo.name",
          email: "$riderInfo.email",
          phone: "$riderInfo.phone",
          rating: "$riderInfo.rating",
          totalRides: "$riderInfo.totalRides",
          isOnline: "$riderInfo.isOnline",
        },
      },
    },
    // Sort by latest rides first
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return rides;
};

// Get current active ride for riderf
const getCurrentRideByRider = async (riderId: string) => {
  const rider = await User.findById(riderId);
  if (!rider) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
  }

  const rides = await Ride.aggregate([
    // Match rides for this rider with active status
    {
      $match: {
        rider: new mongoose.Types.ObjectId(riderId),
        status: {
          $nin: ["paid", "canceled"],
        },
      },
    },
    // Lookup driver information from users collection
    {
      $lookup: {
        from: "users",
        localField: "driver",
        foreignField: "_id",
        as: "driverInfo",
      },
    },
    // Unwind the driverInfo array (if driver exists)
    {
      $unwind: {
        path: "$driverInfo",
        preserveNullAndEmptyArrays: true, // Keep rides even if no driver assigned yet
      },
    },
    // Lookup vehicle information
    {
      $lookup: {
        from: "vehicles",
        localField: "driverInfo.vehicle",
        foreignField: "_id",
        as: "vehicleInfo",
      },
    },
    // Unwind vehicle info
    {
      $unwind: {
        path: "$vehicleInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Project necessary fields
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

        // Driver information (if driver exists)
        driver: {
          $cond: {
            if: { $ne: ["$driverInfo", null] },
            then: {
              _id: "$driverInfo._id",
              name: "$driverInfo.name",
              email: "$driverInfo.email",
              phone: "$driverInfo.phone",
              rating: "$driverInfo.rating",
              totalTrips: "$driverInfo.totalTrips",
              isOnline: "$driverInfo.isOnline",
              vehicle: "$vehicleInfo",
            },
            else: null,
          },
        },
      },
    },
    // Sort by latest rides first
    {
      $sort: {
        createdAt: -1,
      },
    },
    // Limit to 1 result (most recent active ride)
    {
      $limit: 1,
    },
  ]);

  return rides.length > 0 ? rides[0] : null;
};

// Get ride history for rider
const getRideHistoryByRider = async (riderId: string, query: any = {}) => {
  const rider = await User.findById(riderId);
  if (!rider) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
  }

  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const matchStage: any = {
    rider: new mongoose.Types.ObjectId(riderId),
  };

  // Filter by status if provided
  if (status && status !== "all") {
    matchStage.status = status;
  }

  // Filter by date range
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.createdAt.$lte = new Date(endDate);
    }
  }

  const aggregationPipeline: any[] = [
    { $match: matchStage },
    // Lookup driver information
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
    // Lookup vehicle information
    {
      $lookup: {
        from: "vehicles",
        localField: "driverInfo.vehicle",
        foreignField: "_id",
        as: "vehicleInfo",
      },
    },
    {
      $unwind: {
        path: "$vehicleInfo",
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
        vehicleType: 1,
        paymentMethod: 1,
        statusHistory: 1,
        createdAt: 1,
        updatedAt: 1,
        acceptedAt: 1,
        startedAt: 1,
        completedAt: 1,
        // Driver information
        driver: {
          $cond: {
            if: { $ne: ["$driverInfo", null] },
            then: {
              _id: "$driverInfo._id",
              name: "$driverInfo.name",
              phone: "$driverInfo.phone",
              rating: "$driverInfo.rating",
              totalTrips: "$driverInfo.totalTrips",
              vehicle: "$vehicleInfo",
            },
            else: null,
          },
        },
      },
    },
    // Sort
    {
      $sort: {
        [sortBy]: sortOrder === "desc" ? -1 : 1,
      },
    },
  ];

  // Add pagination
  const skip = (page - 1) * limit;
  aggregationPipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

  const rides = await Ride.aggregate(aggregationPipeline);

  // Get total count for pagination
  const totalMatchStage = { ...matchStage };
  const totalResult = await Ride.aggregate([
    { $match: totalMatchStage },
    { $count: "total" },
  ]);

  const total = totalResult.length > 0 ? totalResult[0].total : 0;
  const totalPages = Math.ceil(total / limit);

  return {
    rides,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
    },
  };
};

const getRiderStats = async (riderId: string) => {
  const rider = await User.findById(riderId);
  if (!rider) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
  }

  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

  const stats = await Ride.aggregate([
    {
      $match: {
        rider: new mongoose.Types.ObjectId(riderId),
      },
    },
    {
      $facet: {
        // Total completed rides (completed + paid status)
        completedRides: [
          {
            $match: {
              status: { $in: ["completed", "paid"] },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              totalSpent: { $sum: "$fare" },
            },
          },
        ],
        // This month rides
        thisMonthRides: [
          {
            $match: {
              createdAt: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        // All rides count
        totalRides: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        // Monthly breakdown for chart
        monthlyData: [
          {
            $match: {
              status: { $in: ["completed", "paid"] },
              createdAt: { $gte: startOfYear },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              rides: { $sum: 1 },
              spent: { $sum: "$fare" },
            },
          },
          {
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
            },
          },
        ],
        // Favorite destinations
        topDestinations: [
          {
            $match: {
              status: { $in: ["completed", "paid"] },
            },
          },
          {
            $group: {
              _id: "$destinationLocation.address",
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $limit: 5,
          },
        ],
      },
    },
    {
      $project: {
        totalRides: {
          $ifNull: [{ $arrayElemAt: ["$totalRides.count", 0] }, 0],
        },
        completedRides: {
          $ifNull: [{ $arrayElemAt: ["$completedRides.count", 0] }, 0],
        },
        totalSpent: {
          $ifNull: [{ $arrayElemAt: ["$completedRides.totalSpent", 0] }, 0],
        },
        thisMonthRides: {
          $ifNull: [{ $arrayElemAt: ["$thisMonthRides.count", 0] }, 0],
        },
        monthlyData: 1,
        topDestinations: 1,
      },
    },
  ]);

  // Format the response
  const result = stats[0] || {
    totalRides: 0,
    completedRides: 0,
    totalSpent: 0,
    thisMonthRides: 0,
    monthlyData: [],
    topDestinations: [],
  };

  return {
    totalRides: result.totalRides,
    completedRides: result.completedRides,
    totalSpent: result.totalSpent,
    thisMonthRides: result.thisMonthRides,
    monthlyData: result.monthlyData,
    favoriteDestination: result.topDestinations[0]?._id || "No rides yet",
    monthlySpending: result.monthlyData,
  };
};
export const RideService = {
  createRequest,
  findNearbyRides,
  getAllHistory,
  getDriverRides,
  getCurrentRideByRider,
  getRideHistoryByRider,
  getRiderStats,
  // status change
  cancelRequest,
  acceptsRequest,
  picked_upRequest,
  in_transitRequest,
  completedRequest,
  paidRequest,

  // TODO future
  findNearbyDrivers,
};
