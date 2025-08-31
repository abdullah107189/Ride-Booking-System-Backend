import { IEarning, IVehicleInfo } from "../driver/driver.interface";
import { ILocation } from "../ride/ride.interface";

export enum ROLE {
  admin = "admin",
  rider = "rider",
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
  isOnline: boolean;
  
  // if driver
  isApproved?: boolean;
  vehicleInfo?: IVehicleInfo;
  currentLocation?: ILocation; // [longitude, latitude]
  totalEarnings?: number;
  earnings?: IEarning[];
  rating?: number;
  totalRides?: number;
}
