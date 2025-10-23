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
  const createRide = await Ride.create(payload);
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

const getAllHistory = async (riderId: string) => {
  const isRide = await Ride.find({ rider: riderId });
  if (!isRide) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found !");
  }
  return isRide;
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
  if (rideInfo.status == RideStatus.requested) {
    if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
      throw new AppError(httpStatus.FORBIDDEN, "Driver not authorized");
    }
    const updateObject = {
      driver: driverId,
      status: RideStatus.accepted,
    };
    const pushUpdateStatus = {
      statusHistory: { updateStatus: "accepted", timestamp: new Date() },
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
      $inc: { totalEarnings },
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

export const RideService = {
  createRequest,
  findNearbyRides,
  getAllHistory,
  getDriverRides,
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
