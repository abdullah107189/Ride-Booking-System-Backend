import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { Ride } from "./ride.model";
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
    message: "Driver created successfully",
  });
});

export const RideController = {
  createRequest,
};
