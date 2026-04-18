import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Dossier `uploads/` à la racine du projet (hors `build/`). */
export const uploadsPublicRoot = path.join(__dirname, "..", "uploads");

export function ensureUploadDirs() {
  fs.mkdirSync(path.join(uploadsPublicRoot, "media"), { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, path.join(uploadsPublicRoot, "media"));
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "").slice(0, 12).toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const extUse = allowed.includes(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extUse}`);
  },
});

export const adminImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/^image\/(jpeg|pjpeg|png|webp|gif)$/i.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Formats acceptés : JPEG, PNG, WebP, GIF."));
  },
});

const docStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, path.join(uploadsPublicRoot, "media"));
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "").slice(0, 12).toLowerCase();
    const allowed = [".pdf", ".doc", ".docx"];
    const extUse = allowed.includes(ext) ? ext : ".pdf";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extUse}`);
  },
});

/** PDF et Word (DOC/DOCX), max. 15 Mo — stockés sous `/uploads/media/…`. */
export const adminDocumentUpload = multer({
  storage: docStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if ([".pdf", ".doc", ".docx"].includes(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error("Formats acceptés : PDF, Word (.doc, .docx)."));
  },
});
