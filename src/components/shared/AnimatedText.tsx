"use client";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function AnimatedText({ text, className, delay = 0, once = true }: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText } = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);

      if (!ref.current) return;
      const split = new SplitText(ref.current, { type: "words" });
      gsap.set(split.words, { opacity: 0, y: 30 });
      gsap.to(split.words, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "power4.out",
        delay,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once,
        },
      });
    };
    loadGSAP();
  }, [delay, once]);

  return <div ref={ref} className={className}>{text}</div>;
}
