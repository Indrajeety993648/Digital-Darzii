"use client";
import { useRef, useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What types of clothing are supported?",
    a: "Digital Darzi supports all types of Indian and western clothing — sarees, lehengas, kurtas, sherwanis, dresses, tops, trousers, and more. Any flat-lay or mannequin photo works.",
  },
  {
    q: "How long does generation take?",
    a: "Generation takes approximately 40-60 seconds per image on our cloud GPUs. Model weights are cached after the first run for faster subsequent generations.",
  },
  {
    q: "What image formats are accepted?",
    a: "We accept JPEG, PNG, and WebP images up to 10MB. For best results, use a well-lit flat-lay photo on a white or neutral background at minimum 800×800 resolution.",
  },
  {
    q: "Is this suitable for Indian ethnic wear?",
    a: "Absolutely. We've specifically optimized for Indian ethnic wear — including saree draping, lehenga stances, and kurta styling that's true to Indian fashion aesthetics.",
  },
  {
    q: "Can I use the results commercially?",
    a: "Yes. All images you generate belong to you and can be used for e-commerce listings, social media, catalogs, and other commercial purposes.",
  },
];

export function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const els = sectionRef.current?.querySelectorAll(".faq-animate");
        if (els && els.length > 0) {
          gsap.fromTo(
            Array.from(els),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true } }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="py-32 bg-[#0C0C0C]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16">
          {/* Left — sticky title */}
          <div className="lg:sticky lg:top-32 self-start faq-animate">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Questions &<br />Answers
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-8">
              Everything you need to know before getting started.
            </p>
            <a
              href="mailto:hello@digitaldarzi.in"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              Still have questions? Get in touch
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Right — accordions */}
          <div className="space-y-3 faq-animate">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                  openIndex === i
                    ? "border-l-2 border-l-white/30 border-white/10 bg-[#151515]"
                    : "border-white/[0.08] bg-[#111111] hover:bg-[#151515]"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="font-medium text-white pr-4">{faq.q}</span>
                  <span className="shrink-0 text-zinc-500">
                    {openIndex === i ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-zinc-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
