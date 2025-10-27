import { IUser, ROLE } from "../user/user.interface";
import User from "../user/user.model";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
const createUser = async (payload: IUser) => {
  const { password, ...rest } = payload;
  if (payload.role === ROLE.admin) {
    throw new AppError(httpStatus.BAD_REQUEST, "Admin role not allow");
  }
  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.bcrypt_salt_round)
  );

  const user = await User.create({
    password: hashedPassword,
    ...rest,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...result } = user.toObject();
  return result;
};
const loginUser = async (payload: IUser) => {
  const { password, email } = payload;

  // Find user with password field
  const isUser = await User.findOne({ email }).select("+password");
  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  // Check if user is blocked
  if (isUser.isBlocked) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support."
    );
  }

  // Verify password - THIS WAS MISSING
  const isPasswordValid = await bcryptjs.compare(
    password,
    isUser.password as string
  );

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Remove sensitive fields based on role
  if (isUser.role === ROLE.rider) {
    delete isUser.isApproved;
    delete isUser.totalEarnings;
    delete isUser.rating;
    delete isUser.totalRides;
    delete isUser.earnings;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...result } = isUser.toObject();
  return result;
};
const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );
  return {
    accessToken: newAccessToken,
  };
};

export const AuthServices = {
  createUser,
  loginUser,
  getNewAccessToken,
};
