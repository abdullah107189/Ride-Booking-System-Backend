import AppError from "../../errorHelpers/AppError";
import { Ride } from "../ride/ride.model";
import User from "../user/user.model";
import httpStatus from "http-status-codes";
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

export const DriverService = {
  findNearbyRides,
};
