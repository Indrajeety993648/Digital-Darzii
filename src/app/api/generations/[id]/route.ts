import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const gen = await db.generationRequest.findUnique({ where: { id } });
    if (!gen) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (gen.resultImageUrl) {
      const filePath = path.join(process.cwd(), "public", gen.resultImageUrl);
      await unlink(filePath).catch(() => {});
    }

    await db.generationRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
