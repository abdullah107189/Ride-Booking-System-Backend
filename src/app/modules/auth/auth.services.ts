import { IUser } from "../user/user.interface";
import User from "../user/user.model";

const createUser = async (payload: IUser) => {
  const user = await User.create(payload);
  console.log(user);
  return user;
};
export const AuthServices = {
  createUser,
};
