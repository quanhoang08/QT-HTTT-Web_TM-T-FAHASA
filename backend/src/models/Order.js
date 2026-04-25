import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const ShippingInfoSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], default: [] },
    shippingInfo: { type: ShippingInfoSchema, required: true },
    paymentMethod: { type: String, enum: ["COD", "VNPAY_MOCK"], default: "COD" },
    status: {
      type: String,
      enum: ["pending", "shipping", "completed", "cancelled"],
      default: "pending"
    },
    total: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);
