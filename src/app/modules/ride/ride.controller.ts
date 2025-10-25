import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { RideService } from "./ride.service";
import User from "../user/user.model";

const createRequest = catchAsync(async (req: Request, res: Response) => {
  const { rider } = req.body;
  const isRider = await User.findById(rider);
  if (!isRider) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider not found !");
  }
  const riderInfo = await RideService.createRequest(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: riderInfo,
    message: "Ride created successful",
  });
});

const findNearbyRides = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const availableRides = await RideService.findNearbyRides(driverId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Filter nearby rides get successful",
  });
});

const getAllHistory = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user.userId;
  const rides = await RideService.getAllHistory(riderId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: rides,
    message: "Get all rides successful",
  });
});

// rider status
const cancelRequest = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user.userId;
  const id = req.params.id;
  const availableRides = await RideService.cancelRequest(riderId, id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request cancel successful",
  });
});
// driver status
const acceptsRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const id = req.params.id;
  const availableRides = await RideService.acceptsRequest(driverId, id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request accepted successful",
  });
});
const picked_upRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const id = req.params.id;
  const availableRides = await RideService.picked_upRequest(driverId, id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request picked up successful",
  });
});
const in_transitRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const id = req.params.id;
  const availableRides = await RideService.in_transitRequest(driverId, id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request in transit successful",
  });
});
const completedRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const id = req.params.id;
  const availableRides = await RideService.completedRequest(driverId, id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request completed successful",
  });
});
const paidRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const id = req.params.id;
  const availableRides = await RideService.paidRequest(driverId, id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request paid successful",
  });
});

const findNearbyDrivers = catchAsync(async (req: Request, res: Response) => {
  const riderInfo = await RideService.findNearbyDrivers(req.params.rideId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: riderInfo,
    message: "Filter nearby drivers get successful",
  });
});

const getDriverRides = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const rides = await RideService.getDriverRides(driverId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: rides,
    message: "Driver rides fetched successfully",
  });
});

const getCurrentRide = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user?.userId;
  if (!riderId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const ride = await RideService.getCurrentRideByRider(riderId);

  res.send({
    success: true,
    message: "Current ride fetched successfully",
    data: ride,
  });
});

const getRideHistory = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user?.userId;
  if (!riderId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const result = await RideService.getRideHistoryByRider(riderId, req.query);

  res.send({
    success: true,
    message: "Ride history fetched successfully",
    data: result.rides,
    pagination: result.pagination,
  });
});
const getRiderStats = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user?.userId;
  if (!riderId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const stats = await RideService.getRiderStats(riderId);

  res.send({
    success: true,
    message: "Rider stats fetched successfully",
    data: stats,
  });
});
export const RideController = {
  createRequest,
  findNearbyRides,
  getAllHistory,
  getCurrentRide,
  getRideHistory,
  getRiderStats,

  // status change
  cancelRequest,
  acceptsRequest,
  picked_upRequest,
  in_transitRequest,
  completedRequest,
  paidRequest,

  // TODO future
  findNearbyDrivers,
  getDriverRides,
};
