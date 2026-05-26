"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isLanding
          ? scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
          : "bg-white/80 backdrop-blur-xl border-b border-zinc-200"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Scissors
            className={cn("size-5", isLanding ? "text-indigo-400" : "text-indigo-600")}
          />
          <span
            className={cn(
              "font-display text-lg font-semibold tracking-tight",
              isLanding ? "text-white" : "text-zinc-900"
            )}
          >
            Digital Darzi
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { href: "/", label: "Home" },
            { href: "/generate", label: "Generate" },
            { href: "/gallery", label: "Gallery" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors",
                isLanding
                  ? "text-white/70 hover:text-white"
                  : "text-zinc-600 hover:text-zinc-900",
                pathname === href && (isLanding ? "text-white" : "text-zinc-900")
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link href="/generate">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/25"
          >
            Try Now
          </Button>
        </Link>
      </div>
    </header>
  );
}
