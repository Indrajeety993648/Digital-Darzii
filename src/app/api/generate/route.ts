import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";
import { db } from "@/lib/db";
import { runTryOn, ReplicateError, type TryOnStage } from "@/lib/replicate";
import { SESSION_COOKIE, DAILY_LIMIT, usageLast24h, newSessionId } from "@/lib/limits";

const generateSchema = z.object({
  clothingImageUrl: z.string().min(1),
  modelImageUrl: z.string().min(1),
  stylePrompt: z.string().optional(),
  garmentCategory: z.enum(["upper_body", "lower_body", "dresses"]).optional().default("upper_body"),
  garmentDescription: z.string().optional(),
  denoiseSteps: z.number().min(20).max(40).optional().default(30),
  seed: z.number().optional().default(42),
});

// Hard cap so a hung prediction never leaves a row stuck in "processing".
const GENERATION_TIMEOUT_MS = 3 * 60 * 1000;

async function processGeneration(generationId: string, data: z.infer<typeof generateSchema>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
  const startTime = Date.now();

  const setStage = (processingStage: TryOnStage) =>
    db.generationRequest
      .update({ where: { id: generationId }, data: { status: "processing", processingStage } })
      .catch(() => {});

  try {
    await setStage("uploading");

    const { buffer, contentType } = await runTryOn({
      humanImage: data.modelImageUrl,
      garmentImage: data.clothingImageUrl,
      category: data.garmentCategory,
      description: data.garmentDescription,
      steps: data.denoiseSteps,
      seed: data.seed,
      signal: controller.signal,
      onStage: (stage) => { void setStage(stage); },
    });

    // Persist the result locally (Replicate's output URL expires).
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const filename = `${generationId}.${ext}`;
    const resultsDir = path.join(process.cwd(), "public", "results");
    await mkdir(resultsDir, { recursive: true });
    await writeFile(path.join(resultsDir, filename), buffer);

    await db.generationRequest.update({
      where: { id: generationId },
      data: {
        status: "completed",
        resultImageUrl: `/results/${filename}`,
        processingStage: "done",
        processingTimeMs: Date.now() - startTime,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    const userMessage =
      err instanceof ReplicateError
        ? err.userMessage
        : "Something went wrong during processing. Please try again.";
    console.error(`Generation ${generationId} failed:`, err);
    await db.generationRequest
      .update({
        where: { id: generationId },
        data: { status: "failed", processingStage: "failed", errorMessage: userMessage },
      })
      .catch(() => {});
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = generateSchema.parse(body);

    // Credit / daily limit, scoped to a session cookie.
    let sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    const isNewSession = !sessionId;
    if (!sessionId) sessionId = newSessionId();

    const used = await usageLast24h(sessionId);
    if (used >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Daily limit reached (${DAILY_LIMIT} per day). Try again tomorrow.` },
        { status: 429 }
      );
    }

    const generation = await db.generationRequest.create({
      data: {
        sessionId,
        status: "queued",
        processingStage: "queued",
        clothingImageUrl: data.clothingImageUrl,
        modelImageUrl: data.modelImageUrl,
        garmentCategory: data.garmentCategory,
        stylePrompt: data.stylePrompt,
      },
    });

    // Fire-and-forget; the result page polls /api/status/[id].
    processGeneration(generation.id, data).catch(console.error);

    const res = NextResponse.json({
      success: true,
      id: generation.id,
      remaining: Math.max(0, DAILY_LIMIT - used - 1),
    });
    if (isNewSession) {
      res.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error("Generate route error:", err);
    return NextResponse.json({ error: "Failed to start generation" }, { status: 500 });
  }
}
