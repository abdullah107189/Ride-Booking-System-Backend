import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.services";
import User from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
const createUser = catchAsync(async (req: Request, res: Response) => {
  const isUser = await User.findOne({ email: req.body?.email });
  if (isUser) {
    throw new AppError(httpStatus.FORBIDDEN, "Already existed !");
  }
  const user = await AuthServices.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: user,
    message: "User created successfully",
  });
});
export const AuthControllers = {
  createUser,
};
