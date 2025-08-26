export enum ROLE {
  admin = "admin",
  rider = "rider",
  driver = "driver",
}

export type UserStatus = "active" | "blocked";
export interface IVehicleInfo {
  type: string;
  licensePlate: string;
  model: string;
}
export interface IEarning {
  rideId: string;
  amount: number;
  date: Date;
}
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: ROLE;
  isBlocked: boolean;
}
