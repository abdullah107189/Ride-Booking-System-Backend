import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.services";
import User from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { createTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
const createUser = catchAsync(async (req: Request, res: Response) => {
  const isUser = await User.findOne({ email: req.body?.email });
  if (isUser) {
    throw new AppError(httpStatus.FORBIDDEN, "Already existed !");
  }
  const user = await AuthServices.createUser(req.body);
  const userToken = createTokens(user);
  setAuthCookie(res, userToken);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: user,
    message: "User created successfully",
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthServices.loginUser(req.body);
  const userToken = createTokens(user);
  setAuthCookie(res, userToken);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: user,
    message: "User created successfully",
  });
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "No Refresh Token Provided!");
  }
  const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);
  setAuthCookie(res, tokenInfo);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: tokenInfo,
    message: "New Access Token Get Successfully",
  });
});

const userLogout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Logged Out Successfully",
    data: null,
  });
});
export const AuthControllers = {
  createUser,
  loginUser,
  getNewAccessToken,
  userLogout,
};
