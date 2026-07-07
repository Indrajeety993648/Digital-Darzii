"use client";
import Link from "next/link";
import { Scissors, ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/[0.05] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top brand section */}
        <div className="mb-16">
          <Link href="/" className="flex items-center gap-2.5 mb-3">
            <Scissors className="size-6 text-white/60" />
            <span className="font-display text-2xl font-bold text-white">Digital Darzi</span>
          </Link>
          <p className="text-zinc-500 max-w-md leading-relaxed">
            AI-powered virtual try-on built for Indian fashion. Transform flat-lay garment photos into studio-quality product shots.
          </p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-xs uppercase tracking-widest">Product</h4>
            <ul className="space-y-3">
              {[
                { href: "/generate", label: "Generate" },
                { href: "/gallery", label: "Gallery" },
                { href: "#how-it-works", label: "How It Works" },
                { href: "#pricing", label: "Pricing" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-zinc-500 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-xs uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3">
              {[
                { href: "#", label: "Documentation" },
                { href: "#", label: "API Reference" },
                { href: "#", label: "Changelog" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-zinc-500 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-xs uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3">
              {[
                { href: "#", label: "Privacy Policy" },
                { href: "#", label: "Terms of Service" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-zinc-500 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-xs uppercase tracking-widest">Connect</h4>
            <ul className="space-y-3">
              {[
                { href: "#", label: "Twitter" },
                { href: "#", label: "Instagram" },
                { href: "mailto:hello@digitaldarzi.in", label: "Email" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-zinc-500 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">© 2025 Digital Darzi. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="text-zinc-600 text-sm">Made in India</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="size-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
