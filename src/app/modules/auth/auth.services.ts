import { IUser } from "../user/user.interface";
import User from "../user/user.model";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";

const createUser = async (payload: IUser) => {
  const { password, ...rest } = payload;
  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.bcrypt_salt_round)
  );
  const user = await User.create({
    password: hashedPassword,
    ...rest,
  });
  return user;
};
export const AuthServices = {
  createUser,
};
