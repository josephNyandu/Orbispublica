import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "auth_token";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-in-production";

export function getCookieName() {
  return COOKIE_NAME;
}

export function getJwtSecret() {
  return JWT_SECRET;
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {boolean}
 */
export function verifyAdminCredentials(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  if (!expectedEmail || email !== expectedEmail) {
    return false;
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return bcrypt.compareSync(password, hash);
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const plain = process.env.ADMIN_PASSWORD;
  return Boolean(plain && password === plain);
}

/** @param {{ remember?: boolean }} [opts] */
export function signAuthToken(opts = {}) {
  const remember = opts.remember !== false;
  const expiresIn = remember ? "30d" : "8h";
  return jwt.sign({ sub: "admin", role: "admin" }, JWT_SECRET, { expiresIn });
}

export function verifyAuthToken(token) {
  if (!token) return null;
  if (process.env.NODE_ENV === "production" && JWT_SECRET === "dev-only-change-in-production") {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  req.admin = payload;
  next();
}
