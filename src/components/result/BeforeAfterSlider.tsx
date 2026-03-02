"use client";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  height?: number;
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, height = 500 }: BeforeAfterSliderProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl">
      <ReactCompareSlider
        style={{ height }}
        itemOne={
          <ReactCompareSliderImage
            src={beforeSrc}
            alt="Original garment"
            style={{ objectFit: "contain", background: "#f4f4f5" }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterSrc}
            alt="Generated result"
            style={{ objectFit: "cover" }}
          />
        }
        handle={
          <div className="flex items-center justify-center size-10 rounded-full bg-white shadow-xl">
            <svg className="size-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 9l-5 3 5 3M16 9l5 3-5 3M12 3v18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        }
      />
    </div>
  );
}
