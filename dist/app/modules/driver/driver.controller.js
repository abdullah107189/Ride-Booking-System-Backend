"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const driver_service_1 = require("./driver.service");
const sendResponse_1 = require("../../utils/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const showRideRequests = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield driver_service_1.DriverServices.findNearbyRides(req.user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: user,
        message: "All Requested ride show successful",
    });
}));
const getDriverEarningsHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const rides = yield driver_service_1.DriverServices.getDriverEarningsHistory(driverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: rides,
        message: "Earnings history retrieved successful",
    });
}));
const getDriverRideHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    if (!driverId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Driver not authenticated");
    }
    const rides = yield driver_service_1.DriverServices.getDriverRideHistory(driverId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        data: rides,
        message: "Driver ride history retrieved successfully",
    });
}));
const requestApproval = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const rides = yield driver_service_1.DriverServices.requestApproval(driverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: rides,
        message: "Request Approval on Admin",
    });
}));
const getDriverEarningsStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const { timeRange = "monthly" } = req.query;
    if (!driverId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Driver not authenticated");
    }
    const stats = yield driver_service_1.DriverServices.getDriverEarningsStats(driverId, timeRange);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: stats,
        message: "Driver earnings stats fetched successfully",
    });
}));
exports.DriverController = {
    getDriverRideHistory,
    showRideRequests,
    getDriverEarningsHistory,
    requestApproval,
    getDriverEarningsStats,
};
