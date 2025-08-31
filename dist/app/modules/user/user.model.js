"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const driver_model_1 = require("../driver/driver.model");
const ride_model_1 = require("../ride/ride.model");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values(user_interface_1.ROLE), required: true },
    isBlocked: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: true },
    // Driver specific fields
    isApproved: { type: Boolean, default: false },
    vehicleInfo: { type: driver_model_1.vehicleInfoSchema },
    currentLocation: {
        location: ride_model_1.geoJsonPointSchema,
        address: {
            type: String,
        },
    },
    totalEarnings: { type: Number, default: 0 },
    earnings: [driver_model_1.earningSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRides: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });
// Conditional validation middleware
UserSchema.pre("save", function (next) {
    if (this.role === user_interface_1.ROLE.driver) {
        if (!this.vehicleInfo) {
            return next(new Error("Vehicle Info is required for driver role"));
        }
    }
    else {
        this.isApproved = undefined;
        this.vehicleInfo = undefined;
        this.currentLocation = undefined;
        this.totalEarnings = undefined;
        this.earnings = undefined;
        this.rating = undefined;
        this.totalRides = undefined;
    }
    next();
});
UserSchema.index({ "currentLocation.location": "2dsphere" });
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;
