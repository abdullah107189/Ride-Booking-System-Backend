import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import User from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";

export const createTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVars.jwt_secret,
    envVars.jwt_expires
  );
  const refreshToken = generateToken(
    jwtPayload,
    envVars.jwt_refresh_secret,
    envVars.jwt_refresh_expires
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.jwt_refresh_secret
  ) as JwtPayload;

  const existingUser = await User.findOne({
    email: verifiedRefreshToken.email,
  });
  if (!existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email don't exists.");
  }
  if (existingUser.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is Blocked");
  }
  const jwtPayload = {
    userId: existingUser._id,
    email: existingUser.email,
    role: existingUser.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVars.jwt_secret,
    envVars.jwt_expires
  );
  return accessToken;
};
