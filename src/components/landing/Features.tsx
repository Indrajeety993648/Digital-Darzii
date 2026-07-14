"use client";
import { useRef, useEffect } from "react";

const features = [
  { title: "Indian Ethnic Wear", desc: "Optimized for sarees, lehengas, kurtas, sherwanis — draping and fit that looks natural." },
  { title: "Any Body Type", desc: "Upload any model photo. The AI adapts the garment to fit naturally regardless of body shape." },
  { title: "E-commerce Ready", desc: "Output sized and formatted for Myntra, Amazon, Flipkart listings. No post-processing needed." },
  { title: "Batch Processing", desc: "Upload multiple garments at once. Process your entire catalog overnight." },
  { title: "Background Control", desc: "Clean white background, studio lighting, or keep your model's original setting." },
  { title: "Privacy First", desc: "Your photos are processed and deleted. We never use your images for training." },
];

export function Features() {
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
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power4.out",
            scrollTrigger: { trigger: titleRef.current, start: "top 80%", once: true } }
        );

        const cards = sectionRef.current?.querySelectorAll(".feature-card");
        if (cards) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true } }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={titleRef} className="text-center mb-16 opacity-0">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need
          </h2>
          <p className="text-zinc-500 text-lg max-w-lg mx-auto">
            Professional product photography, simplified.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="feature-card group bg-[#141414] border border-white/[0.07] rounded-2xl p-8 hover:bg-[#1a1a1a] hover:border-white/15 hover:shadow-[0_4px_30px_rgba(255,255,255,0.04)] transition-all duration-300"
            >
              <div className="w-8 h-px bg-gradient-to-r from-white/30 to-transparent mb-5" />
              <h3 className="font-display text-lg font-semibold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">
                {f.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
