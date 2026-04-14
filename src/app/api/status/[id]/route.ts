import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const generation = await db.generationRequest.findUnique({
      where: { id },
    });

    if (!generation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      processingStage: generation.processingStage,
      resultImageUrl: generation.resultImageUrl,
      clothingImageUrl: generation.clothingImageUrl,
      processingTimeMs: generation.processingTimeMs,
      errorMessage: generation.errorMessage,
      createdAt: generation.createdAt,
      completedAt: generation.completedAt,
    });
  } catch (err) {
    console.error("Status route error:", err);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
