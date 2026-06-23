"use client";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "uploading", label: "Preparing Image", desc: "Removing background & cleaning up" },
  { key: "processing", label: "Analyzing Garment", desc: "Understanding fabric, shape & details" },
  { key: "generating", label: "Generating Model", desc: "Creating your on-model photo with AI" },
  { key: "enhancing", label: "Enhancing Quality", desc: "Upscaling & adding fine details" },
];

function getStageIndex(stage: string | null): number {
  if (!stage) return 0;
  const stageMap: Record<string, number> = {
    queued: 0,
    uploading: 0,
    processing: 1,
    generating: 2,
    enhancing: 3,
    done: 4,
  };
  return stageMap[stage] ?? 0;
}

interface ProcessingTimelineProps {
  stage: string | null;
  elapsed: number;
}

export function ProcessingTimeline({ stage, elapsed }: ProcessingTimelineProps) {
  const currentStageIndex = getStageIndex(stage);

  return (
    <div className="space-y-4">
      {STAGES.map((s, i) => {
        const isDone = i < currentStageIndex;
        const isActive = i === currentStageIndex;
        return (
          <div key={s.key} className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center border-2 transition-all",
                  isDone && "bg-white border-white",
                  isActive && "bg-white/20 border-white/40",
                  !isDone && !isActive && "bg-white/5 border-white/10"
                )}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {isDone ? (
                  <Check className="size-4 text-black" />
                ) : isActive ? (
                  <Loader2 className="size-4 text-white animate-spin" />
                ) : (
                  <div className="size-2 rounded-full bg-white/20" />
                )}
              </motion.div>
              {i < STAGES.length - 1 && (
                <div className={cn("w-0.5 h-8 mt-1 transition-colors", isDone ? "bg-white/40" : "bg-white/10")} />
              )}
            </div>
            {/* Text */}
            <div className="pb-4">
              <p className={cn(
                "font-medium text-sm",
                isDone && "text-white/60",
                isActive && "text-white",
                !isDone && !isActive && "text-white/30"
              )}>
                {s.label}
              </p>
              <p className={cn(
                "text-xs mt-0.5",
                isActive ? "text-white/40" : "text-white/20"
              )}>
                {s.desc}
              </p>
            </div>
          </div>
        );
      })}

      {/* Elapsed time */}
      <p className="text-sm text-white/50 text-center pt-2">
        Processing... <span className="font-mono font-semibold text-white">{elapsed}s</span>
      </p>
    </div>
  );
}
