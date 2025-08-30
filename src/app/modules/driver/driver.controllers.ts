import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { DriverServices } from "./driver.service";
import { sendResponse } from "../../utils/sendResponse";
import User from "../user/user.model";

const showRideRequests = catchAsync(async (req: Request, res: Response) => {
  const user = await DriverServices.findNearbyRides(req.user.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: user,
    message: "User created successfully",
  });
});

const getDriverEarnings = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const rides = await DriverServices.getDriverEarnings(driverId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: rides,
    message: "Earnings history retrieved successfully",
  });
});
export const DriverController = { showRideRequests, getDriverEarnings };
