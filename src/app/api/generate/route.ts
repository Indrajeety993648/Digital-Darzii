import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const generateSchema = z.object({
  clothingImageUrl: z.string().min(1),
  modelImageUrl: z.string().min(1),
  stylePrompt: z.string().optional(),
  garmentCategory: z.enum(["upper_body", "lower_body", "dresses"]).optional().default("upper_body"),
  garmentDescription: z.string().optional(),
  denoiseSteps: z.number().min(20).max(40).optional().default(30),
  seed: z.number().optional().default(42),
  autoCrop: z.boolean().optional().default(true),
  autoMask: z.boolean().optional().default(true),
});

async function processGeneration(generationId: string, data: z.infer<typeof generateSchema>) {
  try {
    await db.generationRequest.update({
      where: { id: generationId },
      data: { status: "processing", processingStage: "uploading" },
    });

    // Configurable delay to simulate AI processing time (in milliseconds)
    // Change this value to make the loading sequence faster or slower
    const MOCK_DELAY_MS = 42343;

    const startTime = Date.now();
    console.log("Mock Processing - ID:", generationId);
    console.log("Clothing URL:", data.clothingImageUrl);
    console.log("Model URL:", data.modelImageUrl);

    // Simulate the network delay for AI processing
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

    // Mock the AI response mapping inputs to outputs
    let resultImage = "/mock/final-output-female.jpeg"; // Set 1 Default

    // Detection logic for Set 2:
    const isSet2Model = data.modelImageUrl.includes("female-model-2") || data.modelImageUrl.includes("mock-2");
    const isSet2Garment = data.clothingImageUrl.includes("cloth-2");
    const isDressCategory = data.garmentCategory === "dresses";

    if (isSet2Model || isSet2Garment || isDressCategory) {
      resultImage = "/mock/output-2.jpeg";
    }

    const aiResult = {
      result_path: resultImage
    };

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
