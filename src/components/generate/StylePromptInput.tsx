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
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm resize-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all"
      />
      <div>
        <p className="text-xs text-white/30 mb-2 font-medium">Quick suggestions:</p>
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
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
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
