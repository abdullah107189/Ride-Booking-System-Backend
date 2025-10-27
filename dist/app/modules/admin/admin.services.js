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
exports.adminServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = __importDefault(require("../user/user.model"));
const user_interface_1 = require("../user/user.interface");
const ride_model_1 = require("../ride/ride.model");
const ride_interface_1 = require("../ride/ride.interface");
const changeBlockStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Id not found");
    }
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Not Found");
    }
    if (user.role == user_interface_1.ROLE.admin) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Can't block admin");
    }
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { isBlocked: !(user === null || user === void 0 ? void 0 : user.isBlocked) }, { new: true, runValidators: true }).select("name email isBlocked");
    return updatedUser;
});
const changeOnlineStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User ID not found");
    }
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { isOnline: !user.isOnline }, { new: true, runValidators: true }).select("name email isOnline role");
    return updatedUser;
});
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find({}).sort({ createdAt: -1 });
    if (!users) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Not any rider or driver");
    }
    const totalCountDriver = yield user_model_1.default.countDocuments({ role: user_interface_1.ROLE.driver });
    const totalCountRider = yield user_model_1.default.countDocuments({ role: user_interface_1.ROLE.rider });
    return { users: users, meta: { totalCountDriver, totalCountRider } };
});
const getAllRide = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    var _a;
    const { page = 1, limit = 10, status, riderName, driverName, startDate, endDate, minFare, maxFare, } = query;
    // Build match stage
    const matchStage = {};
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
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "driver",
                foreignField: "_id",
                as: "driverInfo",
            },
        },
        {
            $unwind: {
                path: "$driverInfo",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];
    // Add additional filtering for rider and driver names
    const additionalFilters = [];
    if (riderName) {
        additionalFilters.push({
            "riderInfo.name": { $regex: riderName, $options: "i" },
        });
    }
    if (driverName) {
        additionalFilters.push({
            "driverInfo.name": { $regex: driverName, $options: "i" },
        });
    }
    if (additionalFilters.length > 0) {
        aggregationPipeline.push({
            $match: {
                $and: additionalFilters,
            },
        });
    }
    // Continue with projection and sorting
    aggregationPipeline.push({
        $project: {
            _id: 1,
            pickupLocation: 1,
            destinationLocation: 1,
            status: 1,
            fare: 1,
            statusHistory: 1,
            createdAt: 1,
            updatedAt: 1,
            rider: {
                _id: "$riderInfo._id",
                name: "$riderInfo.name",
                email: "$riderInfo.email",
                phone: "$riderInfo.phone",
                isOnline: "$riderInfo.isOnline",
                isBlocked: "$riderInfo.isBlocked",
            },
            driver: {
                _id: "$driverInfo._id",
                name: "$driverInfo.name",
                email: "$driverInfo.email",
                phone: "$driverInfo.phone",
                isOnline: "$driverInfo.isOnline",
                isBlocked: "$driverInfo.isBlocked",
                isApproved: "$driverInfo.isApproved",
                rating: "$driverInfo.rating",
                totalRides: "$driverInfo.totalRides",
                totalEarnings: "$driverInfo.totalEarnings",
                vehicleInfo: "$driverInfo.vehicleInfo",
                currentLocation: "$driverInfo.currentLocation",
            },
        },
    }, { $sort: { createdAt: -1 } });
    // Add pagination
    const skip = (page - 1) * limit;
    const paginatedPipeline = [
        ...aggregationPipeline,
        { $skip: skip },
        { $limit: parseInt(limit) },
    ];
    const rides = yield ride_model_1.Ride.aggregate(paginatedPipeline);
    // Get total count - SIMPLER VERSION
    const totalMatchStage = Object.assign({}, matchStage);
    let total;
    // If we have name filters, we need to do a separate lookup-based count
    if (additionalFilters.length > 0) {
        // Use the same pipeline but just for counting
        const countPipeline = [
            { $match: totalMatchStage },
            {
                $lookup: {
                    from: "users",
                    localField: "rider",
                    foreignField: "_id",
                    as: "riderInfo",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "driver",
                    foreignField: "_id",
                    as: "driverInfo",
                },
            },
            {
                $match: {
                    $and: additionalFilters,
                },
            },
            { $count: "total" },
        ];
        const totalResult = yield ride_model_1.Ride.aggregate(countPipeline);
        total = ((_a = totalResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    }
    else {
        // Simple count without name filters
        total = yield ride_model_1.Ride.countDocuments(totalMatchStage);
    }
    if (!rides || rides.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No rides found");
    }
    return {
        data: rides,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
});
const cancelRide = (rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const rideInfo = yield ride_model_1.Ride.findById(rideId);
    if (!rideInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
    }
    if (rideInfo.status !== ride_interface_1.RideStatus.completed &&
        rideInfo.status !== ride_interface_1.RideStatus.paid) {
        const updateObject = {
            status: ride_interface_1.RideStatus.canceled,
        };
        const pushUpdateStatus = {
            statusHistory: {
                updateStatus: ride_interface_1.RideStatus.canceled,
                timestamp: new Date(),
            },
        };
        const updateStatus = yield ride_model_1.Ride.findByIdAndUpdate(rideId, {
            $set: updateObject,
            $push: pushUpdateStatus,
        }, {
            new: true,
            runValidators: true,
        });
        return updateStatus;
    }
    else {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Already completed this ride");
    }
});
// status
const approveDriver = (driverId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver || driver.role !== "driver") {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found or invalid role.");
    }
    const updatedDriver = yield user_model_1.default.findByIdAndUpdate(driverId, {
        isApproved: true,
        approvalStatus: "approved",
        approvalReviewedAt: new Date(),
        approvedBy: adminId,
    }, { new: true }).select("-password");
    // TODO: Send notification to driver
    return updatedDriver;
});
const getPendingApprovals = () => __awaiter(void 0, void 0, void 0, function* () {
    const pendingDrivers = yield user_model_1.default.find({
        role: "driver",
        approvalStatus: "pending",
    })
        .select("-password")
        .sort({ approvalRequestedAt: -1 });
    return pendingDrivers;
});
const rejectDriver = (driverId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver || driver.role !== "driver") {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found or invalid role.");
    }
    const updatedDriver = yield user_model_1.default.findByIdAndUpdate(driverId, {
        isApproved: false,
        approvalStatus: "rejected",
        approvalReviewedAt: new Date(),
        approvedBy: adminId,
    }, { new: true }).select("-password");
    return updatedDriver;
});
const getEarningsStats = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (timeRange = "monthly") {
    var _a, _b;
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
    // Get total earnings
    const totalEarnings = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                status: { $in: ["paid"] },
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$fare" },
                count: { $sum: 1 },
            },
        },
    ]);
    // Get earnings by date for chart
    const earningsByDate = yield ride_model_1.Ride.aggregate([
        {
            $match: {
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
    // Get earnings by vehicle type
    const earningsByVehicle = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                status: { $in: ["paid"] },
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: "$vehicleType",
                earnings: { $sum: "$fare" },
                rides: { $sum: 1 },
            },
        },
    ]);
    // Get top drivers
    const topDrivers = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                status: { $in: ["paid"] },
                createdAt: { $gte: startDate },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "driver",
                foreignField: "_id",
                as: "driverInfo",
            },
        },
        {
            $unwind: "$driverInfo",
        },
        {
            $group: {
                _id: "$driver",
                earnings: { $sum: "$fare" },
                rides: { $sum: 1 },
                driverName: { $first: "$driverInfo.name" },
            },
        },
        {
            $sort: { earnings: -1 },
        },
        {
            $limit: 5,
        },
    ]);
    return {
        totalEarnings: ((_a = totalEarnings[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
        totalRides: ((_b = totalEarnings[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
        earningsByDate,
        earningsByVehicle,
        topDrivers,
        timeRange,
    };
});
exports.adminServices = {
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
