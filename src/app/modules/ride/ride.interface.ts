import { Types } from "mongoose";
export enum RideStatus {
  requested = "requested",
  accepted = "accepted",
  picked_up = "picked_up",
  in_transit = "in_transit",
  completed = "completed",
  canceled = "canceled",
  payment = "payment",
}
export interface IGeoJSONPoint extends Document {
  type: "Point";
  coordinates: [number, number];
}
export interface ILocation {
  location: IGeoJSONPoint;
  address: string;
}

export interface IStatusHistory {
  updateStatus: string;
  timestamp: Date;
}

export interface IRide extends Document {
  rider: Types.ObjectId;
  driver?: Types.ObjectId;
  pickupLocation: ILocation;
  destinationLocation: ILocation;
  status: RideStatus;
  statusHistory: IStatusHistory[];
}
