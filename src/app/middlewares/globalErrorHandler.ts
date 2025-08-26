/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { ZodError } from "zod";
import mongoose from "mongoose";
const handleErrorDuplicate = (err: any) => {
  const duplicate = err.message.match(/"([^"]*)"/);
  return {
    statusCode: 401,
    message: `${duplicate[1]} already exist`,
  };
};
const handleCastError = (err: mongoose.Error) => {
  return {
    statusCode: 401,
    message: "Invalid MongoDB ObjectID. Please provide a valid id",
  };
};
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = `Something went wrong!`;

  if (err instanceof ZodError) {
    statusCode = 400;
    message =
      err.issues.map((issue) => issue.message).join(", ") ||
      "Validation failed";
  } else if (err.code === 11000) {
    const simplifiedError = handleErrorDuplicate(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    message,
    err: envVars.NODE_DEV == "development" ? err : null,
    stack: envVars.NODE_DEV == "development" ? err.stack : null,
  });
};
