import express from "express";
import { authRequired, adminRequired } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Category } from "../models/Category.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { slugify } from "../utils/helpers.js";

const router = express.Router();
router.use(authRequired, adminRequired);

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildDateRange(period) {
  const now = new Date();
  const start = new Date(now);
  let groupBy = "%d/%m";

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
    groupBy = "%H:00";
  } else if (period === "week") {
    const day = now.getDay() || 7;
    start.setDate(now.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    groupBy = "%d/%m";
  } else if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    groupBy = "%d/%m";
  } else {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    groupBy = "%m/%Y";
  }

  return { now, start, groupBy };
}

router.get("/dashboard", async (req, res) => {
  const period = String(req.query.period || "month");
  const { start, now, groupBy } = buildDateRange(period);

  const [series, totalOrders, totalProducts, totalCustomers, recentOrders] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: now },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy,
              date: "$createdAt",
              timezone: "Asia/Ho_Chi_Minh"
            }
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  const todayStart = startOfDay(new Date());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - ((todayStart.getDay() || 7) - 1));
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const yearStart = new Date(todayStart.getFullYear(), 0, 1);

  const [todayRevenue, weekRevenue, monthRevenue, yearRevenue] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, value: { $sum: "$total" } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: weekStart }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, value: { $sum: "$total" } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, value: { $sum: "$total" } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: yearStart }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, value: { $sum: "$total" } } }
    ])
  ]);

  return res.json({
    period,
    kpi: {
      revenueToday: todayRevenue[0]?.value || 0,
      revenueWeek: weekRevenue[0]?.value || 0,
      revenueMonth: monthRevenue[0]?.value || 0,
      revenueYear: yearRevenue[0]?.value || 0,
      totalOrders,
      totalProducts,
      totalCustomers
    },
    recentOrders: recentOrders.map((order) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.user?.name || "Khách hàng",
      createdAt: order.createdAt,
      total: order.total,
      status: order.status
    })),
    series: series.map((item) => ({
      label: item._id,
      revenue: item.revenue,
      orders: item.orders
    }))
  });
});

router.get("/products", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } }
    ];
  }

  const [items, total] = await Promise.all([
    Product.find(query).populate("category", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(query)
  ]);

  return res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});

router.post("/products", async (req, res) => {
  const payload = req.body;
  if (!payload.category) {
    return res.status(400).json({ message: "Category is required" });
  }
  const item = await Product.create(payload);
  return res.status(201).json(item);
});

router.put("/products/:id", async (req, res) => {
  const item = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(item);
});

router.delete("/products/:id", async (req, res) => {
  const item = await Product.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json({ message: "Deleted" });
});

router.get("/orders", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.orderNumber = { $regex: search, $options: "i" };
  }

  const [items, total] = await Promise.all([
    Order.find(query).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(query)
  ]);

  return res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});

router.get("/orders/:id", async (req, res) => {
  const item = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("items.product", "title image");
  if (!item) {
    return res.status(404).json({ message: "Order not found" });
  }
  return res.json(item);
});

router.get("/customers", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const skip = (page - 1) * limit;

  const query = { role: "customer" };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query).select("name email phone createdAt").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query)
  ]);

  return res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});

router.put("/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  const item = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!item) {
    return res.status(404).json({ message: "Order not found" });
  }

  await Notification.create({
    user: item.user,
    title: "Cập nhật đơn hàng",
    message: `Đơn #${item.orderNumber} đã chuyển sang trạng thái ${status}`,
    type: "order"
  });

  return res.json(item);
});

router.post("/categories", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const item = await Category.create({ name, slug: slugify(name) });
  return res.status(201).json(item);
});

export default router;
