import express from "express";
import cors from "cors";
import passport from "passport";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { seedData } from "./utils/seed.js";

const app = express();

// Danh sách origin được phép (bao gồm Vercel production + preview deployments)
const allowedOrigins = [
  env.frontendUrl,
  "http://localhost:5173",
  "http://localhost:5180",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5180",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Cho phép tất cả subdomain của vercel.app (preview deployments)
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      // Kiểm tra danh sách allowedOrigins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "fahasa-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  try {
    await connectDb(env.mongoUri);
    if (env.seedOnStart) {
      await seedData();
    }

    app.listen(env.port, () => {
      console.log(`Backend running at http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap backend", error);
    process.exit(1);
  }
}

bootstrap();
