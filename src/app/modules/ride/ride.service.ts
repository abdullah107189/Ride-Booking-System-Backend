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
  findNearbyDrivers,
};
