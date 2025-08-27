import { IUser } from "../user/user.interface";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { createTokens } from "../../utils/userTokens";
import User from "../user/user.model";
const showRideRequests = async () => {};

export const DriverService = {
  showRideRequests,
};
