import express from "express";
import { authRequired } from "../middleware/auth.js";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";

const router = express.Router();

router.post("/", authRequired, async (req, res) => {
  const { productId, rating, comment, imageUrl = "" } = req.body;
  if (!productId || !rating) {
    return res.status(400).json({ message: "Missing productId or rating" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating: Number(rating),
    comment: comment || "",
    imageUrl
  });

  const allRatings = await Review.find({ product: productId }).select("rating");
  const avg =
    allRatings.reduce((sum, item) => sum + item.rating, 0) /
    Math.max(1, allRatings.length);

  product.rating = Number(avg.toFixed(1));
  await product.save();

  return res.status(201).json(review);
});

router.get("/:productId", async (req, res) => {
  const items = await Review.find({ product: req.params.productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  return res.json({ items });
});

export default router;
