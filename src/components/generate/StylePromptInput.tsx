"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StylePromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

const suggestions = [
  "Professional studio lighting",
  "Neutral background, clean look",
  "Festive traditional setting",
  "Casual outdoor, natural light",
];

export function StylePromptInput({ value, onChange }: StylePromptInputProps) {
  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the look you want... (e.g., soft lighting, festive background, elegant styling)"
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-sm resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
      />
      <div>
        <p className="text-xs text-zinc-400 mb-2 font-medium">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                value === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-indigo-300 hover:text-indigo-600"
              )}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
