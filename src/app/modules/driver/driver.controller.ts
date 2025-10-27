/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { DriverServices } from "./driver.service";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";

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
  if (!driverId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Driver not authenticated");
  }
  const rides = await DriverServices.getDriverRideHistory(driverId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: rides,
    message: "Driver ride history retrieved successfully",
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

const getDriverEarningsStats = catchAsync(
  async (req: Request, res: Response) => {
    const driverId = req.user.userId;
    const { timeRange = "monthly" } = req.query;

    if (!driverId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Driver not authenticated");
    }

    const stats = await DriverServices.getDriverEarningsStats(
      driverId,
      timeRange as any
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      data: stats,
      message: "Driver earnings stats fetched successfully",
    });
  }
);

export const DriverController = {
  getDriverRideHistory,
  showRideRequests,
  getDriverEarningsHistory,
  requestApproval,
  getDriverEarningsStats,
};
