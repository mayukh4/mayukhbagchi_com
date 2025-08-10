"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";

  const links = [
    { href: "/about", label: "About" },
    { href: "/research", label: "Research" },
    { href: "/conference-travel", label: "Conference & Travel" },
    { href: "/cv", label: "CV" },
    { href: "/outreach", label: "Outreach" },
    { href: "/contact", label: "Contact" },
  ];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-muted/40 bg-background/70">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
        <Link href="/" className="flex items-center">
          <span className="font-sans text-sm md:text-base font-semibold tracking-tight">Mayukh Bagchi</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-foreground/80">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn("hover:text-accent transition-colors")}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}


