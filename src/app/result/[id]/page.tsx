"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Images, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { ProcessingTimeline } from "@/components/result/ProcessingTimeline";
import { BeforeAfterSlider } from "@/components/result/BeforeAfterSlider";
import { useGenerationStatus } from "@/hooks/useGenerationStatus";

const TIPS = [
  "AI analyzes over 1,000 fabric patterns to understand your garment",
  "Your image is being processed on professional-grade hardware",
  "This would take a photographer 2+ hours traditionally",
  "We use state-of-the-art virtual try-on models trained on fashion data",
  "Ethnic wear processing uses specialized pose templates",
];

export default function ResultPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error, isPolling } = useGenerationStatus(id);

  const [elapsed, setElapsed] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);

  // Elapsed timer
  useEffect(() => {
    if (isPolling) {
      elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [isPolling]);

  // Rotating tips
  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPolling]);

  const handleDownload = () => {
    if (!data?.resultImageUrl) return;
    const a = document.createElement("a");
    a.href = data.resultImageUrl;
    a.download = `digital-darzi-${id}.jpg`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="size-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-5xl">😵</div>
        <h1 className="font-display text-2xl font-bold text-zinc-900">Oops! Generation not found.</h1>
        <Link href="/generate" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <AnimatePresence mode="wait">
          {/* PROCESSING STATE */}
          {(data.status === "queued" || data.status === "processing") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto"
            >
              <div className="text-center mb-10">
                <div className="inline-flex size-16 rounded-2xl bg-indigo-100 items-center justify-center mb-4">
                  <Sparkles className="size-7 text-indigo-600 animate-pulse" />
                </div>
                <h1 className="font-display text-2xl font-bold text-zinc-900 mb-2">
                  Generating your photo...
                </h1>
                <p className="text-zinc-500">Sit tight while AI works its magic</p>
              </div>

              {/* Garment preview */}
              <div className="flex justify-center mb-8">
                <div className="size-28 rounded-xl overflow-hidden border-2 border-indigo-200 shadow-lg shadow-indigo-200">
                  <img src={data.clothingImageUrl} alt="Your garment" className="w-full h-full object-contain bg-zinc-50" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    initial={{ width: "5%" }}
                    animate={{ width: data.processingStage === "enhancing" ? "85%" : data.processingStage === "generating" ? "60%" : data.processingStage === "processing" ? "35%" : "10%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-8">
                <ProcessingTimeline stage={data.processingStage} elapsed={elapsed} />
              </div>

              {/* Rotating tip */}
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tipIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-indigo-700 font-medium"
                  >
                    {TIPS[tipIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* COMPLETED STATE */}
          {data.status === "completed" && data.resultImageUrl && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="inline-flex size-16 rounded-2xl bg-green-100 items-center justify-center mb-4"
                >
                  <span className="text-3xl">✨</span>
                </motion.div>
                <h1 className="font-display text-2xl font-bold text-zinc-900 mb-2">Your photo is ready!</h1>
                {data.processingTimeMs && (
                  <p className="text-zinc-500 text-sm">
                    Generated in{" "}
                    <span className="font-semibold text-zinc-700">
                      {(data.processingTimeMs / 1000).toFixed(0)}s
                    </span>
                  </p>
                )}
              </div>

              {/* Before/After Slider */}
              <div className="mb-8">
                <BeforeAfterSlider
                  beforeSrc={data.clothingImageUrl}
                  afterSrc={data.resultImageUrl}
                  height={520}
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-xs text-zinc-400 font-medium">← Original</span>
                  <span className="text-xs text-zinc-400 font-medium">Generated →</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg shadow-indigo-500/25"
                >
                  <Download className="size-4" />
                  Download HD
                </button>
                <Link
                  href="/generate"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition-colors"
                >
                  <RefreshCw className="size-4" />
                  Generate Another
                </Link>
                <Link
                  href="/gallery"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold transition-colors"
                >
                  <Images className="size-4" />
                  View Gallery
                </Link>
              </div>

              {/* Feedback */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-zinc-500">How&apos;s this result?</span>
                <button
                  onClick={() => setFeedback("up")}
                  className={`size-9 rounded-full flex items-center justify-center transition-all ${feedback === "up" ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-500 hover:bg-green-50 hover:text-green-500"}`}
                >
                  <ThumbsUp className="size-4" />
                </button>
                <button
                  onClick={() => setFeedback("down")}
                  className={`size-9 rounded-full flex items-center justify-center transition-all ${feedback === "down" ? "bg-red-100 text-red-500" : "bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-500"}`}
                >
                  <ThumbsDown className="size-4" />
                </button>
                {feedback && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-zinc-500"
                  >
                    {feedback === "up" ? "Thanks!" : "Sorry to hear that. We'll improve!"}
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}

          {/* FAILED STATE */}
          {data.status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="text-5xl mb-4">😔</div>
              <h1 className="font-display text-2xl font-bold text-zinc-900 mb-2">Generation failed</h1>
              <p className="text-zinc-500 mb-2">Something went wrong during processing.</p>
              {data.errorMessage && (
                <p className="text-xs text-red-400 bg-red-50 rounded-lg p-3 mb-6 font-mono">
                  {data.errorMessage}
                </p>
              )}
              <p className="text-sm text-zinc-400 mb-8">
                Make sure the AI service is running:{" "}
                <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs">
                  cd ai-service && uvicorn main:app --port 8000
                </code>
              </p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
              >
                <RefreshCw className="size-4" />
                Try Again
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
