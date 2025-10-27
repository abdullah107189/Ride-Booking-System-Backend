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
exports.DriverServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const ride_model_1 = require("../ride/ride.model");
const fareCalculator_1 = require("../../utils/fareCalculator");
const ride_interface_1 = require("../ride/ride.interface");
const user_model_1 = __importDefault(require("../user/user.model"));
const findNearbyRides = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    return { driverId };
});
const getDriverEarningsHistory = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(driverId)) {
        throw new AppError_1.default(400, "Invalid driver ID.");
    }
    const paidRides = yield ride_model_1.Ride.find({
        driver: driverId,
        status: ride_interface_1.RideStatus.paid,
    }).lean();
    if (!paidRides || paidRides.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No paid rides available for this driver.");
    }
    const paidRideDetails = paidRides.map((ride) => {
        const fare = (0, fareCalculator_1.calculateFare)(ride.pickupLocation.location.coordinates, ride.destinationLocation.location.coordinates);
        return {
            rideId: ride._id,
            income: fare,
        };
    });
    return paidRideDetails;
});
const getDriverRideHistory = (driverId_1, ...args_1) => __awaiter(void 0, [driverId_1, ...args_1], void 0, function* (driverId, query = {}) {
    var _a;
    const { page = 1, limit = 10, status, search, startDate, endDate, minFare, maxFare, } = query;
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    // Build match stage
    const matchStage = {
        driver: new mongoose_1.default.Types.ObjectId(driverId),
        status: { $in: ["paid", "canceled", "completed"] }, // Include completed
    };
    // Status filter
    if (status && status !== "all") {
        matchStage.status = status;
    }
    // Date range filter
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate)
            matchStage.createdAt.$gte = new Date(startDate);
        if (endDate)
            matchStage.createdAt.$lte = new Date(endDate);
    }
    // Fare range filter
    if (minFare || maxFare) {
        matchStage.fare = {};
        if (minFare)
            matchStage.fare.$gte = Number(minFare);
        if (maxFare)
            matchStage.fare.$lte = Number(maxFare);
    }
    // Search filter - FIXED
    if (search) {
        matchStage.$or = [
            { "pickupLocation.address": { $regex: search, $options: "i" } },
            { "destinationLocation.address": { $regex: search, $options: "i" } },
        ];
    }
    const aggregationPipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "rider",
                foreignField: "_id",
                as: "riderInfo",
            },
        },
        {
            $unwind: {
                path: "$riderInfo",
                preserveNullAndEmptyArrays: true, // Keep rides even if no rider info
            },
        },
        {
            $project: {
                _id: 1,
                pickupLocation: 1,
                destinationLocation: 1,
                status: 1,
                fare: 1,
                vehicleType: 1,
                paymentMethod: 1,
                statusHistory: 1,
                createdAt: 1,
                updatedAt: 1,
                acceptedAt: 1,
                startedAt: 1,
                completedAt: 1,
                rider: {
                    _id: "$riderInfo._id",
                    name: "$riderInfo.name",
                    email: "$riderInfo.email",
                    phone: "$riderInfo.phone",
                    rating: "$riderInfo.rating",
                },
            },
        },
        { $sort: { createdAt: -1 } },
    ];
    // Add pagination
    const skip = (page - 1) * limit;
    const paginatedPipeline = [
        ...aggregationPipeline,
        { $skip: skip },
        { $limit: parseInt(limit) },
    ];
    const historyRides = yield ride_model_1.Ride.aggregate(paginatedPipeline);
    // Get total count
    const totalResult = yield ride_model_1.Ride.aggregate([
        { $match: matchStage },
        { $count: "total" },
    ]);
    const total = ((_a = totalResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    return {
        driverInfo: {
            _id: driver._id,
            name: driver.name,
            phone: driver.phone,
            totalEarnings: driver.totalEarnings || 0,
            vehicleInfo: driver.vehicleInfo,
            rating: driver.rating,
        },
        history: historyRides,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
});
// src/controllers/driverController.js
const requestApproval = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver || driver.role !== "driver") {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Only drivers can request approval");
    }
    // Check if already approved
    if (driver.isApproved) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver is already approved");
    }
    // Check if already pending
    if (driver.approvalStatus === "pending") {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Approval request is already pending");
    }
    // Update driver status
    const updatedDriver = yield user_model_1.default.findByIdAndUpdate(driverId, {
        approvalStatus: "pending",
        approvalRequestedAt: new Date(),
    }, { new: true });
    // TODO: Send notification to admin
    return updatedDriver;
});
// -----------
const getDriverEarningsStats = (driverId_1, ...args_1) => __awaiter(void 0, [driverId_1, ...args_1], void 0, function* (driverId, timeRange = "monthly") {
    const currentDate = new Date();
    let startDate;
    switch (timeRange) {
        case "daily":
            startDate = new Date(currentDate.setHours(0, 0, 0, 0));
            break;
        case "weekly":
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
            break;
        case "monthly":
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            break;
        default:
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }
    // Get driver's total earnings
    const earningsStats = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                driver: new mongoose_1.default.Types.ObjectId(driverId),
                status: { $in: ["paid"] },
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$fare" },
                totalRides: { $sum: 1 },
                averageEarnings: { $avg: "$fare" },
            },
        },
    ]);
    // Get earnings by date for chart
    const earningsByDate = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                driver: new mongoose_1.default.Types.ObjectId(driverId),
                status: { $in: ["paid"] },
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: timeRange === "daily" ? "%H:00" : "%Y-%m-%d",
                        date: "$createdAt",
                    },
                },
                earnings: { $sum: "$fare" },
                rides: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const result = earningsStats[0] || {
        totalEarnings: 0,
        totalRides: 0,
        averageEarnings: 0,
    };
    return Object.assign(Object.assign({}, result), { earningsByDate,
        timeRange });
});
exports.DriverServices = {
    getDriverRideHistory,
    findNearbyRides,
    getDriverEarningsHistory,
    requestApproval,
    getDriverEarningsStats,
};
