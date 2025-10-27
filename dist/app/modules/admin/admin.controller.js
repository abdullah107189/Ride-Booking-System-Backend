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
exports.adminController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const admin_services_1 = require("./admin.services");
const changeBlockStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const result = yield admin_services_1.adminServices.changeBlockStatus(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: result,
        message: "Changed block status",
    });
}));
const changeOnlineStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const result = yield admin_services_1.adminServices.changeOnlineStatus(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: result,
        message: `User ${(result === null || result === void 0 ? void 0 : result.isOnline) ? "online" : "offline"} status updated successfully`,
    });
}));
const getAllUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_services_1.adminServices.getAllUser();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        data: result,
        message: "Get All rider or driver",
    });
}));
const getAllRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_services_1.adminServices.getAllRide(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        data: result,
        message: "All ride get successful",
    });
}));
const cancelRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rideId = req.params.id;
    const result = yield admin_services_1.adminServices.cancelRide(rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        data: result,
        message: "Ride canceled by admin",
    });
}));
// ===================status=============
const approveDriver = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.params.id;
    const adminId = req.user.userId;
    const result = yield admin_services_1.adminServices.approveDriver(driverId, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: result,
        message: "Changed approved status",
    });
}));
const rejectDriver = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.params.id;
    const adminId = req.user.userId;
    const result = yield admin_services_1.adminServices.rejectDriver(driverId, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: result,
        message: "Changed approved status",
    });
}));
const getPendingApprovals = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_services_1.adminServices.getPendingApprovals();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: result,
        message: "Get all pending approval",
    });
}));
const getEarningsStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { timeRange = "monthly" } = req.query;
    const stats = yield admin_services_1.adminServices.getEarningsStats(timeRange);
    res.send({
        success: true,
        message: "Earnings stats fetched successfully",
        data: stats,
    });
}));
exports.adminController = {
    changeBlockStatus,
    changeOnlineStatus,
    approveDriver,
    getAllUser,
    getAllRide,
    cancelRide,
    getPendingApprovals,
    rejectDriver,
    getEarningsStats,
};
