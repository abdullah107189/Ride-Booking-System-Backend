import { IUser } from "../user/user.interface";
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
  const comparePassword = await bcryptjs.compare(
    password,
    isUser.password as string
  );
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
