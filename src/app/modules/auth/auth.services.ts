import { IUser, ROLE } from "../user/user.interface";
import User from "../user/user.model";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
const createUser = async (payload: IUser) => {
  const { password, ...rest } = payload;
  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.bcrypt_salt_round)
  );

  const user = await User.create({
    password: hashedPassword,
    ...rest,
  });

  const { password: pass, ...result } = user.toObject();
  return result;
};

const loginUser = async (payload: IUser) => {
  const { password, email } = payload;
  const isUser = await User.findOne({ email });
  if (!isUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  await bcryptjs.compare(password, isUser.password as string);
  if (isUser && isUser.role === ROLE.rider) {
    delete isUser.isApproved;
    delete isUser.totalEarnings;
    delete isUser.rating;
    delete isUser.totalRides;
    delete isUser.earnings;
    return isUser;
  }
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
