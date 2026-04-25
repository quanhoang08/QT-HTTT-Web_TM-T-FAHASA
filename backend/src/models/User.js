import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    ward: { type: String, default: "" },
    district: { type: String, default: "" },
    city: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    oauthProvider: { type: String, default: "" },
    oauthId: { type: String, default: "" },
    addresses: { type: [AddressSchema], default: [] }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
