"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const zod_1 = require("zod");
const handleErrorDuplicate = (err) => {
    const duplicate = err.message.match(/"([^"]*)"/);
    return {
        statusCode: 401,
        message: `${duplicate[1]} already exist`,
    };
};
const handleCastError = (err) => {
    return {
        statusCode: 401,
        message: "Invalid MongoDB ObjectID. Please provide a valid id",
    };
};
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = `Something went wrong!`;
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message =
            err.issues.map((issue) => issue.message).join(", ") ||
                "Validation failed";
    }
    else if (err.code === 11000) {
        const simplifiedError = handleErrorDuplicate(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    else if (err.name === "CastError") {
        const simplifiedError = handleCastError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        err: env_1.envVars.NODE_DEV == "development" ? err : null,
        stack: env_1.envVars.NODE_DEV == "development" ? err.stack : null,
    });
};
exports.globalErrorHandler = globalErrorHandler;
