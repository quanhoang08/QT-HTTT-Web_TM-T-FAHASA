import express from "express";
import { authRequired } from "../middleware/auth.js";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { Notification } from "../models/Notification.js";
import { randomOrderNumber } from "../utils/helpers.js";

const router = express.Router();
router.use(authRequired);

router.post("/", async (req, res) => {
  const { shippingInfo, paymentMethod = "COD" } = req.body;
  if (!shippingInfo?.fullName || !shippingInfo?.phone || !shippingInfo?.address) {
    return res.status(400).json({ message: "Missing shipping information" });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const items = cart.items.map((item) => ({
    product: item.product._id,
    title: item.product.title,
    price: item.priceAtAdd,
    quantity: item.quantity
  }));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    orderNumber: randomOrderNumber(),
    user: req.user._id,
    items,
    shippingInfo,
    paymentMethod,
    status: "pending",
    total
  });

  await Notification.create({
    user: req.user._id,
    title: "Đơn hàng đã được tạo",
    message: `Đơn #${order.orderNumber} đã được tiếp nhận`,
    type: "order"
  });

  cart.items = [];
  await cart.save();

  return res.status(201).json(order);
});

router.get("/my-orders", async (req, res) => {
  const items = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json({ items });
});

router.get("/:id", async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  return res.json(order);
});

export default router;
