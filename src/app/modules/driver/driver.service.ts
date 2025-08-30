import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Ride } from "../ride/ride.model";
import { calculateFare } from "../../utils/fareCalculator";
import { RideStatus } from "../ride/ride.interface";

const findNearbyRides = async (driverId: string) => {
  return {};
};

const getDriverEarnings = async (driverId: string) => {
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

  let totalEarnings = 0;
  const paidRideDetails = paidRides.map((ride) => {
    const fare = calculateFare(
      ride.pickupLocation.location.coordinates,
      ride.destinationLocation.location.coordinates
    );

    totalEarnings += fare;

    return {
      rideId: ride._id,
      income: fare,
    };
  });

  return paidRideDetails;
};
export const DriverServices = { findNearbyRides, getDriverEarnings };
