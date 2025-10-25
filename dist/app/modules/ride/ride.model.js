"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ride = exports.geoJsonPointSchema = void 0;
const mongoose_1 = require("mongoose");
const ride_interface_1 = require("./ride.interface");
// GeoJSON Point Schema
exports.geoJsonPointSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["Point"],
        default: "Point",
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
    },
}, { _id: false, versionKey: false });
const statusHistorySchema = new mongoose_1.Schema({
    updateStatus: {
        type: String,
        required: true,
        enum: Object.values(ride_interface_1.RideStatus),
    },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: false, _id: false, versionKey: false });
const rideSchema = new mongoose_1.Schema({
    rider: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    pickupLocation: {
        location: exports.geoJsonPointSchema,
        address: {
            type: String,
            required: true,
        },
    },
    destinationLocation: {
        location: exports.geoJsonPointSchema,
        address: {
            type: String,
            required: true,
        },
    },
    status: {
        type: String,
        enum: Object.values(ride_interface_1.RideStatus),
        default: ride_interface_1.RideStatus.requested,
    },
    statusHistory: {
        type: [statusHistorySchema],
        default: [{ updateStatus: "requested", timestamp: new Date() }],
    },
    fare: { type: Number },
}, { timestamps: true });
rideSchema.index({ "pickupLocation.location": "2dsphere" });
exports.Ride = (0, mongoose_1.model)("Ride", rideSchema);
