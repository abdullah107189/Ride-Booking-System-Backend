import { IEarning, IVehicleInfo } from "../driver/driver.interface";

export enum ROLE {
  admin = "admin",
  Ride = "Ride",
  driver = "driver",
}
export type UserStatus = "active" | "blocked";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: ROLE;
  isBlocked: boolean;
  // if driver
  isApproved?: boolean;
  isOnline?: boolean;
  vehicleInfo?: IVehicleInfo;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  totalEarnings?: number;
  earnings?: IEarning[];
  rating?: number;
  totalRides?: number;
}
