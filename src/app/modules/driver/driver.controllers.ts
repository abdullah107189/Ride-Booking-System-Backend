import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { DriverServices } from "./driver.service";
import { sendResponse } from "../../utils/sendResponse";

const showRideRequests = catchAsync(async (req: Request, res: Response) => {
  const user = await DriverServices.findNearbyRides(req.user.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: user,
    message: "User created successfully",
  });
});

const getDriverEarningsHistory = catchAsync(
  async (req: Request, res: Response) => {
    const driverId = req.user.userId;
    const rides = await DriverServices.getDriverEarningsHistory(driverId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      data: rides,
      message: "Earnings history retrieved successfully",
    });
  }
);
export const DriverController = { showRideRequests, getDriverEarningsHistory };
