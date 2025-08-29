import { OptimizedPortrait } from "@/components/optimized-portrait";
import Link from "next/link";
import { Github, Linkedin, Mail, Youtube } from "lucide-react";
import dynamic from "next/dynamic";
import { VLBIBackgroundSkeleton } from "@/components/loading-skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: "https://mayukhbagchi.com/homepage.webp",
        width: 1200,
        height: 630,
        alt: "Mayukh Bagchi - PhD Astronomy Researcher",
      },
    ],
  },
  twitter: {
    images: ["https://mayukhbagchi.com/homepage.webp"],
  },
};

// Lazy load VLBI background for better initial load performance
const VLBIBackground = dynamic(() => import("@/components/vlbi-background"), {
  loading: () => <VLBIBackgroundSkeleton />,
});

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center">
      {/* Full-viewport subtle animated VLBI background */}
      <VLBIBackground />
      <section className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-10 md:gap-14 justify-center px-4">
        <div className="relative justify-self-center md:justify-self-start flex-shrink-0">
          <OptimizedPortrait />
        </div>
        <div className="relative min-w-0 md:max-w-2xl self-center">
          <h1 className="font-sans text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight">Mayukh Bagchi</h1>
          <p className="mt-4 text-lg text-foreground/85">MSc, PhD Candidate, Astronomy Science Communicator</p>
          <p className="mt-1 text-base text-foreground/70 max-w-2xl">Building balloon‑borne high‑frequency VLBI instruments.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            {/* GitHub */}
            <div className="relative group">
              <Link className="inline-flex items-center gap-2 border border-muted/50 hover:border-accent/60 rounded px-3 py-1.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_hsl(var(--accent))]" href="https://github.com/mayukh4" target="_blank" rel="noreferrer">
                <Github size={16} /> GitHub
              </Link>
              <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 z-20 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200">
                <div className="relative rounded-xl bg-background/95 border border-muted/50 shadow-lg px-4 py-3 text-xs text-foreground/90 min-w-[220px] max-w-[320px]">
                  Latest projects — hardware and software
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-background/95 border-l border-t border-muted/50" />
                </div>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="relative group">
              <Link className="inline-flex items-center gap-2 border border-muted/50 hover:border-accent/60 rounded px-3 py-1.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_hsl(var(--accent))]" href="https://www.linkedin.com/in/mayukh-bagchi/" target="_blank" rel="noreferrer">
                <Linkedin size={16} /> LinkedIn
              </Link>
              <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 z-20 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200">
                <div className="relative rounded-xl bg-background/95 border border-muted/50 shadow-lg px-4 py-3 text-xs text-foreground/90 min-w-[220px] max-w-[320px]">
                  My professional orbit — updates, talks, and connections
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-background/95 border-l border-t border-muted/50" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <Link className="inline-flex items-center gap-2 border border-muted/50 hover:border-accent/60 rounded px-3 py-1.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_hsl(var(--accent))]" href="mailto:mayukh.bagchi@queensu.ca">
                <Mail size={16} /> Email
              </Link>
              <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 z-20 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200">
                <div className="relative rounded-xl bg-background/95 border border-muted/50 shadow-lg px-4 py-3 text-xs text-foreground/90 min-w-[220px] max-w-[320px]">
                  Feel free to reach out
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-background/95 border-l border-t border-muted/50" />
                </div>
              </div>
            </div>

            {/* YouTube */}
            <div className="relative group">
              <Link className="inline-flex items-center gap-2 border border-muted/50 hover:border-accent/60 rounded px-3 py-1.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_hsl(var(--accent))]" href="https://www.youtube.com/@mayukh_bagchi" target="_blank" rel="noreferrer">
                <Youtube size={16} /> YouTube
              </Link>
              <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 z-20 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200">
                <div className="relative rounded-xl bg-background/95 border border-muted/50 shadow-lg px-4 py-3 text-xs text-foreground/90 min-w-[220px] max-w-[320px]">
                  Where I make videos on space and astronomy for everybody to enjoy
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-background/95 border-l border-t border-muted/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
