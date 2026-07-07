"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const ctaItems = sectionRef.current?.querySelectorAll(".cta-content > *");
        if (ctaItems && ctaItems.length > 0) {
          gsap.fromTo(
            Array.from(ctaItems),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power4.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true } }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-[#0F0F0F]"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center cta-content">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ship better product photos today
        </h2>
        <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
          5 free generations. No credit card. Results in under a minute.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-black font-semibold text-base hover:bg-white/90 transition-all shadow-2xl shadow-white/[0.05] hover:-translate-y-0.5"
        >
          Try it free
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
