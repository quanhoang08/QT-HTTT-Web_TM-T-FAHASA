import jwt from "jsonwebtoken";

export function signAccessToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyAccessToken(token, secret) {
  return jwt.verify(token, secret);
}
