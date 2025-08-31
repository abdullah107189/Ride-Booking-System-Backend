"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAuthZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.loginAuthZodSchema = zod_1.default.object({
    email: zod_1.default
        .string("Email must be a string.")
        .email("Invalid email address format.")
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    password: zod_1.default
        .string("Password must be a string.")
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
    })
        .regex(/(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least 1 special character.",
    })
        .regex(/(?=.*\d)/, {
        message: "Password must contain at least 1 number.",
    }),
});
