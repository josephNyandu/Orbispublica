/** Bucket unique Supabase Storage : images + pièces jointes admin (même logique que l’ancien `/uploads/media/`). */
export const SUPABASE_ADMIN_MEDIA_BUCKET = "admin-media";

const IMAGE_MIMES = /^image\/(jpeg|pjpeg|png|webp|gif)$/i;
const DOC_EXT = /\.(pdf|doc|docx)$/i;

export const ADMIN_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ADMIN_DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;

export function assertAdminImageFile(file: File): void {
  if (file.size > ADMIN_IMAGE_MAX_BYTES) {
    throw new Error("Image trop volumineuse (max. 5 Mo)");
  }
  if (!IMAGE_MIMES.test(file.type || "")) {
    throw new Error("Formats acceptés : JPEG, PNG, WebP, GIF.");
  }
}

export function assertAdminDocumentFile(file: File): void {
  if (file.size > ADMIN_DOCUMENT_MAX_BYTES) {
    throw new Error("Document trop volumineux (max. 15 Mo)");
  }
  const name = file.name || "";
  if (!DOC_EXT.test(name.toLowerCase())) {
    throw new Error("Formats acceptés : PDF, Word (.doc, .docx).");
  }
}
