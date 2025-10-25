import { model, Schema } from "mongoose";
import { IUser, ROLE } from "./user.interface";
import { earningSchema, vehicleInfoSchema } from "../driver/driver.model";
import { geoJsonPointSchema } from "../ride/ride.model";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLE), required: true },
    isBlocked: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: true },

    isApproved: { type: Boolean, default: false },
    isWorking: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["not_requested", "pending", "approved", "rejected"],
      default: "not_requested",
    },
    approvalRequestedAt: { type: Date },
    approvalReviewedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Users" },
    rejectionReason: { type: String },

    vehicleInfo: { type: vehicleInfoSchema },
    currentLocation: {
      location: geoJsonPointSchema,
      address: {
        type: String,
      },
    },
    totalEarnings: { type: Number, default: 0 },
    earnings: [earningSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRides: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.pre("save", function (next) {
  if (this.role === ROLE.driver) {
    if (!this.vehicleInfo) {
      return next(new Error("Vehicle Info is required for driver role"));
    }
  } else {
    this.isApproved = undefined;
    this.approvalStatus = undefined;
    this.approvalRequestedAt = undefined;
    this.approvalReviewedAt = undefined;
    this.approvedBy = undefined;
    this.rejectionReason = undefined;

    this.vehicleInfo = undefined;
    this.currentLocation = undefined;
    this.totalEarnings = undefined;
    this.earnings = undefined;
    this.rating = undefined;
    this.totalRides = undefined;
  }
  next();
});

UserSchema.index({ "currentLocation.location": "2dsphere" });
const User = model<IUser>("User", UserSchema);
export default User;
