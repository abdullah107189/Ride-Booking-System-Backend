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
exports.createNewAccessTokenWithRefreshToken = exports.createTokens = void 0;
const env_1 = require("../config/env");
const jwt_1 = require("./jwt");
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createTokens = (user) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, env_1.envVars.jwt_secret, env_1.envVars.jwt_expires);
    const refreshToken = (0, jwt_1.generateToken)(jwtPayload, env_1.envVars.jwt_refresh_secret, env_1.envVars.jwt_refresh_expires);
    return {
        accessToken,
        refreshToken,
    };
};
exports.createTokens = createTokens;
const createNewAccessTokenWithRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedRefreshToken = (0, jwt_1.verifyToken)(refreshToken, env_1.envVars.jwt_refresh_secret);
    const existingUser = yield user_model_1.default.findOne({
        email: verifiedRefreshToken.email,
    });
    if (!existingUser) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email don't exists.");
    }
    if (existingUser.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is Blocked");
    }
    const jwtPayload = {
        userId: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, env_1.envVars.jwt_secret, env_1.envVars.jwt_expires);
    return accessToken;
});
exports.createNewAccessTokenWithRefreshToken = createNewAccessTokenWithRefreshToken;
