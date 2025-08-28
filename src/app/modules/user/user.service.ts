import User from "./user.model";
import AppError from "../../errorHelpers/AppError";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { IUser, ROLE } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
const findMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Not Found");
  }
  const { password: pass, ...result } = user.toObject();
  if (result && result.role === ROLE.rider) {
    delete result.isApproved;
    delete result.isOnline;
    delete result.totalEarnings;
    delete result.rating;
    delete result.totalRides;
    delete result.earnings;
    return result;
  }
  return result;
};
const updateOwnProfile = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  console.log(payload);
  const isExist = await User.findById(userId);

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  // ✅ অ্যাডমিন-এর জন্য সীমাবদ্ধ ফিল্ড
  const adminOnlyFields = ["isBlocked", "isApproved", "role"];

  // ✅ সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে আপডেটেড ফিল্ড
  const systemOnlyFields = [
    "earnings",
    "totalRides",
    "totalEarnings",
    "rating",
    "createdAt",
    "updatedAt",
  ];

  for (const field of Object.keys(payload)) {
    // যদি কোনো ব্যবহারকারী সিস্টেম-জেনারেটেড ফিল্ড পরিবর্তন করতে চায়, তাহলে ত্রুটি দাও
    if (systemOnlyFields.includes(field)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `The field '${field}' is automatically managed and cannot be updated.`
      );
    }

    // যদি কোনো রাইডার বা ড্রাইভার অ্যাডমিন-নির্দিষ্ট ফিল্ড পরিবর্তন করতে চায়, তাহলে ত্রুটি দাও
    if (adminOnlyFields.includes(field)) {
      if (
        decodedToken.role === ROLE.driver ||
        decodedToken.role === ROLE.rider
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `You are not authorized to update the field: '${field}'`
        );
      }
    }
  }

  // পাসওয়ার্ড আপডেটের লজিক
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.bcrypt_salt_round
    );
  }

  const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  if (!newUpdateUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found for update.");
  }

  const { password, ...result } = newUpdateUser.toObject();
  return result;
};

export const userService = {
  findMe,
  updateOwnProfile,
};
