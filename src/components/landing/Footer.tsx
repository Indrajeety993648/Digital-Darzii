import Link from "next/link";
import { Scissors } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Scissors className="size-5 text-indigo-400" />
              <span className="font-display text-lg font-semibold text-white">Digital Darzi</span>
            </Link>
            <p className="text-zinc-500 leading-relaxed max-w-sm">
              AI-powered virtual try-on for Indian fashion. Transform flat-lay photos into stunning on-model product images.
            </p>
            <p className="text-zinc-700 text-sm mt-4 font-medium">Built with AI for Indian Fashion 🇮🇳</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
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
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Info</h4>
            <ul className="space-y-3">
              {[
                { href: "#faq", label: "FAQ" },
                { href: "#showcase", label: "Examples" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-zinc-500 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">© 2024 Digital Darzi. All rights reserved.</p>
          <p className="text-zinc-700 text-sm">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
