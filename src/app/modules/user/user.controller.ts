import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { userService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

const findMe = catchAsync(async (req: Request, res: Response) => {
  const riderInfo = await userService.findMe(req.user.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: riderInfo,
    message: "Single data get successful",
  });
});
const updateOwnProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const payload = req.body;
  const verifiedToken = req.user;
  const riderInfo = await userService.updateOwnProfile(
    userId,
    payload,
    verifiedToken as JwtPayload
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: riderInfo,
    message: "Profile updated successful",
  });
});

const changeOnlineStatus = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.changeOnlineStatus(req.user.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: user,
    message: "Online status updated successful",
  });
});
export const userController = {
  findMe,
  updateOwnProfile,
  changeOnlineStatus,
};
