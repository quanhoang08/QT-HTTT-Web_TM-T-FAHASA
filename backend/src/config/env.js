import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/fahasa",
  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:8080/api/auth/google/callback",
  facebookAppId: process.env.FACEBOOK_APP_ID || "",
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET || "",
  facebookCallbackUrl:
    process.env.FACEBOOK_CALLBACK_URL ||
    "http://localhost:8080/api/auth/facebook/callback",
  seedOnStart: String(process.env.SEED_ON_START || "true") === "true"
};
