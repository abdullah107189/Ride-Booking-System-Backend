import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Ride } from "../ride/ride.model";
import { calculateFare } from "../../utils/fareCalculator";
import User from "../user/user.model";
import { RideStatus } from "../ride/ride.interface";

const findNearbyRides = async (driverId: string) => {
  return {};
};

const getDriverEarnings = async (driverId: string) => {
  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    throw new AppError(400, "Invalid driver ID.");
  }
  const completedRides = await Ride.findOne({
    driver: driverId,
    status: "completed",
  }).lean();
  if (!completedRides) {
    throw new AppError(httpStatus.NOT_FOUND, "Not available complete any ride");
  }
  let totalEarnings = 0;

  const fare = calculateFare(
    completedRides.pickupLocation.location.coordinates,
    completedRides.destinationLocation.location.coordinates
  );

  totalEarnings += fare; // total earn sum

  await User.findByIdAndUpdate(driverId, {
    $inc: { totalEarnings },
  });
  await Ride.findByIdAndUpdate(
    completedRides._id,
    {
      $set: { status: RideStatus.payment },
      $push: {
        statusHistory: {
          updateStatus: RideStatus.payment,
          timestamp: new Date(),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const earningDetails = {
    rideId: completedRides._id,
    fare: fare,
    rider: completedRides.rider,
    pickupLocation: completedRides.pickupLocation,
    destinationLocation: completedRides.destinationLocation,
  };
  return { totalEarnings, earningDetails };
};
export const DriverServices = { findNearbyRides, getDriverEarnings };
