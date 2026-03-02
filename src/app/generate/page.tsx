"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { UploadZone } from "@/components/generate/UploadZone";
import { ModelUploadZone } from "@/components/generate/ModelUploadZone";
import { StylePromptInput } from "@/components/generate/StylePromptInput";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight, Shirt, User } from "lucide-react";

interface FormState {
  garmentUrl: string | null;
  modelUrl: string | null;
  stylePrompt: string;
}

const defaultForm: FormState = {
  garmentUrl: null,
  modelUrl: null,
  stylePrompt: "",
};

export default function GeneratePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isGenerating, setIsGenerating] = useState(false);

  const isReady = !!form.garmentUrl && !!form.modelUrl;

  const updateForm = useCallback((updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
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
          stylePrompt: form.stylePrompt || undefined,
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
            Virtual Try-On
          </h1>
          <p className="text-zinc-500">
            Upload a garment photo and a model photo — we&apos;ll fit the garment onto the model naturally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* LEFT — Form */}
          <div className="space-y-8">
            {/* Two uploads side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Garment upload */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <span className="size-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                  <Shirt className="size-4 text-indigo-500" />
                  Garment Photo
                </h2>
                <UploadZone
                  onUpload={(url) => updateForm({ garmentUrl: url })}
                  currentImage={form.garmentUrl}
                  onRemove={() => updateForm({ garmentUrl: null })}
                />
                <p className="mt-3 text-xs text-zinc-400 text-center">
                  Flat-lay or hanger shot — white background preferred
                </p>
              </div>

              {/* Model upload */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <span className="size-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-bold">2</span>
                  <User className="size-4 text-violet-500" />
                  Model Photo
                </h2>
                <ModelUploadZone
                  onUpload={(url) => updateForm({ modelUrl: url })}
                  currentImage={form.modelUrl}
                  onRemove={() => updateForm({ modelUrl: null })}
                />
              </div>
            </div>

            {/* Section 3: Style Prompt */}
            <div className={cn(
              "bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm transition-all duration-500",
              !form.garmentUrl && "opacity-50 pointer-events-none"
            )}>
              <h2 className="font-display text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <span className="size-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-sm font-bold">3</span>
                Style Prompt{" "}
                <span className="text-zinc-400 font-normal text-sm">(optional)</span>
              </h2>
              <StylePromptInput
                value={form.stylePrompt}
                onChange={(v) => updateForm({ stylePrompt: v })}
              />
            </div>

            {/* Generate Button */}
            <div>
              {!isReady && (
                <p className="text-center text-sm text-zinc-400 mb-3">
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
                  "w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                  isReady && !isGenerating
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Starting generation...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    Fit Garment on Model
                    <ChevronRight className="size-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT — Preview Panel */}
          <div className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
              <h3 className="font-semibold text-zinc-900 mb-4">Preview</h3>

              {form.garmentUrl && form.modelUrl ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 text-center">Garment</p>
                      <div className="rounded-xl overflow-hidden bg-zinc-100 aspect-square">
                        <img src={form.garmentUrl} alt="Garment" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 text-center">Model</p>
                      <div className="rounded-xl overflow-hidden bg-zinc-100 aspect-square">
                        <img src={form.modelUrl} alt="Model" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="h-px flex-1 bg-zinc-200" />
                    <Sparkles className="size-4 text-indigo-500" />
                    <div className="h-px flex-1 bg-zinc-200" />
                  </div>
                  <div className="rounded-xl bg-zinc-100 aspect-square flex items-center justify-center">
                    <p className="text-zinc-400 text-sm text-center px-4">Result will appear here after generation</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-amber-700 text-xs font-medium text-center">Estimated time: ~5–40 seconds</p>
                  </div>
                </div>
              ) : form.garmentUrl ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 text-center">Garment</p>
                    <div className="rounded-xl overflow-hidden bg-zinc-100 aspect-square">
                      <img src={form.garmentUrl} alt="Garment" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-violet-50 border-2 border-dashed border-violet-200 aspect-[3/4] flex items-center justify-center">
                    <p className="text-violet-400 text-sm text-center px-4">Upload a model photo →</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 aspect-square flex items-center justify-center">
                  <p className="text-zinc-400 text-sm text-center px-4">Upload images to see preview</p>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
              <h4 className="font-semibold text-zinc-900 text-sm mb-3">How it works</h4>
              <ol className="space-y-2">
                {[
                  "Garment background is removed",
                  "Garment is detected and segmented",
                  "AI fits it naturally onto your model",
                  "Result is enhanced and saved",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-2.5 text-xs text-zinc-600">
                    <span className="size-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
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
