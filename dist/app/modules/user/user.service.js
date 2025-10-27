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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../../config/env");
const findMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Not Found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = user.toObject(), { password: pass } = _a, result = __rest(_a, ["password"]);
    if (result && result.role === user_interface_1.ROLE.rider) {
        delete result.isApproved;
        delete result.totalEarnings;
        delete result.rating;
        delete result.totalRides;
        delete result.earnings;
        delete result.isWorking;
        return result;
    }
    return result;
});
const updateOwnProfile = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.default.findById(userId);
    if (!isExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found.");
    }
    const adminOnlyFields = ["isBlocked", "isApproved", "role"];
    const systemOnlyFields = [
        "earnings",
        "totalRides",
        "totalEarnings",
        "rating",
        "createdAt",
        "updatedAt",
    ];
    for (const field of Object.keys(payload)) {
        if (systemOnlyFields.includes(field)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `The field '${field}' is automatically managed and cannot be updated.`);
        }
        if (adminOnlyFields.includes(field)) {
            if (decodedToken.role === user_interface_1.ROLE.driver ||
                decodedToken.role === user_interface_1.ROLE.rider) {
                throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `You are not authorized to update the field: '${field}'`);
            }
        }
    }
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, env_1.envVars.bcrypt_salt_round);
    }
    const newUpdateUser = yield user_model_1.default.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    if (!newUpdateUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found for update.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = newUpdateUser.toObject(), { password } = _a, result = __rest(_a, ["password"]);
    return result;
});
const changeOnlineStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found.");
    }
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { isOnline: !(user === null || user === void 0 ? void 0 : user.isOnline) }, { new: true, runValidators: true }).select("name email isOnline");
    return updatedUser;
});
const changePassword = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword } = payload;
    // Find user
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    // Verify current password - FIXED VERSION
    const isPasswordValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Current password is incorrect");
    }
    // Check if new password is same as current password
    const isSamePassword = yield bcryptjs_1.default.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "New password cannot be the same as current password");
    }
    // Hash new password
    const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.bcrypt_salt_round));
    // Update password
    user.password = hashedNewPassword;
    yield user.save();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = user.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
    return userWithoutPassword;
});
exports.userService = {
    findMe,
    updateOwnProfile,
    changeOnlineStatus,
    changePassword,
};
