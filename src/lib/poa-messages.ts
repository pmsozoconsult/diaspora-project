import path from "path";
import { prisma } from "@/lib/prisma";

export async function getPoaMessagesForCase(poaCaseId: string) {
  const messages = await prisma.poaMessage.findMany({
    where: { poaCaseId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true, role: true } } },
  });

  const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

  return messages.map((m) => ({
    id: m.id,
    body: m.body,
    fileName: m.fileName,
    fileUrl:
      m.filePath && m.filePath.startsWith(uploadDir)
        ? `/api/uploads/${path.relative(uploadDir, m.filePath)}`
        : null,
    createdAt: m.createdAt.toISOString(),
    author: m.author,
  }));
}
