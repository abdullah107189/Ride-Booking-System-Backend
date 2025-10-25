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
exports.RideController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
const ride_service_1 = require("./ride.service");
const user_model_1 = __importDefault(require("../user/user.model"));
const createRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rider } = req.body;
    const isRider = yield user_model_1.default.findById(rider);
    if (!isRider) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Rider not found !");
    }
    const riderInfo = yield ride_service_1.RideService.createRequest(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: riderInfo,
        message: "Ride created successful",
    });
}));
const findNearbyRides = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const availableRides = yield ride_service_1.RideService.findNearbyRides(driverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: availableRides,
        message: "Filter nearby rides get successful",
    });
}));
const getAllHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderId = req.user.userId;
    const rides = yield ride_service_1.RideService.getAllHistory(riderId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: rides,
        message: "Get all rides successful",
    });
}));
// rider status
const cancelRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderId = req.user.userId;
    const id = req.params.id;
    const availableRides = yield ride_service_1.RideService.cancelRequest(riderId, id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: availableRides,
        message: "Ride request cancel successful",
    });
}));
// driver status
const acceptsRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const id = req.params.id;
    const availableRides = yield ride_service_1.RideService.acceptsRequest(driverId, id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: availableRides,
        message: "Ride request accepted successful",
    });
}));
const picked_upRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const id = req.params.id;
    const availableRides = yield ride_service_1.RideService.picked_upRequest(driverId, id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: availableRides,
        message: "Ride request picked up successful",
    });
}));
const in_transitRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const id = req.params.id;
    const availableRides = yield ride_service_1.RideService.in_transitRequest(driverId, id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: availableRides,
        message: "Ride request in transit successful",
    });
}));
const completedRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const id = req.params.id;
    const availableRides = yield ride_service_1.RideService.completedRequest(driverId, id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: availableRides,
        message: "Ride request completed successful",
    });
}));
const paidRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const id = req.params.id;
    const availableRides = yield ride_service_1.RideService.paidRequest(driverId, id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: availableRides,
        message: "Ride request paid successful",
    });
}));
const findNearbyDrivers = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderInfo = yield ride_service_1.RideService.findNearbyDrivers(req.params.rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        data: riderInfo,
        message: "Filter nearby drivers get successful",
    });
}));
const getDriverRides = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.user.userId;
    const rides = yield ride_service_1.RideService.getDriverRides(driverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        data: rides,
        message: "Driver rides fetched successfully",
    });
}));
const getCurrentRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const riderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!riderId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "User not authenticated");
    }
    const ride = yield ride_service_1.RideService.getCurrentRideByRider(riderId);
    res.send({
        success: true,
        message: "Current ride fetched successfully",
        data: ride,
    });
}));
const getRideHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const riderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!riderId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield ride_service_1.RideService.getRideHistoryByRider(riderId, req.query);
    res.send({
        success: true,
        message: "Ride history fetched successfully",
        data: result.rides,
        pagination: result.pagination,
    });
}));
const getRiderStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const riderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!riderId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "User not authenticated");
    }
    const stats = yield ride_service_1.RideService.getRiderStats(riderId);
    res.send({
        success: true,
        message: "Rider stats fetched successfully",
        data: stats,
    });
}));
exports.RideController = {
    createRequest,
    findNearbyRides,
    getAllHistory,
    getCurrentRide,
    getRideHistory,
    getRiderStats,
    // status change
    cancelRequest,
    acceptsRequest,
    picked_upRequest,
    in_transitRequest,
    completedRequest,
    paidRequest,
    // TODO future
    findNearbyDrivers,
    getDriverRides,
};
