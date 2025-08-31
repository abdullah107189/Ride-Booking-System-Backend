"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnvVariables = () => {
    const requiredEnvVariables = [
        "PORT",
        "DB_URL",
        "NODE_DEV",
        "bcrypt_salt_round",
        "jwt_secret",
        "jwt_expires",
        "jwt_refresh_secret",
        "jwt_refresh_expires",
        // "super_admin_email",
        // "super_admin_pass",
    ];
    requiredEnvVariables.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable :------ ${key}`);
        }
    });
    return {
        DB_URL: process.env.DB_URL,
        PORT: process.env.PORT,
        NODE_DEV: process.env.NODE_DEV,
        bcrypt_salt_round: process.env.bcrypt_salt_round,
        jwt_expires: process.env.jwt_expires,
        jwt_secret: process.env.jwt_secret,
        jwt_refresh_secret: process.env.jwt_refresh_secret,
        jwt_refresh_expires: process.env.jwt_refresh_expires,
        // super_admin_email: process.env.super_admin_email as string,
        // super_admin_pass: process.env.super_admin_pass as string,
    };
};
exports.envVars = loadEnvVariables();
