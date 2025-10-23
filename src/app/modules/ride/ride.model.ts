import { model, Schema } from "mongoose";
import { IRide, IStatusHistory, RideStatus } from "./ride.interface";

// GeoJSON Point Schema
export const geoJsonPointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  { _id: false, versionKey: false }
);

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    updateStatus: {
      type: String,
      required: true,
      enum: Object.values(RideStatus) as string[],
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false, _id: false, versionKey: false }
);

const rideSchema = new Schema<IRide>(
  {
    rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "User", default: null },

    pickupLocation: {
      location: geoJsonPointSchema,
      address: {
        type: String,
        required: true,
      },
    },
    destinationLocation: {
      location: geoJsonPointSchema,
      address: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(RideStatus) as string[],
      default: RideStatus.requested,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [{ updateStatus: "requested", timestamp: new Date() }],
    },
    fare: { type: Number },
  },
  { timestamps: true }
);
rideSchema.index({ "pickupLocation.location": "2dsphere" });
export const Ride = model<IRide>("Ride", rideSchema);
