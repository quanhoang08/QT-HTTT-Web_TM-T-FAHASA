import bcrypt from "bcryptjs";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { slugify } from "./helpers.js";

const categoriesSeed = [
  "Sách Tiếng Việt",
  "Sách Ngoại Văn",
  "Sách Kỹ Năng",
  "Sách Tâm Lý",
  "Văn Học",
  "Sách Tâm Linh"
];

const productsSeed = [
  {
    title: "Nghệ Thuật Tư Duy Rành Mạch",
    author: "Rolf Dobelli",
    publisher: "NXB Trẻ",
    image: "/images/NgheTHuatTUduy.webp",
    price: 135000,
    originalPrice: 180000,
    rating: 5,
    discount: 25,
    stock: 80,
    categoryName: "Sách Tiếng Việt"
  },
  {
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    publisher: "NXB Tổng Hợp TP.HCM",
    image: "/images/dacnhantam86.jpg",
    price: 75000,
    originalPrice: 100000,
    rating: 5,
    discount: 25,
    stock: 120,
    categoryName: "Sách Tiếng Việt"
  },
  {
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    publisher: "NXB Thế Giới",
    image: "/images/LichSUNguoi.webp",
    price: 180000,
    originalPrice: 240000,
    rating: 5,
    discount: 25,
    stock: 55,
    categoryName: "Sách Ngoại Văn"
  },
  {
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    publisher: "NXB Văn Học",
    image: "/images/NhaGiaKim.jpg",
    price: 68000,
    originalPrice: 90000,
    rating: 5,
    discount: 24,
    stock: 70,
    categoryName: "Văn Học"
  },
  {
    title: "Muôn Kiếp Nhân Sinh",
    author: "Nguyên Phong",
    publisher: "NXB Tổng Hợp TP.HCM",
    image: "/images/muonkiepnhansinh.png",
    price: 198000,
    originalPrice: 250000,
    rating: 5,
    discount: 21,
    stock: 40,
    categoryName: "Sách Tâm Linh"
  },
  {
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    author: "Rosie Nguyễn",
    publisher: "NXB Hội Nhà Văn",
    image: "/images/TuoiTreDangBaoNhieuwebp.webp",
    price: 85000,
    originalPrice: 110000,
    rating: 5,
    discount: 23,
    stock: 60,
    categoryName: "Sách Kỹ Năng"
  },
  {
    title: "Tôi Tài Giỏi Bạn Cũng Thế",
    author: "Adam Khoo",
    publisher: "NXB Phụ Nữ",
    image: "/images/ToiGioi.webp",
    price: 65000,
    originalPrice: 85000,
    rating: 5,
    discount: 24,
    stock: 75,
    categoryName: "Sách Kỹ Năng"
  },
  {
    title: "Dám Bị Ghét",
    author: "Kishimi Ichiro",
    publisher: "NXB Thế Giới",
    image: "/images/DamBiGhet.webp",
    price: 95000,
    originalPrice: 125000,
    rating: 5,
    discount: 24,
    stock: 85,
    categoryName: "Sách Tâm Lý"
  },
  {
    title: "Càng Kỷ Luật Càng Tự Do",
    author: "Jocko Willink",
    publisher: "NXB Thanh Niên",
    image: "/images/KyLuatTuDo.webp",
    price: 89000,
    originalPrice: 115000,
    rating: 5,
    discount: 23,
    stock: 90,
    categoryName: "Sách Kỹ Năng"
  },
  {
    title: "Hai Số Phận",
    author: "Jeffrey Archer",
    publisher: "NXB Văn Học",
    image: "/images/HaiSoPhan.webp",
    price: 120000,
    originalPrice: 160000,
    rating: 5,
    discount: 25,
    stock: 45,
    categoryName: "Sách Ngoại Văn"
  },
  {
    title: "Khéo Ăn Nói Sẽ Có Được Thiên Hạ",
    author: "Trác Nhã",
    publisher: "NXB Văn Học",
    image: "/images/KheoAnNoi.webp",
    price: 75000,
    originalPrice: 98000,
    rating: 5,
    discount: 23,
    stock: 100,
    categoryName: "Sách Kỹ Năng"
  },
  {
    title: "Quẳng Gánh Lo Đi Và Vui Sống",
    author: "Dale Carnegie",
    publisher: "NXB Tổng Hợp TP.HCM",
    image: "/images/quangganhlodi.jpg",
    price: 72000,
    originalPrice: 95000,
    rating: 5,
    discount: 24,
    stock: 110,
    categoryName: "Sách Tâm Lý"
  }
];

