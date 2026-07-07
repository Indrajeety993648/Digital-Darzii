"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, User, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Garment",
    description: "Drop a flat-lay or hanger photo. We handle the rest — segmentation, masking, everything.",
  },
  {
    number: "02",
    icon: User,
    title: "Add Your Model",
    description: "Upload a front-facing full-body photo. Any person, any pose, any background.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Download Result",
    description: "AI fits the garment naturally onto the model. Studio-quality output in under 60 seconds.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: "power4.out",
            scrollTrigger: { trigger: titleRef.current, start: "top 80%", once: true },
          }
        );

        const cards = cardsRef.current?.querySelectorAll(".step-card");
        if (cards) {
          cards.forEach((card, i) => {
            gsap.fromTo(
              card,
              { opacity: 0, y: 40 },
              {
                opacity: 1, y: 0, duration: 0.7, ease: "power4.out",
                scrollTrigger: { trigger: card, start: "top 80%", once: true },
                delay: i * 0.15,
              }
            );
          });
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-32 bg-[#0F0F0F] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={titleRef} className="text-center mb-20 opacity-0">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-zinc-500 text-lg max-w-lg mx-auto">
            Three steps. Under a minute. No technical skill required.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                className="step-card group relative p-8 rounded-2xl bg-[#181818] border border-white/[0.08] hover:-translate-y-2 transition-all duration-300 hover:border-white/15 hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-6 right-6 font-display text-6xl font-bold text-white/[0.04] select-none">
                  {step.number}
                </div>
                <div className="inline-flex p-3 rounded-xl bg-white/10 mb-6">
                  <Icon className="size-6 text-white/50" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
