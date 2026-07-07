"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAndAnimate = async () => {
      const gsap = (await import("gsap")).default;
      const { SplitText } = await import("gsap/SplitText");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(SplitText, ScrollTrigger);

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        if (headingRef.current) {
          const split = new SplitText(headingRef.current, { type: "lines,words" });
          gsap.set(split.words, { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" });
          tl.to(
            split.words,
            { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.8, stagger: 0.06, ease: "power4.out" },
            "+=0.2"
          );
        }

        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        );

        tl.fromTo(
          buttonsRef.current?.children ? Array.from(buttonsRef.current.children) : [],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 },
          "-=0.4"
        );

        tl.fromTo(
          visualRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
          "-=0.6"
        );
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
      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-[1fr_420px] gap-12 items-center w-full">
        {/* LEFT */}
        <div className="space-y-8">
          {/* Heading */}
          <div
            ref={headingRef}
            className="font-display text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight text-white"
          >
            Your garments.
            <br />
            Their best angle.
          </div>

          {/* Subtitle */}
          <p ref={subtitleRef} className="text-lg text-zinc-500 leading-relaxed max-w-md opacity-0">
            Photograph-quality product shots from a flat-lay. No studio, no models, no wait.
          </p>

          {/* Buttons */}
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4">
            <MagneticButton>
              <Link
                href="/generate"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-semibold text-base transition-all hover:bg-white/90 shadow-2xl shadow-white/10"
              >
                Start generating
                <svg className="ml-2 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MagneticButton>

            <a
              href="#showcase"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-medium text-base transition-colors"
            >
              See examples
            </a>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-0 pt-6">
            {[
              { value: "<60s", label: "Generation Time" },
              { value: "₹0", label: "Per Image (Free Tier)" },
              { value: "4 Steps", label: "Upload to Download" },
            ].map(({ value, label }, i) => (
              <div key={label} className={`${i > 0 ? "border-l border-white/10 pl-6 ml-6" : ""}`}>
                <div className="font-display text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/30 uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Before/After Slider */}
        <div ref={visualRef} className="opacity-0 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10 h-[520px]">
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src="/showcase/before-hero.jpg"
                  alt="Flat-lay garment"
                  style={{ objectFit: "contain", width: "100%", height: "520px", backgroundColor: "#f0ede8" }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src="/showcase/after-hero.jpg"
                  alt="Model wearing garment"
                  style={{ objectFit: "cover", width: "100%", height: "520px" }}
                />
              }
              style={{ height: "520px" }}
              handle={
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-xl shadow-black/30">
                  <svg className="size-5 text-zinc-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 7l-5 5 5 5M18 7l5 5-5 5" />
                  </svg>
                </div>
              }
            />
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-white/60 text-xs font-medium border border-white/10">
              Before
            </div>
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-white text-black text-xs font-medium">
              After
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
