"use client";
import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Try it out, no commitment",
    generations: "5 generations",
    features: ["Basic quality output", "Standard models", "JPG download", "Community support"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "₹1,499",
    period: "/month",
    description: "For growing fashion sellers",
    generations: "100 generations",
    features: ["HD quality output", "All model types", "PNG + JPG download", "Ethnic wear poses", "Priority support"],
    cta: "Get Started",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Pro",
    price: "₹9,999",
    period: "/month",
    description: "For established brands",
    generations: "2,000 generations",
    features: ["4K ultra quality", "All model types", "Bulk processing", "API access", "Custom backgrounds", "Dedicated support"],
    cta: "Go Pro",
    highlighted: false,
  },
];

export function Pricing() {
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

        const cards = sectionRef.current?.querySelectorAll(".pricing-card");
        if (cards) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 40, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "power3.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true } }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };
    loadGSAP();
  }, []);

  const handlePlanClick = useCallback(() => {
    toast({
      title: "Coming soon!",
      description: "Payments are not available in the MVP. Using free tier.",
    });
  }, []);

  const handle3DTilt = useCallback(async (e: React.MouseEvent<HTMLDivElement>, cardEl: HTMLDivElement) => {
    const gsap = (await import("gsap")).default;
    const rect = cardEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    gsap.to(cardEl, { rotateX: y, rotateY: x, duration: 0.4, ease: "power2.out", transformPerspective: 800 });
  }, []);

  const handleTiltReset = useCallback(async (cardEl: HTMLDivElement) => {
    const gsap = (await import("gsap")).default;
    gsap.to(cardEl, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="py-32 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div ref={titleRef} className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Simple Pricing
          </div>
          <p className="text-zinc-500 text-lg">No hidden fees. Cancel anytime. All prices in INR.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card relative rounded-2xl p-8 flex flex-col gap-6 transition-shadow ${
                plan.highlighted
                  ? "bg-white/10 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20"
                  : "bg-white/5 border border-white/10"
              }`}
              style={{ transformStyle: "preserve-3d" }}
              onMouseMove={(e) => handle3DTilt(e, e.currentTarget)}
              onMouseLeave={(e) => handleTiltReset(e.currentTarget)}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shimmer-badge">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-zinc-500 text-sm">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-500">{plan.period}</span>
              </div>

              <div className="text-indigo-400 text-sm font-medium bg-indigo-400/10 px-3 py-1.5 rounded-lg w-fit">
                {plan.generations}
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-zinc-300 text-sm">
                    <Check className="size-4 text-indigo-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handlePlanClick}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
