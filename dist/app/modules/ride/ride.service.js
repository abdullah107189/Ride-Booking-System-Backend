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
exports.RideService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const fareCalculator_1 = require("../../utils/fareCalculator");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = __importDefault(require("../user/user.model"));
const ride_interface_1 = require("./ride.interface");
const ride_model_1 = require("./ride.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createRequest = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const activeRide = yield ride_model_1.Ride.findOne({
        rider: payload.rider,
        status: {
            $in: [
                ride_interface_1.RideStatus.requested,
                ride_interface_1.RideStatus.accepted,
                ride_interface_1.RideStatus.picked_up,
                ride_interface_1.RideStatus.in_transit,
            ],
        },
    });
    if (activeRide) {
        throw new Error("You already have an active ride request or are on a ride.");
    }
    const createRide = yield ride_model_1.Ride.create(payload);
    return createRide;
});
// find 5km under riders
const findNearbyRides = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(userId);
    if (!driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    if (!driver.currentLocation ||
        (driver.currentLocation.location.coordinates[0] === 0 &&
            driver.currentLocation.location.coordinates[1] === 0)) {
        throw new Error("Please update your location to find nearby rides.");
    }
    const longitude = driver.currentLocation.location.coordinates[0];
    const latitude = driver.currentLocation.location.coordinates[1];
    const maxDistance = 5;
    const nearbyRides = yield ride_model_1.Ride.find({
        status: "requested",
        "pickupLocation.location": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                $maxDistance: maxDistance * 1000, // 5km = 5000m
            },
        },
    });
    return nearbyRides;
});
const getAllHistory = (riderId) => __awaiter(void 0, void 0, void 0, function* () {
    const isRide = yield ride_model_1.Ride.find({ rider: riderId });
    if (!isRide) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found !");
    }
    return isRide;
});
const cancelRequest = (riderId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const rider = yield user_model_1.default.findById(riderId);
    if (!rider) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Rider not found.");
    }
    const rideInfo = yield ride_model_1.Ride.findById(rideId);
    if (!rideInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
    }
    if (rideInfo.status == ride_interface_1.RideStatus.requested) {
        if (rider.role !== user_interface_1.ROLE.rider || rider.isBlocked) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Rider not authorized");
        }
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "allow only request rides.");
    }
});
// driver control
const acceptsRequest = (driverId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    const rideInfo = yield ride_model_1.Ride.findById(rideId);
    if (!rideInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
    }
    if (rideInfo.status == ride_interface_1.RideStatus.requested) {
        if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Driver not authorized");
        }
        const updateObject = {
            driver: driverId,
            status: ride_interface_1.RideStatus.accepted,
        };
        const pushUpdateStatus = {
            statusHistory: { updateStatus: "accepted", timestamp: new Date() },
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "allow only request rides.");
    }
});
const picked_upRequest = (driverId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    const rideInfo = yield ride_model_1.Ride.findById(rideId);
    if (!rideInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
    }
    if (rideInfo.status == ride_interface_1.RideStatus.accepted) {
        if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Driver not authorized");
        }
        const updateObject = {
            driver: driverId,
            status: ride_interface_1.RideStatus.picked_up,
        };
        const pushUpdateStatus = {
            statusHistory: { updateStatus: "picked_up", timestamp: new Date() },
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "allow only accepted rides.");
    }
});
const in_transitRequest = (driverId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    const rideInfo = yield ride_model_1.Ride.findById(rideId);
    if (!rideInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
    }
    if (rideInfo.status == ride_interface_1.RideStatus.picked_up) {
        if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Driver not authorized");
        }
        const updateObject = {
            driver: driverId,
            status: ride_interface_1.RideStatus.in_transit,
        };
        const pushUpdateStatus = {
            statusHistory: {
                updateStatus: ride_interface_1.RideStatus.in_transit,
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "allow only picked_up rides.");
    }
});
const completedRequest = (driverId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    const rideInfo = yield ride_model_1.Ride.findById(rideId);
    if (!rideInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
    }
    if (rideInfo.status == ride_interface_1.RideStatus.in_transit) {
        if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Driver not authorized");
        }
        const updateObject = {
            driver: driverId,
            status: ride_interface_1.RideStatus.completed,
        };
        const pushUpdateStatus = {
            statusHistory: {
                updateStatus: ride_interface_1.RideStatus.completed,
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "allow only in_transit rides.");
    }
});
const paidRequest = (driverId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield user_model_1.default.findById(driverId);
    if (!driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    const rideInfo = yield ride_model_1.Ride.findById(rideId);
    if (!rideInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
    }
    if (rideInfo.status == ride_interface_1.RideStatus.completed) {
        if (driver.role !== "driver" || !driver.isApproved || !driver.isOnline) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Driver not authorized");
        }
        const updateObject = {
            driver: driverId,
            status: ride_interface_1.RideStatus.paid,
        };
        const pushUpdateStatus = {
            statusHistory: {
                updateStatus: ride_interface_1.RideStatus.paid,
                timestamp: new Date(),
            },
        };
        // increase total earning
        let totalEarnings = 0;
        const fare = (0, fareCalculator_1.calculateFare)(rideInfo.pickupLocation.location.coordinates, rideInfo.destinationLocation.location.coordinates);
        totalEarnings += fare; // total earn sum
        yield user_model_1.default.findByIdAndUpdate(driverId, {
            $inc: { totalEarnings },
        });
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "allow only in_transit rides.");
    }
});
//TODO future, when create notification system
const findNearbyDrivers = (rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const isRide = yield ride_model_1.Ride.findById(rideId);
    if (!isRide) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
    }
    if (!isRide.pickupLocation ||
        ((isRide === null || isRide === void 0 ? void 0 : isRide.pickupLocation.location.coordinates[0]) === 0 &&
            (isRide === null || isRide === void 0 ? void 0 : isRide.pickupLocation.location.coordinates[1]) === 0)) {
        throw new Error("Please update your location to find nearby rides.");
    }
    const longitude = isRide.pickupLocation.location.coordinates[0];
    const latitude = isRide.pickupLocation.location.coordinates[1];
    const maxDistance = 5;
    const nearbyRides = yield user_model_1.default.find({
        role: "driver",
        "currentLocation.location": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                $maxDistance: maxDistance * 1000,
            },
        },
    });
    return nearbyRides;
});
exports.RideService = {
    createRequest,
    findNearbyRides,
    getAllHistory,
    // status change
    cancelRequest,
    acceptsRequest,
    picked_upRequest,
    in_transitRequest,
    completedRequest,
    paidRequest,
    // TODO future
    findNearbyDrivers,
};
