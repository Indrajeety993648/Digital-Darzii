"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Scissors } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Scissors className="size-5 text-white/60" />
          <span className="font-display text-lg font-semibold tracking-tight text-white">
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
              className={`text-sm font-medium transition-colors ${
                pathname === href ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/generate"
          className="bg-white text-black hover:bg-white/90 font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          Try Now
        </Link>
      </div>
    </header>
  );
}
