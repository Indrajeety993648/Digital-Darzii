"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What types of clothing are supported?",
    a: "Digital Darzi supports all types of Indian and western clothing — sarees, lehengas, kurtas, sherwanis, dresses, tops, trousers, and more. Any flat-lay or mannequin photo works.",
  },
  {
    q: "How long does generation take?",
    a: "With a GPU, generation takes approximately 40-60 seconds per image. Without a GPU (CPU-only mode), it takes 3-5 minutes. Model weights are cached after the first run.",
  },
  {
    q: "What image formats are accepted?",
    a: "We accept JPEG, PNG, and WebP images up to 10MB. For best results, use a well-lit flat-lay photo on a white or neutral background at minimum 800×800 resolution.",
  },
  {
    q: "Is this suitable for Indian ethnic wear?",
    a: "Absolutely! We've specifically optimized our model templates and poses for Indian ethnic wear — including saree draping poses, lehenga stances, and kurta styling that's true to Indian fashion aesthetics.",
  },
  {
    q: "Can I use the results commercially?",
    a: "Yes. All images you generate belong to you and can be used for your e-commerce listings, social media, catalogs, and other commercial purposes.",
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
        const faqTitle = sectionRef.current?.querySelector(".faq-title");
        if (faqTitle) {
          gsap.fromTo(
            faqTitle,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power4.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true } }
          );
        }
        const faqItems = sectionRef.current?.querySelectorAll(".faq-item");
        if (faqItems && faqItems.length > 0) {
          gsap.fromTo(
            Array.from(faqItems),
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power3.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true } }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="py-32 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="faq-title font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Questions?
          </div>
          <p className="text-zinc-500 text-lg">Everything you need to know about Digital Darzi</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="faq-item rounded-xl border border-white/10 bg-white/5 overflow-hidden"
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
                    <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-white/5">
                      <div className="pt-4">{faq.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
