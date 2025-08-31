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
const changeApproveStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Id not found");
    }
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Not Found");
    }
    if (user.role !== user_interface_1.ROLE.driver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Only for driver role");
    }
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { isApproved: !(user === null || user === void 0 ? void 0 : user.isApproved) }, { new: true, runValidators: true }).select("name email isApproved");
    return updatedUser;
});
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find({});
    if (!users) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Not any rider or driver");
    }
    const totalCountDriver = yield user_model_1.default.countDocuments({ role: user_interface_1.ROLE.driver });
    const totalCountRider = yield user_model_1.default.countDocuments({ role: user_interface_1.ROLE.rider });
    return { users: users, meta: { totalCountDriver, totalCountRider } };
});
const getAllRide = () => __awaiter(void 0, void 0, void 0, function* () {
    const rides = yield ride_model_1.Ride.find({});
    if (!rides) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Not any rider or driver");
    }
    const totalCount = yield ride_model_1.Ride.countDocuments();
    return { data: rides, meta: totalCount };
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
exports.adminServices = {
    changeBlockStatus,
    changeApproveStatus,
    getAllUser,
    getAllRide,
    cancelRide,
};
