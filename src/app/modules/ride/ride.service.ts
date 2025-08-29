import AppError from "../../errorHelpers/AppError";
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

const acceptsRequest = async (driverId: string, rideId: string) => {
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (rideInfo.status !== RideStatus.requested) {
    throw new AppError(httpStatus.NOT_FOUND, "Accept only request rides.");
  }
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
  if (rideInfo.status !== RideStatus.requested) {
    throw new AppError(httpStatus.NOT_FOUND, "Accept only request rides.");
  }
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
  if (rideInfo.status !== RideStatus.requested) {
    throw new AppError(httpStatus.NOT_FOUND, "Accept only request rides.");
  }
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
  if (rideInfo.status !== RideStatus.requested) {
    throw new AppError(httpStatus.NOT_FOUND, "Accept only request rides.");
  }
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

export const RideService = {
  createRequest,
  findNearbyRides,

  // status change
  acceptsRequest,
  picked_upRequest,
  in_transitRequest,
  completedRequest,

  // TODO future
  findNearbyDrivers,
};
