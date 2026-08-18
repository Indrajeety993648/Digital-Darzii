import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const gen = await db.generationRequest.findUnique({ where: { id } });
    if (!gen) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (gen.resultImageUrl) {
      await del(gen.resultImageUrl).catch(() => {});
    }

    await db.generationRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
