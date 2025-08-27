import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { DriverServices } from "./driver.services";
import { sendResponse } from "../../utils/sendResponse";
import User from "../user/user.model";


export const DriverController = {
};
