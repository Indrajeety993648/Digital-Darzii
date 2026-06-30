"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { UploadZone } from "@/components/generate/UploadZone";
import { ModelUploadZone } from "@/components/generate/ModelUploadZone";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface FormState {
  garmentUrl: string | null;
  modelUrl: string | null;
  garmentCategory: "upper_body" | "lower_body" | "dresses";
  garmentDescription: string;
}

const defaultForm: FormState = {
  garmentUrl: null,
  modelUrl: null,
  garmentCategory: "upper_body",
  garmentDescription: "",
};

export default function GeneratePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isGenerating, setIsGenerating] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const isReady = !!form.garmentUrl && !!form.modelUrl;

  const updateForm = useCallback((updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const loadAndAnimate = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 }
        );

        if (leftColRef.current) {
          tl.fromTo(
            Array.from(leftColRef.current.children),
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
            "-=0.4"
          );
        }

        tl.fromTo(
          rightColRef.current,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.8 },
          "-=0.6"
        );
      }, pageRef);

      return () => ctx.revert();
    };

    loadAndAnimate();
  }, []);

  const handleGenerate = async () => {
    if (!form.garmentUrl || !form.modelUrl) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clothingImageUrl: form.garmentUrl,
          modelImageUrl: form.modelUrl,
          garmentCategory: form.garmentCategory,
          garmentDescription: form.garmentDescription || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      toast({ title: "Generation started!", description: "Redirecting to your result..." });
      router.push(`/result/${data.id}`);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
      setIsGenerating(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Grid overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div ref={headingRef} className="mb-12 opacity-0">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Virtual Try-On Studio
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl">
            Upload a garment and a model photo — we&apos;ll fit the garment onto the model naturally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          {/* LEFT — Form */}
          <div ref={leftColRef} className="space-y-6">
            {/* Upload cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Garment upload */}
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-6">
                <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="size-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Garment Photo
                </h2>
                <UploadZone
                  onUpload={(url) => updateForm({ garmentUrl: url })}
                  currentImage={form.garmentUrl}
                  onRemove={() => updateForm({ garmentUrl: null })}
                />
                <p className="mt-3 text-xs text-zinc-600 text-center">
                  Flat-lay or hanger shot — white background preferred
                </p>
              </div>

              {/* Model upload */}
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-6">
                <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="size-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Model Photo
                </h2>
                <ModelUploadZone
                  onUpload={(url) => updateForm({ modelUrl: url })}
                  currentImage={form.modelUrl}
                  onRemove={() => updateForm({ modelUrl: null })}
                />
              </div>
            </div>

            {/* Garment Details */}
            <div
              className={cn(
                "bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-6 transition-all duration-500",
                !form.garmentUrl && "opacity-40 pointer-events-none"
              )}
            >
              <h2 className="font-display text-base font-semibold text-white mb-5 flex items-center gap-3">
                <span className="size-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Garment Details
              </h2>

              {/* Category selector — pill buttons */}
              <div className="mb-5">
                <label className="text-sm font-medium text-zinc-400 mb-3 block">Category</label>
                <div className="flex gap-2">
                  {([
                    { value: "upper_body" as const, label: "Upper Body" },
                    { value: "lower_body" as const, label: "Lower Body" },
                    { value: "dresses" as const, label: "Dresses" },
                  ]).map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateForm({ garmentCategory: cat.value })}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        form.garmentCategory === cat.value
                          ? "bg-white text-black"
                          : "bg-white/[0.05] text-zinc-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-zinc-300"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment description */}
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.garmentDescription}
                  onChange={(e) => updateForm({ garmentDescription: e.target.value })}
                  placeholder="e.g. Short Sleeve Round Neck T-shirt"
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div>
              {!isReady && (
                <p className="text-center text-sm text-zinc-600 mb-3">
                  {!form.garmentUrl && !form.modelUrl
                    ? "Upload both a garment and a model photo to continue"
                    : !form.garmentUrl
                      ? "Upload a garment photo to continue"
                      : "Upload a model photo to continue"}
                </p>
              )}
              <button
                onClick={handleGenerate}
                disabled={!isReady || isGenerating}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-200",
                  isReady && !isGenerating
                    ? "bg-white text-black hover:bg-zinc-100 hover:-translate-y-0.5 shadow-lg shadow-white/10"
                    : "bg-white/[0.05] text-zinc-600 border border-white/[0.06] cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Try-On
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT — Preview Panel */}
          <div ref={rightColRef} className="lg:sticky lg:top-28 self-start space-y-4 opacity-0">
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-6">
              <h3 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">
                Preview
              </h3>

              {form.garmentUrl && form.modelUrl ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 text-center">
                        Garment
                      </p>
                      <div className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] aspect-square">
                        <img src={form.garmentUrl} alt="Garment" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 text-center">
                        Model
                      </p>
                      <div className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] aspect-square">
                        <img src={form.modelUrl} alt="Model" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <ArrowRight className="size-3.5 text-zinc-600" />
                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] aspect-square flex items-center justify-center">
                    <p className="text-zinc-600 text-sm text-center px-4">
                      Result appears after generation
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-zinc-500 text-xs font-medium text-center">
                      Estimated: ~5-40 seconds
                    </p>
                  </div>
                </div>
              ) : form.garmentUrl ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 text-center">
                      Garment
                    </p>
                    <div className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] aspect-square">
                      <img src={form.garmentUrl} alt="Garment" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-white/[0.1] aspect-[3/4] flex items-center justify-center">
                    <p className="text-zinc-600 text-sm text-center px-4">
                      Upload a model photo
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/[0.1] aspect-square flex items-center justify-center">
                  <p className="text-zinc-600 text-sm text-center px-4">
                    Upload images to see preview
                  </p>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5">
              <h4 className="font-semibold text-zinc-400 text-xs mb-3 uppercase tracking-wider">
                How it works
              </h4>
              <ol className="space-y-2.5">
                {[
                  "Body pose & garment region detected",
                  "DensePose maps body surface",
                  "IDM-VTON fits the garment via diffusion",
                  "Result saved and ready to download",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-2.5 text-xs text-zinc-500">
                    <span className="size-4 rounded-full bg-white/[0.06] text-zinc-500 flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
