import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

export async function saveUpload(
  subfolder: string,
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const mode = process.env.STORAGE_MODE ?? "local";

  if (mode === "local") {
    const base = path.resolve(UPLOAD_DIR);
    const dir = path.join(base, subfolder);
    await mkdir(dir, { recursive: true });
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fullPath = path.join(dir, `${Date.now()}-${safeName}`);
    await writeFile(fullPath, buffer);
    return fullPath;
  }

  // R2/S3 integration placeholder for production
  throw new Error(
    "Remote storage not configured. Set STORAGE_MODE=local for development."
  );
}

export async function deleteStoredFile(filePath: string | null | undefined) {
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch {
    // File may already be missing
  }
}
