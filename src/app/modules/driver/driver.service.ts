import { Ride } from "../ride/ride.model";
const showRideRequests = async () => {
  const allRides = await Ride.find({});
  return allRides;
};

export const DriverService = {
  showRideRequests,
};