// Helper: trả về Date cách hôm nay `daysAgo` ngày, giờ ngẫu nhiên
function daysAgo(d, hoursOffset = 0) {
  const now = new Date();
  now.setDate(now.getDate() - d);
  now.setHours(hoursOffset, Math.floor(Math.random() * 60), 0, 0);
  return now;
}

export async function seedData() {
  // ─── Categories ───────────────────────────────────────────
  for (const name of categoriesSeed) {
    await Category.updateOne(
      { name },
      { $setOnInsert: { name, slug: slugify(name) } },
      { upsert: true }
    );
  }

  const createdCategories = await Category.find({ name: { $in: categoriesSeed } });
  const categoryMap = new Map(createdCategories.map((c) => [c.name, c._id]));

  // ─── Products ─────────────────────────────────────────────
  for (const item of productsSeed) {
    await Product.updateOne(
      { title: item.title },
      {
        $set: {
          author: item.author,
          publisher: item.publisher,
          image: item.image,
          price: item.price,
          originalPrice: item.originalPrice,
          rating: item.rating,
          discount: item.discount,
          stock: item.stock,
          category: categoryMap.get(item.categoryName)
        }
      },
      { upsert: true }
    );
  }

  // ─── Admin user ───────────────────────────────────────────
  const admin = await User.findOne({ email: "admin@fahasa.com" });
  if (!admin) {
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "Fahasa Admin",
      email: "admin@fahasa.com",
      passwordHash,
      role: "admin"
    });
  }

  // ─── Customer seeds (8 khách hàng) ───────────────────────
  const customerSeeds = [
    { name: "Nguyen Van An",     email: "an.nguyen@fahasa.local",     phone: "0901000001" },
    { name: "Tran Thi Binh",     email: "binh.tran@fahasa.local",     phone: "0901000002" },
    { name: "Le Hoang Long",     email: "long.le@fahasa.local",       phone: "0901000003" },
    { name: "Pham Minh Duc",     email: "duc.pham@fahasa.local",      phone: "0901000004" },
    { name: "Hoang Thi Thu",     email: "thu.hoang@fahasa.local",     phone: "0901000005" },
    { name: "Vo Thanh Nam",      email: "nam.vo@fahasa.local",        phone: "0901000006" },
    { name: "Nguyen Bao Chau",   email: "chau.nguyen@fahasa.local",   phone: "0901000007" },
    { name: "Do Thi Lan Anh",    email: "lanh.do@fahasa.local",       phone: "0901000008" }
  ];

  const customerUsers = [];
  for (const customer of customerSeeds) {
    let existing = await User.findOne({ email: customer.email });
    if (!existing) {
      const passwordHash = await bcrypt.hash("Customer@123", 10);
      existing = await User.create({ ...customer, passwordHash, role: "customer" });
    }
    customerUsers.push(existing);
  }

  // ─── Products (refresh list) ──────────────────────────────
  const products = await Product.find().sort({ createdAt: 1 });
  if (products.length < 6) return;

  // ─── Cart seeds ───────────────────────────────────────────
  await Cart.updateOne(
    { user: customerUsers[0]._id },
    { $set: { items: [
      { product: products[0]._id, quantity: 2, priceAtAdd: products[0].price },
      { product: products[1]._id, quantity: 1, priceAtAdd: products[1].price }
    ]}},
    { upsert: true }
  );
  await Cart.updateOne(
    { user: customerUsers[1]._id },
    { $set: { items: [{ product: products[2]._id, quantity: 1, priceAtAdd: products[2].price }] }},
    { upsert: true }
  );
  await Cart.updateOne(
    { user: customerUsers[2]._id },
    { $set: { items: [{ product: products[3]._id, quantity: 3, priceAtAdd: products[3].price }] }},
    { upsert: true }
  );

  // ─── Order seeds (30 đơn, trải đều 30 ngày) ──────────────
  const existingOrders = await Order.countDocuments();
  if (existingOrders >= 20) return; // đủ dữ liệu trực quan cho admin thì bỏ qua

  const addresses = [
    "Quận 1, TP.HCM",
    "Hà Đông, Hà Nội",
    "Hải Châu, Đà Nẵng",
    "Ninh Kiều, Cần Thơ",
    "Bình Thạnh, TP.HCM",
    "Đống Đa, Hà Nội",
    "Thanh Khê, Đà Nẵng",
    "Thủ Đức, TP.HCM"
  ];

  const statuses = ["pending", "shipping", "completed", "completed", "completed", "cancelled"];
  const paymentMethods = ["COD", "COD", "COD", "VNPAY_MOCK"];

  const seededOrders = [];
  let orderNum = 1;

  // 30 đơn hàng trải trong 30 ngày qua
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    // Mỗi ngày từ 0 đến 3 đơn (ngẫu nhiên)
    const ordersPerDay = [0, 1, 1, 2, 2, 3][Math.floor(Math.random() * 6)];
    for (let j = 0; j < ordersPerDay; j++) {
      const custIdx = (dayOffset + j) % customerUsers.length;
      const cust = customerUsers[custIdx];
      // 1-2 sản phẩm mỗi đơn
      const prod1 = products[(dayOffset + j) % products.length];
      const qty1 = (j % 3) + 1;
      const items = [{ product: prod1._id, title: prod1.title, price: prod1.price, quantity: qty1 }];
      let total = prod1.price * qty1;

      if (j % 2 === 0 && products.length > 6) {
        const prod2 = products[(dayOffset + j + 3) % products.length];
        const qty2 = 1;
        items.push({ product: prod2._id, title: prod2.title, price: prod2.price, quantity: qty2 });
        total += prod2.price * qty2;
      }

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const num = String(orderNum).padStart(3, "0");

      seededOrders.push({
        orderNumber: `FH2026${String(30 - dayOffset).padStart(2,"0")}${num}`,
        user: cust._id,
        items,
        shippingInfo: {
          fullName: cust.name,
          phone: cust.phone || "0901000000",
          address: addresses[custIdx % addresses.length]
        },
        paymentMethod,
        status,
        total,
        createdAt: daysAgo(dayOffset, 8 + j * 3)
      });
      orderNum++;
    }
  }

  // Thêm 3 đơn hàng hôm nay để KPI "doanh thu hôm nay" có data
  for (let k = 0; k < 3; k++) {
    const cust = customerUsers[k % customerUsers.length];
    const prod = products[k % products.length];
    const qty = k + 1;
    const num = String(orderNum).padStart(3, "0");
    seededOrders.push({
      orderNumber: `FH20260424${num}`,
      user: cust._id,
      items: [{ product: prod._id, title: prod.title, price: prod.price, quantity: qty }],
      shippingInfo: {
        fullName: cust.name,
        phone: cust.phone || "0901000000",
        address: addresses[k % addresses.length]
      },
      paymentMethod: "COD",
      status: k === 0 ? "pending" : "shipping",
      total: prod.price * qty,
      createdAt: daysAgo(0, 7 + k * 2)
    });
    orderNum++;
  }

  if (seededOrders.length > 0) {
    await Order.insertMany(seededOrders);
    console.log(`[seed] Inserted ${seededOrders.length} orders`);
  }
}
