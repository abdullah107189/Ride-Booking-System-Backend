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
    message: "Change block status",
  });
});
const changeApproveStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await adminServices.changeApproveStatus(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    data: result,
    message: "Change approved status",
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
export const adminController = {
  changeBlockStatus,
  changeApproveStatus,
  getAllUser,
};
