import express from "express";
import { authRequired } from "../middleware/auth.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

const router = express.Router();
router.use(authRequired);

async function ensureCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findOne({ user: userId }).populate("items.product");
  }
  return cart;
}

router.get("/", async (req, res) => {
  const cart = await ensureCart(req.user._id);
  return res.json(cart);
});

router.post("/add", async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart = await ensureCart(req.user._id);
  const index = cart.items.findIndex((item) => String(item.product._id) === String(productId));

  if (index >= 0) {
    cart.items[index].quantity += Number(quantity);
  } else {
    cart.items.push({
      product: product._id,
      quantity: Number(quantity),
      priceAtAdd: product.price
    });
  }

  await cart.save();
  const updated = await Cart.findOne({ user: req.user._id }).populate("items.product");
  return res.status(201).json(updated);
});

router.put("/update", async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await ensureCart(req.user._id);
  const index = cart.items.findIndex((item) => String(item.product._id) === String(productId));

  if (index < 0) {
    return res.status(404).json({ message: "Product not found in cart" });
  }

  cart.items[index].quantity = Math.max(1, Number(quantity || 1));
  await cart.save();
  const updated = await Cart.findOne({ user: req.user._id }).populate("items.product");
  return res.json(updated);
});

router.delete("/remove/:productId", async (req, res) => {
  const cart = await ensureCart(req.user._id);
  cart.items = cart.items.filter(
    (item) => String(item.product._id) !== String(req.params.productId)
  );
  await cart.save();
  const updated = await Cart.findOne({ user: req.user._id }).populate("items.product");
  return res.json(updated);
});

export default router;
