import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import User from "../user/user.model";
import { ROLE } from "../user/user.interface";
import { Ride } from "../ride/ride.model";
import { RideStatus } from "../ride/ride.interface";

const changeBlockStatus = async (userId: string) => {
  if (!userId) {
    throw new AppError(httpStatus.NOT_FOUND, "Id not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Not Found");
  }
  if (user.role == ROLE.admin) {
    throw new AppError(httpStatus.BAD_REQUEST, "Can't block admin");
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isBlocked: !user?.isBlocked },
    { new: true, runValidators: true }
  ).select("name email isBlocked");

  return updatedUser;
};
const changeApproveStatus = async (userId: string) => {
  if (!userId) {
    throw new AppError(httpStatus.NOT_FOUND, "Id not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Not Found");
  }
  if (user.role !== ROLE.driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Only for driver role");
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isApproved: !user?.isApproved },
    { new: true, runValidators: true }
  ).select("name email isApproved");

  return updatedUser;
};
const getAllUser = async () => {
  const users = await User.find({});
  if (!users) {
    throw new AppError(httpStatus.NOT_FOUND, "Not any rider or driver");
  }
  const totalCountDriver = await User.countDocuments({ role: ROLE.driver });
  const totalCountRider = await User.countDocuments({ role: ROLE.rider });

  return { users: users, meta: { totalCountDriver, totalCountRider } };
};
const getAllRide = async () => {
  const rides = await Ride.find({});
  if (!rides) {
    throw new AppError(httpStatus.NOT_FOUND, "Not any rider or driver");
  }
  const totalCount = await Ride.countDocuments();

  return { data: rides, meta: totalCount };
};

const cancelRide = async (rideId: string) => {
  const rideInfo = await Ride.findById(rideId);
  if (!rideInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }
  if (
    rideInfo.status !== RideStatus.completed &&
    rideInfo.status !== RideStatus.paid
  ) {
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
    throw new AppError(httpStatus.BAD_REQUEST, "Already completed this ride");
  }
};
export const adminServices = {
  changeBlockStatus,
  changeApproveStatus,
  getAllUser,
  getAllRide,
  cancelRide,
};
