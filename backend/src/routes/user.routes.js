import express from "express";
import bcrypt from "bcryptjs";
import { authRequired } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();
router.use(authRequired);

router.get("/profile", async (req, res) => {
  return res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role
  });
});

router.put("/profile", async (req, res) => {
  const { name, phone } = req.body;
  req.user.name = name || req.user.name;
  req.user.phone = phone || req.user.phone;
  await req.user.save();
  return res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone
  });
});

router.put("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing password fields" });
  }
  if (!req.user.passwordHash) {
    return res.status(400).json({ message: "Password login is not enabled" });
  }

  const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  req.user.passwordHash = await bcrypt.hash(newPassword, 10);
  await req.user.save();
  return res.json({ message: "Password updated" });
});

router.get("/addresses", async (req, res) => {
  return res.json({ items: req.user.addresses || [] });
});

router.post("/addresses", async (req, res) => {
  const payload = req.body;
  if (!payload.fullName || !payload.phone || !payload.line1 || !payload.city) {
    return res.status(400).json({ message: "Missing required address fields" });
  }

  if (payload.isDefault) {
    req.user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  req.user.addresses.push(payload);
  await req.user.save();
  return res.status(201).json({ items: req.user.addresses });
});

router.put("/addresses/:id", async (req, res) => {
  const item = req.user.addresses.id(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Address not found" });
  }

  if (req.body.isDefault) {
    req.user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  Object.assign(item, req.body);
  await req.user.save();
  return res.json({ items: req.user.addresses });
});

router.delete("/addresses/:id", async (req, res) => {
  const item = req.user.addresses.id(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Address not found" });
  }

  item.deleteOne();
  await req.user.save();
  return res.json({ items: req.user.addresses });
});

router.get("/notifications", async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json({ items });
});

router.put("/notifications/:id/read", async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ message: "Notification not found" });
  }

  return res.json(item);
});

export default router;
