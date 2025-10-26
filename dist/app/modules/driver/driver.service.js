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
const getDriverRideHistory = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById("68fc9f1cd23b33b3173c9b8c");
    if (!driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    const historyRides = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                driver: new mongoose_1.default.Types.ObjectId(driverId),
                status: {
                    $in: ["paid", "canceled"],
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "rider",
                foreignField: "_id",
                as: "riderInfo",
            },
        },
        {
            $unwind: "$riderInfo",
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
                },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]);
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
exports.DriverServices = {
    getDriverRideHistory,
    findNearbyRides,
    getDriverEarningsHistory,
    requestApproval,
};
