"use client";
import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

export function MagneticButton({ children, className, strength = 0.4, onClick }: MagneticButtonProps) {
  const btnRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!btnRef.current) return;
      const gsap = (await import("gsap")).default;
      const rect = btnRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) * strength;
      const dy = (e.clientY - centerY) * strength;
      gsap.to(btnRef.current, { x: dx, y: dy, duration: 0.3, ease: "power2.out" });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(async () => {
    if (!btnRef.current) return;
    const gsap = (await import("gsap")).default;
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  }, []);

  return (
    <div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn("inline-block cursor-pointer", className)}
    >
      {children}
    </div>
  );
}
