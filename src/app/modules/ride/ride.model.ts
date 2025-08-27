import { model, Schema } from "mongoose";
import { ILocation, IRide, IStatusHistory, RideStatus } from "./ride.interface";

// Ride Schema
const locationSchema = new Schema<ILocation>({
  address: { type: String, required: true, minlength: 5 },
  coordinates: {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
});

const statusHistorySchema = new Schema<IStatusHistory>({
  updateStatus: {
    type: String,
    required: true,
    enum: Object.values(RideStatus) as string[],
  },
  timestamp: { type: Date, default: Date.now },
});
const rideSchema = new Schema<IRide>(
  {
    rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    pickupLocation: { type: locationSchema, required: true },
    destinationLocation: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: Object.values(RideStatus) as string[],
      default: "requested",
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [{ updateStatus: "requested", timestamp: new Date() }],
    },
  },
  { timestamps: true }
);

// Indexes for performance
rideSchema.index({ Ride: 1 });
rideSchema.index({ driver: 1 });

export const Ride = model<IRide>("Ride", rideSchema);
