import express from "express";
import { Product } from "../models/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    author,
    publisher,
    rating,
    sort = "bestseller",
    page = 1,
    limit = 12
  } = req.query;

  const filters = {};
  if (q) {
    filters.title = { $regex: q, $options: "i" };
  }
  if (category) {
    filters.category = category;
  }
  if (author) {
    filters.author = { $regex: author, $options: "i" };
  }
  if (publisher) {
    filters.publisher = { $regex: publisher, $options: "i" };
  }
  if (rating) {
    filters.rating = { $gte: Number(rating) };
  }

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    bestseller: { soldCount: -1, createdAt: -1 },
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 }
  };

  const numericPage = Number(page) || 1;
  const numericLimit = Number(limit) || 12;
  const skip = (numericPage - 1) * numericLimit;

  const [items, total] = await Promise.all([
    Product.find(filters)
      .populate("category", "name slug")
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(numericLimit),
    Product.countDocuments(filters)
  ]);

  return res.json({
    items,
    paging: {
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit)
    }
  });
});

router.get("/search", async (req, res) => {
  const q = req.query.q || "";
  const items = await Product.find({ title: { $regex: q, $options: "i" } })
    .select("title author publisher image price rating")
    .limit(10);

  return res.json({ items });
});

router.get("/:id", async (req, res) => {
  const item = await Product.findById(req.params.id).populate("category", "name slug");
  if (!item) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(item);
});

export default router;
