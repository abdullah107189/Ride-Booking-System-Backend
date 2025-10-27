/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminServices } from "./admin.services";

const changeBlockStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await adminServices.changeBlockStatus(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: result,
    message: "Changed block status",
  });
});
const changeOnlineStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await adminServices.changeOnlineStatus(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: result,
    message: `User ${
      result?.isOnline ? "online" : "offline"
    } status updated successfully`,
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllUser();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: "Get All rider or driver",
  });
});
const getAllRide = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllRide(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: "All ride get successful",
  });
});
const cancelRide = catchAsync(async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const result = await adminServices.cancelRide(rideId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: "Ride canceled by admin",
  });
});
// ===================status=============
const approveDriver = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.params.id;
  const adminId = req.user.userId;
  const result = await adminServices.approveDriver(driverId, adminId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: result,
    message: "Changed approved status",
  });
});
const rejectDriver = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.params.id;
  const adminId = req.user.userId;

  const result = await adminServices.rejectDriver(driverId, adminId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: result,
    message: "Changed approved status",
  });
});
const getPendingApprovals = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getPendingApprovals();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: result,
    message: "Get all pending approval",
  });
});

const getEarningsStats = catchAsync(async (req: Request, res: Response) => {
  const { timeRange = "monthly" } = req.query;

  const stats = await adminServices.getEarningsStats(timeRange as any);

  res.send({
    success: true,
    message: "Earnings stats fetched successfully",
    data: stats,
  });
});
export const adminController = {
  changeBlockStatus,
  changeOnlineStatus,
  approveDriver,
  getAllUser,
  getAllRide,
  cancelRide,
  getPendingApprovals,
  rejectDriver,
  getEarningsStats,
};
