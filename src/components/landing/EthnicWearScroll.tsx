"use client";
import { useRef, useEffect } from "react";

const ethnicItems = [
  { category: "Saree",    emoji: "🥻", description: "Six yards of elegance. Perfect drape, every time." },
  { category: "Lehenga",  emoji: "👗", description: "Bridal to festive. Showcase the full volume." },
  { category: "Kurta",    emoji: "👘", description: "Everyday ethnic wear with a modern touch." },
  { category: "Sherwani", emoji: "🎽", description: "Men's ethnic wear for every occasion." },
];

export function EthnicWearScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current || !trackRef.current) return;

      ctx = gsap.context(() => {
        const getTotal = () =>
          trackRef.current
            ? trackRef.current.scrollWidth - window.innerWidth
            : 0;

        gsap.to(trackRef.current, {
          x: () => -getTotal(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${getTotal()}`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      }, sectionRef);
    };

    loadGSAP();
    return () => ctx?.revert();
  }, []);

  return (
    /* No overflow-hidden — it breaks GSAP's pin spacer */
    <section ref={sectionRef} className="relative bg-[#0A0A0A]">
      <div ref={trackRef} className="flex" style={{ width: `${ethnicItems.length * 100}vw` }}>
        {ethnicItems.map((item, i) => (
          <div
            key={i}
            className="ethnic-slide relative flex-none w-screen h-screen flex items-center justify-center bg-[#0A0A0A]"
          >
            {/* Large watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="font-display font-bold select-none"
                style={{ fontSize: "clamp(80px, 18vw, 200px)", color: "rgba(255,255,255,0.04)" }}
              >
                {item.category}
              </span>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-12 grid grid-cols-2 gap-16 items-center">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{item.emoji}</div>
                    <div className="text-zinc-500 text-sm">Flat-lay image</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-medium">
                  <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  0{i + 1} of 0{ethnicItems.length}
                </div>
                <h2 className="font-display text-5xl md:text-6xl font-bold text-white">{item.category}</h2>
                <p className="text-zinc-400 text-lg leading-relaxed">{item.description}</p>
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{item.emoji}</div>
                    <div className="text-indigo-300 text-sm font-medium">AI Result ✨</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
