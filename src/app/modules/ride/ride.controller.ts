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
    message: "Ride created successfully",
  });
});

const findNearbyRides = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const availableRides = await RideService.findNearbyRides(driverId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Filter nearby drivers get successful",
  });
});
const getAllHistory = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user.userId;
  const rides = await RideService.getAllHistory(riderId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: rides,
    message: "Get all rides successfully",
  });
});

// rider status
const cancelRequest = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user.userId;
  const rideId = req.params.rideId;
  const availableRides = await RideService.cancelRequest(riderId, rideId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request accepted successful",
  });
});
// driver status
const acceptsRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const rideId = req.params.rideId;
  const availableRides = await RideService.acceptsRequest(driverId, rideId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request accepted successful",
  });
});
const picked_upRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const rideId = req.params.rideId;
  const availableRides = await RideService.picked_upRequest(driverId, rideId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request accepted successful",
  });
});
const in_transitRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const rideId = req.params.rideId;
  const availableRides = await RideService.in_transitRequest(driverId, rideId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request accepted successful",
  });
});
const completedRequest = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId;
  const rideId = req.params.rideId;
  const availableRides = await RideService.completedRequest(driverId, rideId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: availableRides,
    message: "Ride request accepted successful",
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

export const RideController = {
  createRequest,
  findNearbyRides,
  getAllHistory,
  // status change
  cancelRequest,
  acceptsRequest,
  picked_upRequest,
  in_transitRequest,
  completedRequest,

  // TODO future
  findNearbyDrivers,
};
