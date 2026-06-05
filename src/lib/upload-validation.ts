import path from "path";

const CHAT_ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function validateChatUpload(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return "File must be 10 MB or smaller.";
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!CHAT_ALLOWED_EXTENSIONS.includes(ext)) {
    return "Use PDF, JPG, PNG, or WEBP.";
  }
  return null;
}
