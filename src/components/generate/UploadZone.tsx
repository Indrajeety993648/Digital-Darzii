"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn, bytesToMB } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (url: string) => void;
  currentImage: string | null;
  onRemove: () => void;
}

export function UploadZone({ onUpload, currentImage, onRemove }: UploadZoneProps) {
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

      // Simulate progress
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
          toast({ title: "Image uploaded!", description: "Ready to generate." });
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

  if (currentImage) {
    return (
      <div className="relative group rounded-xl overflow-hidden border-2 border-indigo-200 bg-indigo-50 aspect-square max-w-xs mx-auto">
        <img src={currentImage} alt="Uploaded garment" className="w-full h-full object-contain" />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 size-8 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-zinc-700 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="size-4" />
        </button>
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-green-500 text-white text-xs font-medium flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-white" />
          Image ready
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
          "flex flex-col items-center justify-center p-12 gap-4 text-center",
          isDragActive
            ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
            : "border-zinc-300 bg-zinc-50 hover:border-indigo-400 hover:bg-indigo-50/50",
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
                  stroke="#6366f1" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  className="transition-all duration-200"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-600">{progress}%</span>
              </div>
            </div>
            <p className="text-zinc-600 font-medium">Uploading...</p>
          </div>
        ) : (
          <>
            <div className={cn(
              "size-16 rounded-2xl flex items-center justify-center transition-colors",
              isDragActive ? "bg-indigo-100" : "bg-zinc-100"
            )}>
              <Upload className={cn("size-7", isDragActive ? "text-indigo-600" : "text-zinc-400")} />
            </div>
            <div>
              <p className="font-semibold text-zinc-700 mb-1">
                {isDragActive ? "Drop it here!" : "Drop your image or click to browse"}
              </p>
              <p className="text-sm text-zinc-400">JPEG, PNG, WebP — Max 10MB</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
