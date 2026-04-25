import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { signAccessToken } from "../utils/jwt.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

const hasGoogleOAuth = Boolean(env.googleClientId && env.googleClientSecret);
const hasFacebookOAuth = Boolean(env.facebookAppId && env.facebookAppSecret);
if (hasGoogleOAuth) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          let user = await User.findOne({
            $or: [{ oauthId: profile.id }, { email }]
          });

          if (!user) {
            user = await User.create({
              name: profile.displayName || "Google User",
              email,
              oauthProvider: "google",
              oauthId: profile.id,
              role: "customer"
            });
          } else if (!user.oauthId) {
            user.oauthProvider = "google";
            user.oauthId = profile.id;
            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

if (hasFacebookOAuth) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: env.facebookAppId,
        clientSecret: env.facebookAppSecret,
        callbackURL: env.facebookCallbackUrl,
        profileFields: ["id", "displayName", "emails"]
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.id}@facebook.local`;
          let user = await User.findOne({
            $or: [{ oauthId: profile.id }, { email }]
          });

          if (!user) {
            user = await User.create({
              name: profile.displayName || "Facebook User",
              email,
              oauthProvider: "facebook",
              oauthId: profile.id,
              role: "customer"
            });
          } else if (!user.oauthId) {
            user.oauthProvider = "facebook";
            user.oauthId = profile.id;
            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    phone: phone || ""
  });

  const token = signAccessToken({ userId: user._id, role: user.role }, env.jwtSecret);
  return res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signAccessToken({ userId: user._id, role: user.role }, env.jwtSecret);
  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

router.get("/google", (req, res, next) => {
  if (!hasGoogleOAuth) {
    return res.status(501).json({ message: "Google OAuth is not configured" });
  }
  return passport.authenticate("google", { scope: ["profile", "email"], session: false })(
    req,
    res,
    next
  );
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!hasGoogleOAuth) {
      return res.status(501).json({ message: "Google OAuth is not configured" });
    }
    return passport.authenticate("google", { session: false, failureRedirect: env.frontendUrl })(
      req,
      res,
      next
    );
  },
  async (req, res) => {
    const user = req.user;
    const token = signAccessToken({ userId: user._id, role: user.role }, env.jwtSecret);
    const redirectUrl = `${env.frontendUrl}?oauth=success&token=${token}`;
    return res.redirect(redirectUrl);
  }
);

router.get("/facebook", (req, res, next) => {
  if (!hasFacebookOAuth) {
    return res.status(501).json({ message: "Facebook OAuth is not configured" });
  }
  return passport.authenticate("facebook", { scope: ["email"], session: false })(
    req,
    res,
    next
  );
});

router.get(
  "/facebook/callback",
  (req, res, next) => {
    if (!hasFacebookOAuth) {
      return res.status(501).json({ message: "Facebook OAuth is not configured" });
    }
    return passport.authenticate("facebook", { session: false, failureRedirect: env.frontendUrl })(
      req,
      res,
      next
    );
  },
  async (req, res) => {
    const user = req.user;
    const token = signAccessToken({ userId: user._id, role: user.role }, env.jwtSecret);
    const redirectUrl = `${env.frontendUrl}?oauth=success&token=${token}`;
    return res.redirect(redirectUrl);
  }
);

router.get("/me", authRequired, async (req, res) => {
  return res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    addresses: req.user.addresses
  });
});

export default router;
