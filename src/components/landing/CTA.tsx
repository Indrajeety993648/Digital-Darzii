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
        // Animated gradient position
        gsap.to(sectionRef.current, {
          backgroundPosition: "100% 50%",
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

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
      className="relative py-32 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #6d28d9 75%, #7c3aed 100%)",
        backgroundSize: "200% 200%",
        backgroundPosition: "0% 50%",
      }}
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")"
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center cta-content">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-8">
          <span className="size-2 rounded-full bg-green-400 animate-pulse" />
          Free during beta
        </div>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Transform Your Product Photos?
        </h2>
        <p className="text-white/70 text-xl mb-10 max-w-2xl mx-auto">
          Join thousands of Indian fashion sellers already using AI to create studio-quality product photos.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-indigo-700 font-bold text-lg hover:bg-white/90 transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5"
        >
          Start Generating — It&apos;s Free
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
