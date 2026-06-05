import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { path: segments } = await params;
  const relativePath = segments.join("/");
  const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
  const fullPath = path.resolve(uploadDir, relativePath);

  if (!fullPath.startsWith(uploadDir + path.sep) && fullPath !== uploadDir) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const poaScan = await prisma.poaCase.findFirst({
    where: { scanFilePath: fullPath },
    include: { user: true },
  });

  if (poaScan) {
    const allowed =
      poaScan.userId === session.user.id || isStaff(session.user.role);
    if (!allowed) return new NextResponse("Forbidden", { status: 403 });
  } else {
    const poaMsg = await prisma.poaMessage.findFirst({
      where: { filePath: fullPath },
      include: { poaCase: true },
    });
    if (poaMsg) {
      const allowed =
        poaMsg.poaCase.userId === session.user.id ||
        isStaff(session.user.role);
      if (!allowed) return new NextResponse("Forbidden", { status: 403 });
    } else {
      const reqMsg = await prisma.requestMessage.findFirst({
        where: { filePath: fullPath },
        include: { request: true },
      });
      if (reqMsg) {
        const allowed =
          reqMsg.request.clientId === session.user.id ||
          isStaff(session.user.role);
        if (!allowed) return new NextResponse("Forbidden", { status: 403 });
      } else if (!isStaff(session.user.role)) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  try {
    const data = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const type =
      ext === ".pdf"
        ? "application/pdf"
        : ext === ".png"
          ? "image/png"
          : ext === ".doc"
            ? "application/msword"
            : "image/jpeg";
    return new NextResponse(data, {
      headers: { "Content-Type": type, "Cache-Control": "private" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
