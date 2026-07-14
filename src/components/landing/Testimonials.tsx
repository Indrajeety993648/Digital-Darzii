"use client";
import { useRef, useEffect } from "react";

const testimonials = [
  { name: "Priya Sharma", role: "Founder, Ethnic Stories", quote: "We used to spend ₹15,000 per shoot for 10 looks. Now we generate 50 in an afternoon." },
  { name: "Rahul Mehta", role: "D2C Brand, ThreadCraft", quote: "Our conversion rate on Myntra went up 2.3x after switching to AI-generated model photos." },
  { name: "Ananya Reddy", role: "Instagram Boutique Owner", quote: "I run my store solo. This tool replaced my need for a photographer entirely." },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const cards = sectionRef.current?.querySelectorAll(".testimonial-card");
        if (cards) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Sellers love it
          </h2>
          <p className="text-zinc-500 text-lg">Real feedback from real fashion businesses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="testimonial-card bg-[#181818] border border-white/[0.08] rounded-2xl p-8 relative hover:border-white/15 transition-all duration-300"
            >
              <span className="font-display text-7xl text-white/[0.08] absolute top-4 left-6 select-none leading-none">
                &ldquo;
              </span>
              <p className="text-white/70 text-base italic leading-relaxed mb-6 pt-6">
                {t.quote}
              </p>
              <div>
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
