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
    message: "All Requested ride show successful",
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
      message: "Earnings history retrieved successful",
    });
  }
);
const getDriverRideHistory = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const rides = await DriverServices.getDriverRideHistory(driverId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: rides,
    message: "Driver ride history retrieved successful",
  });
});
const requestApproval = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const rides = await DriverServices.requestApproval(driverId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: rides,
    message: "Request Approval on Admin",
  });
});

export const DriverController = {
  getDriverRideHistory,
  showRideRequests,
  getDriverEarningsHistory,
  requestApproval,
};
