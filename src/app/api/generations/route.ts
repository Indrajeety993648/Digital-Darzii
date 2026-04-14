import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const generations = await db.generationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(generations);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
  }
}
