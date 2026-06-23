"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
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
  completed: { label: "Completed", color: "bg-white/10 text-white/70" },
  processing: { label: "Processing", color: "bg-white/10 text-amber-400" },
  queued: { label: "Queued", color: "bg-white/10 text-white/50" },
  failed: { label: "Failed", color: "bg-white/10 text-red-400" },
};

export function GalleryGrid({ generations }: { generations: Generation[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this generation?")) return;
    setDeleting(id);
    await fetch(`/api/generations/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(null);
  };

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
          <div key={gen.id}>
            <motion.div
              onClick={() => router.push(`/result/${gen.id}`)}
              className="gallery-card group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Image */}
              <div className="aspect-[3/4] bg-white/5 overflow-hidden relative">
                <img
                  src={imageSrc}
                  alt="Generation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Status overlay for non-completed */}
                {gen.status !== "completed" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                    {gen.status === "processing" || gen.status === "queued" ? (
                      <div className="size-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-2xl">❌</span>
                    )}
                  </div>
                )}
                {/* Delete button — z-10 so it sits above overlay */}
                <button
                  onClick={(e) => handleDelete(e, gen.id)}
                  disabled={deleting === gen.id}
                  className="absolute top-2 right-2 z-10 size-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white/70 hover:bg-red-500/80 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConf.color)}>
                    {statusConf.label}
                  </span>
                  <span className="text-xs text-white/30 shrink-0">
                    {formatRelativeTime(gen.createdAt)}
                  </span>
                </div>
                {gen.processingTimeMs && gen.status === "completed" && (
                  <p className="text-xs text-white/30 mt-1">
                    {(gen.processingTimeMs / 1000).toFixed(0)}s generation
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
