"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Generation {
  id: string;
  status: string;
  clothingImageUrl: string;
  resultImageUrl: string | null;
  createdAt: Date;
  processingTimeMs: number | null;
}

const statusConfig = {
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  processing: { label: "Processing", color: "bg-amber-100 text-amber-700" },
  queued: { label: "Queued", color: "bg-blue-100 text-blue-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-600" },
};

export function GalleryGrid({ generations }: { generations: Generation[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const cards = gridRef.current?.querySelectorAll(".gallery-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.1 }
        );
      }
    };
    loadGSAP();
  }, []);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      {generations.map((gen) => {
        const statusConf = statusConfig[gen.status as keyof typeof statusConfig] ?? statusConfig.queued;
        const imageSrc = gen.resultImageUrl ?? gen.clothingImageUrl;

        return (
          <Link href={`/result/${gen.id}`} key={gen.id}>
            <motion.div
              className="gallery-card group relative rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Image */}
              <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative">
                <img
                  src={imageSrc}
                  alt="Generation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Status overlay for non-completed */}
                {gen.status !== "completed" && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    {gen.status === "processing" || gen.status === "queued" ? (
                      <div className="size-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-2xl">❌</span>
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConf.color)}>
                    {statusConf.label}
                  </span>
                  <span className="text-xs text-zinc-400 shrink-0">
                    {formatRelativeTime(gen.createdAt)}
                  </span>
                </div>
                {gen.processingTimeMs && gen.status === "completed" && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {(gen.processingTimeMs / 1000).toFixed(0)}s generation
                  </p>
                )}
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
