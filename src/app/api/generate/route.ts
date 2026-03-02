import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const generateSchema = z.object({
  clothingImageUrl: z.string().min(1),
  modelImageUrl: z.string().min(1),
  stylePrompt: z.string().optional(),
});

async function processGeneration(generationId: string, data: z.infer<typeof generateSchema>) {
  try {
    await db.generationRequest.update({
      where: { id: generationId },
      data: { status: "processing", processingStage: "uploading" },
    });

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
    const startTime = Date.now();

    const aiResponse = await fetch(`${AI_SERVICE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: generationId,
        clothing_image_path: data.clothingImageUrl,
        template_image_path: data.modelImageUrl,
        preferences: {},
        style_prompt: data.stylePrompt ?? null,
        output_filename: `${generationId}.jpg`,
      }),
      signal: AbortSignal.timeout(300_000),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI service error: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();
    const processingTimeMs = Date.now() - startTime;

    await db.generationRequest.update({
      where: { id: generationId },
      data: {
        status: "completed",
        resultImageUrl: aiResult.result_path,
        processingStage: "done",
        processingTimeMs,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    console.error(`Generation ${generationId} failed:`, err);
    await db.generationRequest.update({
      where: { id: generationId },
      data: {
        status: "failed",
        processingStage: "failed",
        errorMessage: String(err),
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = generateSchema.parse(body);

    const generation = await db.generationRequest.create({
      data: {
        status: "queued",
        clothingImageUrl: data.clothingImageUrl,
        modelImageUrl: data.modelImageUrl,
        processingStage: "queued",
        stylePrompt: data.stylePrompt,
      },
    });

    processGeneration(generation.id, data).catch(console.error);

    return NextResponse.json({ success: true, id: generation.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error("Generate route error:", err);
    return NextResponse.json({ error: "Failed to start generation" }, { status: 500 });
  }
}
