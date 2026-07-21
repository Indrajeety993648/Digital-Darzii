"use client";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

const featured = { before: "/showcase/before-hero.jpg", after: "/showcase/after-hero.jpg", label: "Maroon Ruffle Dress" };

const showcaseItems = [
  { before: "/showcase/before-1.jpg", after: "/showcase/after-1.jpg", label: "Maroon Dress — Studio" },
  { before: "/showcase/before-2.jpg", after: "/showcase/after-2.jpg", label: "Victorian Gown" },
];

function ShowcaseCard({ item }: { item: typeof showcaseItems[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="showcase-card group relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] hover:border-white/20 transition-all duration-500 cursor-pointer hover:shadow-[0_8px_60px_rgba(255,255,255,0.06)]"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* Before image — flat-lay with neutral bg */}
        <div
          className="absolute inset-0 bg-[#f0ede8] flex items-center justify-center transition-all duration-700 ease-out"
          style={{ clipPath: hovered ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)" }}
        >
          <img
            src={item.before}
            alt={`${item.label} flat lay`}
            className="w-full h-full object-contain p-4"
          />
        </div>
        {/* After image — model shot fills card */}
        <img
          src={item.after}
          alt={`${item.label} on model`}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
          style={{
            clipPath: hovered ? "inset(0 0% 0 0)" : "inset(0 0 0 100%)",
          }}
        />

        {/* Labels */}
        <div
          className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white/60 uppercase tracking-wider transition-opacity duration-500"
          style={{ opacity: hovered ? 0 : 1 }}
        >
          Before
        </div>
        <div
          className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-white/90 text-[11px] font-medium text-black uppercase tracking-wider transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          After
        </div>

        {/* Bottom gradient for text */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Info bar */}
      <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between">
        <div>
          <span className="text-white font-display font-semibold text-base">{item.label}</span>
          <span className="block text-white/30 text-xs mt-0.5">AI-generated try-on</span>
        </div>
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium transition-all duration-500 group-hover:text-white/60">
          {hovered ? "After" : "Hover"}
        </span>
      </div>
    </motion.div>
  );
}

export function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power4.out",
            scrollTrigger: { trigger: titleRef.current, start: "top 80%", once: true } }
        );

        const cards = sectionRef.current?.querySelectorAll(".showcase-card");
        if (cards) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 50, scale: 0.96 },
            {
              opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08, ease: "power3.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  return (
    <section ref={sectionRef} id="showcase" className="py-32 bg-[#0C0C0C] relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div ref={titleRef}>
            <p className="text-white/30 text-xs uppercase tracking-widest font-medium mb-3">Results</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
              Before &amp; After
            </h2>
          </div>
          <p className="text-zinc-500 text-base max-w-sm md:text-right">
            Raw AI output. No retouching, no manual editing, no post-processing.
          </p>
        </div>

        {/* Featured — compare slider */}
        <div className="showcase-card mb-8 rounded-2xl overflow-hidden border border-white/10 bg-[#111] transition-all duration-300 hover:border-white/20 hover:shadow-[0_8px_60px_rgba(255,255,255,0.05)]">
          <div className="relative h-[520px]">
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src={featured.before}
                  alt="Garment flat lay"
                  style={{ objectFit: "contain", height: "100%", width: "100%", backgroundColor: "#f0ede8" }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={featured.after}
                  alt="Model wearing garment"
                  style={{ objectFit: "cover", height: "100%", width: "100%" }}
                />
              }
              style={{ height: "100%" }}
              position={40}
              handle={
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-xl shadow-black/40 border-2 border-white/80">
                  <svg className="size-4 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l-3 3 3 3M18 9l3 3-3 3" />
                  </svg>
                </div>
              }
            />
            {/* Labels */}
            <div className="absolute top-5 left-5 z-10 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium text-white/70 border border-white/10">
              Flat-lay input
            </div>
            <div className="absolute top-5 right-5 z-10 px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-black">
              AI output
            </div>
            {/* Bottom bar */}
            <div className="absolute bottom-0 inset-x-0 z-10 px-6 py-4 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between">
              <div>
                <span className="font-display text-lg font-semibold text-white">{featured.label}</span>
                <span className="block text-white/40 text-xs mt-0.5">Drag the slider to compare</span>
              </div>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Featured</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {showcaseItems.map((item, i) => (
            <ShowcaseCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
