import { error } from "console";
import User from "./user.model";
import AppError from "../../errorHelpers/AppError";

import httpStatus from "http-status-codes";
import { ROLE } from "./user.interface";
const findMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Not Found");
  }
  const { password: pass, ...result } = user.toObject();

  if (result && result.role === ROLE.rider) {
    delete result.isApproved;
    delete result.isOnline;
    delete result.totalEarnings;
    delete result.rating;
    delete result.totalRides;
    delete result.earnings;
    return result;
  }
  return result;
};
export const userService = {
  findMe,
};
