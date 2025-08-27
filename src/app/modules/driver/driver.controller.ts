import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { DriverService } from "./driver.service";
import { sendResponse } from "../../utils/sendResponse";

const showRideRequests = catchAsync(async (req: Request, res: Response) => {
  const user = await DriverService.findNearbyRides(req.user.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: user,
    message: "User created successfully",
  });
});
export const DriverController = {
  showRideRequests,
};
