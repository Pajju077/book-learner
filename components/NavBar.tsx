"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Plus, Tag, BarChart2, Archive, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home", icon: BookOpen },
  { href: "/add-highlight", label: "Add Highlight", icon: Plus },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/books", label: "Books", icon: BarChart2 },
  { href: "/archive", label: "Archive", icon: Archive },
];

export default function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-ink-950 border-b border-ink-800">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-gold-500 text-xl">📖</span>
          <span className="font-serif text-parchment-100 text-lg font-semibold tracking-tight group-hover:text-parchment-300 transition-colors">
            Book Learner
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-sans transition-all ${
                  active
                    ? "bg-parchment-500/20 text-parchment-300"
                    : "text-ink-300 hover:text-parchment-200 hover:bg-ink-800"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ink-300 hover:text-parchment-200 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ink-900 border-t border-ink-800 px-4 py-3 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-sans transition-all ${
                  active
                    ? "bg-parchment-500/20 text-parchment-300"
                    : "text-ink-300 hover:text-parchment-200"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
