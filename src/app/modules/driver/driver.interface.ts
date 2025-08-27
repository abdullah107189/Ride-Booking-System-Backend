import { Types } from "mongoose";

export enum carTypes {
  car = "car",
  bike = "bike",
  cng = "cng",
}
export interface IVehicleInfo {
  licensePlate: string;
  model: string;
  carType: carTypes;
}

export interface IEarning {
  rideId: Types.ObjectId;
  amount: number;
  date: Date;
}
