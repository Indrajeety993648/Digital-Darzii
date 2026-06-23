import Link from "next/link";
import { db } from "@/lib/db";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Navbar } from "@/components/shared/Navbar";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const generations = await db.generationRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="dark min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              Your Generations
            </h1>
            <p className="text-white/50">{generations.length} total images</p>
          </div>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm transition-colors hover:bg-white/90"
          >
            <Plus className="size-4" />
            New Generation
          </Link>
        </div>

        {generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="size-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <span className="text-4xl">🎨</span>
            </div>
            <h2 className="font-display text-xl font-semibold text-white mb-2">No generations yet</h2>
            <p className="text-white/50 mb-8 max-w-sm">
              Upload your first garment and let AI create stunning on-model photos.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
            >
              <Plus className="size-4" />
              Create your first one
            </Link>
          </div>
        ) : (
          <GalleryGrid generations={generations} />
        )}
      </div>
    </div>
  );
}
