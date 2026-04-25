import express from "express";
import { Category } from "../models/Category.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Category.find().sort({ name: 1 });
  return res.json({ items });
});

export default router;
