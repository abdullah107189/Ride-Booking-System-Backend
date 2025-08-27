import { IRide, RideStatus } from "./ride.interface";
import { Ride } from "./ride.model";

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
export const RideService = {
  createRequest,
};
