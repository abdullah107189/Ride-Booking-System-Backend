import { Schema } from "mongoose";
import { carTypes, IEarning, IVehicleInfo } from "./driver.interface";

export const vehicleInfoSchema = new Schema<IVehicleInfo>(
  {
    licensePlate: { type: String, required: true, uppercase: true },
    model: { type: String, required: true },
    carType: {
      type: String,
      required: true,
      enum: Object.values(carTypes) as string[],
    },
  },
  { timestamps: false, versionKey: false, _id: false }
);

export const earningSchema = new Schema<IEarning>(
  {
    rideId: { type: Schema.Types.ObjectId, ref: "Ride", required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);
