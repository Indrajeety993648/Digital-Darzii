"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { User, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ModelUploadZoneProps {
  onUpload: (url: string) => void;
  currentImage: string | null;
  onRemove: () => void;
}

const TIPS = [
  "Full body visible — head to toe",
  "Standing upright, facing camera",
  "Plain or simple background",
  "Good lighting, clear photo",
];

export function ModelUploadZone({ onUpload, currentImage, onRemove }: ModelUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum 10MB allowed.", variant: "destructive" });
        return;
      }

      setIsUploading(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85));
      }, 200);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Upload failed");

        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
          onUpload(data.imageUrl);
          toast({ title: "Model photo uploaded!", description: "Ready to generate." });
        }, 300);
      } catch (err) {
        clearInterval(progressInterval);
        setIsUploading(false);
        setProgress(0);
        toast({ title: "Upload failed", description: String(err), variant: "destructive" });
      }
    },
    [onUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    disabled: isUploading || !!currentImage,
  });

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-violet-200 bg-violet-50 aspect-[3/4] max-w-[200px] mx-auto">
          <img src={currentImage} alt="Model photo" className="w-full h-full object-cover" />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 size-8 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-zinc-700 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="size-4" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-green-500 text-white text-xs font-medium flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-white" />
            Model ready
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
            "flex flex-col items-center justify-center p-10 gap-4 text-center",
            isDragActive
              ? "border-violet-500 bg-violet-50 scale-[1.02]"
              : "border-zinc-300 bg-zinc-50 hover:border-violet-400 hover:bg-violet-50/50",
            isUploading && "pointer-events-none"
          )}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative size-16">
                <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke="#7c3aed" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className="transition-all duration-200"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-600">{progress}%</span>
                </div>
              </div>
              <p className="text-zinc-600 font-medium">Uploading...</p>
            </div>
          ) : (
            <>
              <div className={cn(
                "size-16 rounded-2xl flex items-center justify-center transition-colors",
                isDragActive ? "bg-violet-100" : "bg-zinc-100"
              )}>
                <User className={cn("size-7", isDragActive ? "text-violet-600" : "text-zinc-400")} />
              </div>
              <div>
                <p className="font-semibold text-zinc-700 mb-1">
                  {isDragActive ? "Drop it here!" : "Upload your model photo"}
                </p>
                <p className="text-sm text-zinc-400">JPEG, PNG, WebP — Max 10MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
        <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-2">Tips for best results</p>
        <ul className="space-y-1.5">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-violet-700">
              <CheckCircle2 className="size-3.5 mt-0.5 shrink-0 text-violet-500" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
