import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminServices } from "./admin.services";

const changeBlockStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const riderInfo = await adminServices.changeBlockStatus(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: riderInfo,
    message: "Single data get successful",
  });
});
export const adminController = {
  changeBlockStatus,
};
