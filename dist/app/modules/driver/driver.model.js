"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.earningSchema = exports.vehicleInfoSchema = void 0;
const mongoose_1 = require("mongoose");
const driver_interface_1 = require("./driver.interface");
exports.vehicleInfoSchema = new mongoose_1.Schema({
    licensePlate: { type: String, required: true, uppercase: true },
    model: { type: String, required: true },
    carType: {
        type: String,
        required: true,
        enum: Object.values(driver_interface_1.carTypes),
    },
}, { timestamps: false, versionKey: false, _id: false });
exports.earningSchema = new mongoose_1.Schema({
    rideId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Ride", required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });
