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
exports.AuthServices = void 0;
const user_interface_1 = require("../user/user.interface");
const user_model_1 = __importDefault(require("../user/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const userTokens_1 = require("../../utils/userTokens");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = payload, rest = __rest(payload, ["password"]);
    if (payload.role === user_interface_1.ROLE.admin) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Admin role not allow");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.bcrypt_salt_round));
    const user = yield user_model_1.default.create(Object.assign({ password: hashedPassword }, rest));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = user.toObject(), { password: pass } = _a, result = __rest(_a, ["password"]);
    return result;
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email } = payload;
    // Find user with password field
    const isUser = yield user_model_1.default.findOne({ email }).select("+password");
    if (!isUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    // Check if user is blocked
    if (isUser.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account has been blocked. Please contact support.");
    }
    // Verify password - THIS WAS MISSING
    const isPasswordValid = yield bcryptjs_1.default.compare(password, isUser.password);
    if (!isPasswordValid) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid email or password");
    }
    // Remove sensitive fields based on role
    if (isUser.role === user_interface_1.ROLE.rider) {
        delete isUser.isApproved;
        delete isUser.totalEarnings;
        delete isUser.rating;
        delete isUser.totalRides;
        delete isUser.earnings;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = isUser.toObject(), { password: pass } = _a, result = __rest(_a, ["password"]);
    return result;
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken,
    };
});
exports.AuthServices = {
    createUser,
    loginUser,
    getNewAccessToken,
};
