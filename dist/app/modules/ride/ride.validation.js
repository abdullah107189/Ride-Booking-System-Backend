"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rideZodSchema = void 0;
const zod_1 = require("zod");
const ride_interface_1 = require("./ride.interface");
exports.rideZodSchema = zod_1.z.object({
    rider: zod_1.z.string("Invalid rider ID."),
    driver: zod_1.z.string("Invalid driver ID.").optional(),
    pickupLocation: zod_1.z.object({
        location: zod_1.z.object({
            type: zod_1.z.literal("Point"),
            coordinates: zod_1.z.array(zod_1.z.number()).length(2),
        }),
        address: zod_1.z.string().min(5, "Address must be at least 5 characters long."),
    }),
    destinationLocation: zod_1.z.object({
        location: zod_1.z.object({
            type: zod_1.z.literal("Point"),
            coordinates: zod_1.z.array(zod_1.z.number()).length(2),
        }),
        address: zod_1.z.string().min(5, "Address must be at least 5 characters long."),
    }),
    status: zod_1.z
        .enum(Object.values(ride_interface_1.RideStatus))
        .default(ride_interface_1.RideStatus.requested)
        .optional(),
    statusHistory: zod_1.z
        .array(zod_1.z.object({
        updateStatus: zod_1.z.enum(Object.values(ride_interface_1.RideStatus)),
        timestamp: zod_1.z.string().datetime().optional(),
    }))
        .optional(),
    fare: zod_1.z.number().optional(),
});
