import User from "./user.model";
import AppError from "../../errorHelpers/AppError";
import { IUser, ROLE } from "./user.interface";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

const findMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Not Found");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...result } = user.toObject();
  if (result && result.role === ROLE.rider) {
    delete result.isApproved;
    delete result.totalEarnings;
    delete result.rating;
    delete result.totalRides;
    delete result.earnings;
    delete result.isWorking;
    return result;
  }
  return result;
};

const updateOwnProfile = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isExist = await User.findById(userId);
  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }
  const adminOnlyFields = ["isBlocked", "isApproved", "role"];
  const systemOnlyFields = [
    "earnings",
    "totalRides",
    "totalEarnings",
    "rating",
    "createdAt",
    "updatedAt",
  ];

  for (const field of Object.keys(payload)) {
    if (systemOnlyFields.includes(field)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `The field '${field}' is automatically managed and cannot be updated.`
      );
    }
    if (adminOnlyFields.includes(field)) {
      if (
        decodedToken.role === ROLE.driver ||
        decodedToken.role === ROLE.rider
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `You are not authorized to update the field: '${field}'`
        );
      }
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.bcrypt_salt_round
    );
  }

  const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  if (!newUpdateUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found for update.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...result } = newUpdateUser.toObject();
  return result;
};

const changeOnlineStatus = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isOnline: !user?.isOnline },
    { new: true, runValidators: true }
  ).select("name email isOnline");
  return updatedUser;
};

const changePassword = async (
  userId: string,
  payload: { currentPassword: string; newPassword: string }
) => {
  const { currentPassword, newPassword } = payload;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  // Verify current password - FIXED VERSION
  const isPasswordValid = await bcryptjs.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError(httpStatus.BAD_REQUEST, "Current password is incorrect");
  }

  // Check if new password is same as current password
  const isSamePassword = await bcryptjs.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password cannot be the same as current password"
    );
  }

  // Hash new password
  const hashedNewPassword = await bcryptjs.hash(
    newPassword,
    Number(envVars.bcrypt_salt_round)
  );

  // Update password
  user.password = hashedNewPassword;
  await user.save();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user.toObject();

  return userWithoutPassword;
};

export const userService = {
  findMe,
  updateOwnProfile,
  changeOnlineStatus,
  changePassword,
};
