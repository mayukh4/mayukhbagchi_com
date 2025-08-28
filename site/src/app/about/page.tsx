import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import IndieCard from '@/components/indie-card';
import TelescopeCarousel from '@/components/telescope-carousel';

// Lazy load VLBI background (no SSR restriction for server components)
const VLBIBackground = dynamic(() => import('@/components/vlbi-background'), {
  loading: () => null,
});

export const metadata: Metadata = {
  title: "About Me",
  description: "Learn about Mayukh Bagchi's journey in astronomy, education, and expertise in VLBI instrumentation for black hole imaging and photon ring studies.",
  keywords: [
    "Mayukh Bagchi biography",
    "astronomy researcher profile",
    "VLBI instrumentation PhD",
    "Queen's University astronomy",
    "black hole imaging researcher",
    "balloon-borne VLBI expert"
  ],
  openGraph: {
    title: "About Mayukh Bagchi - PhD Astronomy Researcher Profile",
    description: "Learn about Mayukh Bagchi's journey in astronomy, education, and expertise in VLBI instrumentation for black hole imaging.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <VLBIBackground mode="about" hideBlackHole />
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10 items-start">
        {/* Beautiful telescope carousel */}
        <div className="md:col-span-2">
          <TelescopeCarousel />
        </div>

        {/* Copy */}
        <div className="md:col-span-3 space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">About me</h1>
          <div className="space-y-5 text-foreground/90 max-w-2xl leading-relaxed text-[0.98rem] md:text-base rounded-2xl border border-[hsl(var(--muted)/0.18)] bg-[hsl(var(--background)/0.03)] hover:bg-[hsl(var(--background)/0.06)] transition-colors p-5 md:p-6">
            <p>
              Hello, I’m Mayukh (ময়ূখ) — a PhD candidate in Astronomy at Queen’s University. After a bachelor’s in Electrical Engineering, I moved to Canada to pursue a lifelong dream: doing astronomy.
            </p>
            <p>
              I build high‑frequency, balloon‑borne radio instrumentation for VLBI — the technology that links telescopes across the Earth to see the finest details in the Universe. This work lets me combine hands‑on hardware with research, designing new instruments and improving existing ones.
            </p>
            <p>
              My current focus is advancing balloon‑borne high‑frequency VLBI to sharpen images of black‑hole shadows — and one day, resolve photon rings.
            </p>
            <p>
              When I’m not working, you’ll find me powerlifting at the gym or playing guitar. I also enjoy making science‑outreach videos on YouTube, sharing my love for astronomy with a wider audience.
            </p>
          </div>
        </div>
      </section>

      {/* Indie maker section */}
      <section className="relative z-10 mt-10 md:mt-14 space-y-6">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Indie projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <IndieCard
            title="Gift the Stars"
            href="https://giftthestars.com"
            description="A custom star‑chart maker that preserves a special moment in the night sky — designed, generated, and fulfilled end‑to‑end."
          />
        </div>
      </section>
    </div>
  );
}


