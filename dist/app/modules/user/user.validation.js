"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = exports.earningZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const vehicleInfoZodSchema = zod_1.default.object({
    licensePlate: zod_1.default
        .string()
        .nonempty("License Plate is required.")
        .regex(/^[A-Z0-9-]*$/, "Invalid license plate format."),
    model: zod_1.default.string().nonempty("Model is required."),
    carType: zod_1.default.enum(["car", "bike", "cng"]).default("car"),
});
const currentLocationInnerSchema = zod_1.default.object({
    location: zod_1.default
        .object({
        type: zod_1.default.literal("Point"),
        coordinates: zod_1.default.array(zod_1.default.number()).length(2),
    })
        .nullable()
        .optional(),
    address: zod_1.default
        .string()
        .min(5, "Address must be at least 5 characters long.")
        .nonempty("Address is required for location.")
        .optional(),
});
exports.earningZodSchema = zod_1.default.object({
    rideId: zod_1.default.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: "Invalid Ride ID format (expected MongoDB ObjectId)",
    }),
    amount: zod_1.default.number().min(0),
    date: zod_1.default.string().datetime(),
});
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string("Name must be a string.")
        .nonempty("Name is required")
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
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
    phone: zod_1.default
        .string("Phone Number must be a string")
        .regex(/^(?:\+8801|\(8801\)|01)[13-9]\d{8}$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
    role: zod_1.default.enum(["rider", "driver", "admin"], {
        message: "Invalid role specified.",
    }),
    vehicleInfo: vehicleInfoZodSchema.optional(),
    currentLocation: currentLocationInnerSchema.optional(),
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string("Name must be a string.")
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .optional(),
    email: zod_1.default
        .string("Email must be a string.")
        .email("Invalid email address format.")
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." })
        .optional(),
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
    })
        .optional(),
    phone: zod_1.default
        .string("Phone Number must be a string")
        .regex(/^(?:\+8801|\(8801\)|01)[13-9]\d{8}$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    role: zod_1.default.enum(["rider", "driver", "admin"]).optional(),
    isApproved: zod_1.default.boolean().optional(),
    isOnline: zod_1.default.boolean().optional(),
    totalEarnings: zod_1.default.number().optional(),
    earnings: zod_1.default.array(exports.earningZodSchema).optional(),
    rating: zod_1.default.number().min(0).max(5).optional(),
    totalRides: zod_1.default.number().optional(),
    vehicleInfo: vehicleInfoZodSchema.nullable().optional(),
    currentLocation: currentLocationInnerSchema.nullable().optional(),
});
