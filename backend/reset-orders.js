/**
 * Script: reset-orders.js
 * Xóa tất cả đơn hàng cũ để seed lại dữ liệu mẫu phong phú hơn.
 * Chạy: node reset-orders.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Order } from "./src/models/Order.js";
import { User } from "./src/models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fahasa";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  const deletedOrders = await Order.deleteMany({});
  console.log(`Deleted ${deletedOrders.deletedCount} orders`);

  // Xóa customers cũ để seed lại 8 customers mới
  const deletedCustomers = await User.deleteMany({ role: "customer" });
  console.log(`Deleted ${deletedCustomers.deletedCount} customers`);

  console.log("Done! Restart the backend to re-seed data.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
