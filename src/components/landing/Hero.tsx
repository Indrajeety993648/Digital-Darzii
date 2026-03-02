"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { cn } from "@/lib/utils";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAndAnimate = async () => {
      const gsap = (await import("gsap")).default;
      const { SplitText } = await import("gsap/SplitText");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(SplitText, ScrollTrigger);

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // Badge entrance
        tl.fromTo(badgeRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 });

        // Heading SplitText reveal
        if (headingRef.current) {
          const split = new SplitText(headingRef.current, { type: "lines,words" });
          gsap.set(split.words, { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" });
          tl.to(
            split.words,
            { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.8, stagger: 0.06, ease: "power4.out" },
            "-=0.3"
          );
        }

        // Subtitle
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        );

        // Buttons
        tl.fromTo(
          buttonsRef.current?.children ? Array.from(buttonsRef.current.children) : [],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 },
          "-=0.4"
        );

        // Stats
        tl.fromTo(
          statsRef.current?.children ? Array.from(statsRef.current.children) : [],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
          "-=0.3"
        );

        // Visual
        tl.fromTo(
          visualRef.current,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" },
          "-=0.8"
        );

        // Floating animation on visual
        gsap.to(visualRef.current, {
          y: -12,
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.5,
        });
      }, sectionRef);

      return () => ctx.revert();
    };

    loadAndAnimate();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center bg-[#0A0A0A] overflow-hidden"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center w-full">
        {/* LEFT */}
        <div className="space-y-8">
          {/* Badge */}
          <div ref={badgeRef} className="opacity-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium">
              <span className="size-2 rounded-full bg-indigo-400 animate-pulse" />
              AI-Powered Fashion Studio
            </div>
          </div>

          {/* Heading */}
          <div
            ref={headingRef}
            className="font-display text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            <span className="block text-white">Transform Your</span>
            <span className="block text-white">Garments Into</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Model Photos
            </span>
          </div>

          {/* Subtitle */}
          <p ref={subtitleRef} className="text-lg text-zinc-400 leading-relaxed max-w-lg opacity-0">
            Upload flat-lay photos. Pick your model. Get studio-quality product shots in seconds.{" "}
            <span className="text-zinc-300 font-medium">Built for Indian fashion.</span>
          </p>

          {/* Buttons */}
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4">
            <MagneticButton>
              <Link
                href="/generate"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-colors shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50"
              >
                Start Generating
                <svg className="ml-2 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MagneticButton>

            <a
              href="#showcase"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold text-base transition-colors"
            >
              See Examples
            </a>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="flex flex-wrap gap-8 pt-4">
            {[
              { value: "10K+", label: "Images Generated" },
              { value: "40s", label: "Avg Processing" },
              { value: "100%", label: "Indian Ethnic Wear" },
            ].map(({ value, label }) => (
              <div key={label} className="opacity-0">
                <div className="font-display text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Before/After Slider */}
        <div ref={visualRef} className="opacity-0 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src="/showcase/before-hero.jpg"
                  alt="Flat-lay garment"
                  style={{ objectFit: "cover", height: "580px" }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src="/showcase/after-hero.jpg"
                  alt="Model wearing garment"
                  style={{ objectFit: "cover", height: "580px" }}
                />
              }
              style={{ height: "580px" }}
              handle={
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-xl shadow-black/30">
                  <svg className="size-5 text-zinc-800" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5l-7 7 7 7M16 5l7 7-7 7" strokeWidth="0" />
                    <path d="M8 12h8M6 7l-5 5 5 5M18 7l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              }
            />
            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs font-medium border border-white/10">
              Before
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-indigo-600/80 backdrop-blur text-white text-xs font-medium">
              After ✨
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-600 to-transparent" />
      </div>
    </section>
  );
}
