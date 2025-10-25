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

  isApproved?: boolean | undefined;
  isWorking: boolean | undefined;
  approvalStatus?:
    | "not_requested"
    | "pending"
    | "approved"
    | "rejected"
    | undefined;
  approvalRequestedAt?: Date | undefined;
  approvalReviewedAt?: Date | undefined;
  approvedBy?: string | undefined;
  rejectionReason?: string | undefined;

  vehicleInfo?: IVehicleInfo | undefined;
  currentLocation?: ILocation | undefined;

  totalEarnings?: number | undefined;
  earnings?: IEarning[] | undefined;
  rating?: number | undefined;
  totalRides?: number | undefined;
}
