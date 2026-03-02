"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, User, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Garment",
    description: "Drop your flat-lay or mannequin photo. Supports JPEG, PNG, WebP up to 10MB.",
    color: "from-indigo-500 to-indigo-600",
    glowColor: "shadow-indigo-500/20",
  },
  {
    number: "02",
    icon: User,
    title: "Choose Model",
    description: "Select gender, body type, skin tone, pose, and background style.",
    color: "from-violet-500 to-violet-600",
    glowColor: "shadow-violet-500/20",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get Results",
    description: "Download studio-quality on-model photos in approximately 40 seconds.",
    color: "from-pink-500 to-rose-600",
    glowColor: "shadow-pink-500/20",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const ctx = gsap.context(() => {
        // Title reveal
        if (titleRef.current) {
          const split = new SplitText(titleRef.current, { type: "words" });
          gsap.fromTo(
            split.words,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power4.out",
              scrollTrigger: { trigger: titleRef.current, start: "top 80%", once: true },
            }
          );
        }

        // Cards entrance
        const cards = cardsRef.current?.querySelectorAll(".step-card");
        if (cards) {
          const directions = [{ x: -60, y: 0 }, { x: 0, y: 40 }, { x: 60, y: 0 }];
          cards.forEach((card, i) => {
            gsap.fromTo(
              card,
              { opacity: 0, ...directions[i] },
              {
                opacity: 1, x: 0, y: 0, duration: 0.7, ease: "power4.out",
                scrollTrigger: { trigger: card, start: "top 80%", once: true },
                delay: i * 0.15,
              }
            );
          });
        }

        // SVG line draw
        if (lineRef.current) {
          const length = lineRef.current.getTotalLength();
          gsap.set(lineRef.current, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(lineRef.current, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 70%",
              end: "bottom 60%",
              scrub: 1,
            },
          });
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-20">
          <div ref={titleRef} className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </div>
          <p className="text-zinc-500 text-lg max-w-lg mx-auto">
            Three simple steps to transform your product photography forever
          </p>
        </div>

        {/* Cards + SVG line */}
        <div ref={cardsRef} className="relative">
          {/* Connecting SVG line (desktop only) */}
          <svg
            className="absolute top-16 left-[calc(16%+80px)] right-[calc(16%+80px)] hidden lg:block"
            style={{ width: "calc(68% - 160px)", height: "4px", overflow: "visible" }}
            viewBox="0 0 400 4"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 2 Q 200 2 400 2"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2"
              strokeDasharray="6 4"
              ref={lineRef}
            />
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Step cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  className={`step-card group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300 ${step.glowColor} hover:shadow-xl`}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Number */}
                  <div className="absolute top-6 right-6 font-display text-6xl font-bold text-white/5 select-none">
                    {step.number}
                  </div>
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.color} mb-6 shadow-lg`}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
