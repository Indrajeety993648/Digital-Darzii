"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  gender: string;
  bodyType: string;
  skinTone: string;
  pose: string;
  background: string;
  onChange: (updates: Record<string, string>) => void;
}

const bodyTypes = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
];

const skinTones = [
  { value: "light", label: "Light", color: "#F9D9B8" },
  { value: "medium", label: "Medium", color: "#D4956A" },
  { value: "dark", label: "Dark", color: "#8B5A2B" },
  { value: "deep", label: "Deep", color: "#4A2C1A" },
];

const poses = [
  { value: "front", label: "Front", emoji: "🧍" },
  { value: "side", label: "Side", emoji: "🧍" },
  { value: "casual", label: "Casual", emoji: "💃" },
  { value: "formal", label: "Formal", emoji: "🎩" },
  { value: "ethnic", label: "Ethnic", emoji: "🥻" },
  { value: "saree", label: "Saree", emoji: "🌸" },
];

const backgrounds = [
  { value: "studio_white", label: "Studio White", color: "#FFFFFF" },
  { value: "studio_gray", label: "Studio Gray", color: "#9CA3AF" },
  { value: "outdoor", label: "Outdoor", color: "#86EFAC" },
  { value: "minimal", label: "Minimal", color: "#F3F4F6" },
];

function SelectButton({
  isSelected,
  onClick,
  children,
  className,
}: {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all",
        isSelected
          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

export function ModelSelector({ gender, bodyType, skinTone, pose, background, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-8">
      {/* Gender */}
      <div>
        <label className="text-sm font-semibold text-zinc-700 mb-3 block">Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {["female", "male"].map((g) => (
            <motion.button
              key={g}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange({ gender: g })}
              className={cn(
                "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                gender === g
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              )}
            >
              <span className="text-3xl">{g === "female" ? "👩" : "👨"}</span>
              <span className={cn("text-sm font-semibold capitalize", gender === g ? "text-indigo-700" : "text-zinc-600")}>
                {g}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Body Type */}
      <div>
        <label className="text-sm font-semibold text-zinc-700 mb-3 block">Body Type</label>
        <div className="flex gap-2">
          {bodyTypes.map((bt) => (
            <SelectButton
              key={bt.value}
              isSelected={bodyType === bt.value}
              onClick={() => onChange({ bodyType: bt.value })}
              className="flex-1"
            >
              {bt.label}
            </SelectButton>
          ))}
        </div>
      </div>

      {/* Skin Tone */}
      <div>
        <label className="text-sm font-semibold text-zinc-700 mb-3 block">Skin Tone</label>
        <div className="flex gap-3">
          {skinTones.map((st) => (
            <motion.button
              key={st.value}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange({ skinTone: st.value })}
              className="flex flex-col items-center gap-2 flex-1"
              title={st.label}
            >
              <div
                className={cn(
                  "size-10 rounded-full border-4 transition-all shadow-sm",
                  skinTone === st.value ? "border-indigo-500 scale-110" : "border-transparent hover:border-zinc-300"
                )}
                style={{ backgroundColor: st.color }}
              />
              <span className={cn("text-xs font-medium", skinTone === st.value ? "text-indigo-600" : "text-zinc-500")}>
                {st.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pose */}
      <div>
        <label className="text-sm font-semibold text-zinc-700 mb-3 block">Pose</label>
        <div className="grid grid-cols-3 gap-2">
          {poses.map((p) => (
            <motion.button
              key={p.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange({ pose: p.value })}
              className={cn(
                "p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all",
                pose === p.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              )}
            >
              <span className="text-xl">{p.emoji}</span>
              <span className={cn("text-xs font-medium", pose === p.value ? "text-indigo-700" : "text-zinc-600")}>
                {p.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div>
        <label className="text-sm font-semibold text-zinc-700 mb-3 block">Background</label>
        <div className="grid grid-cols-2 gap-2">
          {backgrounds.map((bg) => (
            <motion.button
              key={bg.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange({ background: bg.value })}
              className={cn(
                "p-3 rounded-xl border-2 flex items-center gap-3 transition-all",
                background === bg.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              )}
            >
              <div
                className="size-6 rounded-lg border border-zinc-200 shrink-0"
                style={{ backgroundColor: bg.color }}
              />
              <span className={cn("text-xs font-medium", background === bg.value ? "text-indigo-700" : "text-zinc-600")}>
                {bg.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
