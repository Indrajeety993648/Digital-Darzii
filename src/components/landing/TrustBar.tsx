"use client";

const platforms = ["Myntra", "Flipkart", "Amazon", "Instagram", "Shopify", "Meesho", "Ajio", "Nykaa Fashion"];

export function TrustBar() {
  return (
    <div className="py-8 bg-[#0A0A0A] border-y border-white/[0.04] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
        <p className="text-white/25 text-[11px] uppercase tracking-[0.25em] font-medium mb-5">
          Built for sellers on
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {platforms.map((name) => (
            <span
              key={name}
              className="text-white/20 text-sm font-semibold tracking-wide hover:text-white/40 transition-colors duration-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
