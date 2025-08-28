import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { userService } from "./user.service";

const findMe = catchAsync(async (req: Request, res: Response) => {
    
  const riderInfo = await userService.findMe(req.user.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: riderInfo,
    message: "Single data get successful",
  });
});

export const userController = {
  findMe,
};
