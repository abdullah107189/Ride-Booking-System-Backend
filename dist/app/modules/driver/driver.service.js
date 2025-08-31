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
exports.DriverServices = { findNearbyRides, getDriverEarningsHistory };
