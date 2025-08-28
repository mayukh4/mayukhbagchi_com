import type { Metadata } from 'next';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import LatestVideos from '@/components/latest-videos';
import YouTubeStatsCard from '@/components/youtube-stats-card';

// Lazy load VLBI background
const VLBIBackground = dynamic(() => import('@/components/vlbi-background'), {
  loading: () => null,
});

export const metadata: Metadata = {
  title: "Outreach",
  description: "Public talks, workshops, and science communication by Mayukh Bagchi. Astronomy education and outreach for diverse audiences.",
  keywords: [
    "Mayukh Bagchi outreach",
    "astronomy public talks",
    "science communication",
    "astronomy workshops",
    "astronomy education",
    "space science outreach",
    "astronomy YouTube content",
    "science communicator"
  ],
  openGraph: {
    title: "Outreach - Mayukh Bagchi | Science Communication & Public Engagement",
    description: "Public talks, workshops, and science communication by Mayukh Bagchi. Astronomy education and outreach for diverse audiences.",
    type: "website",
    url: "https://mayukhbagchi.com/outreach",
    images: [
      {
        url: "https://mayukhbagchi.com/outreach/mayukh_bagchi_3MT_finalist.webp",
        width: 1200,
        height: 630,
        alt: "Mayukh Bagchi - Science Communication & Outreach",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Outreach - Mayukh Bagchi | Science Communication",
    description: "Public talks, workshops, and astronomy education by PhD researcher Mayukh Bagchi.",
    images: ["https://mayukhbagchi.com/outreach/mayukh_bagchi_3MT_finalist.webp"],
  },
  alternates: {
    canonical: "https://mayukhbagchi.com/outreach",
  },
};

export default function OutreachPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Space-like background with stars + faint constellations, no black hole, Earth in corner */}
      <VLBIBackground mode="outreach" hideBlackHole />

      {/* Hero intro */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10 items-start">
        {/* Photo */}
        <div className="md:col-span-2">
          <div className="relative w-full h-[38vh] md:h-[54vh] rounded-2xl overflow-hidden border border-[hsl(var(--muted)/0.35)] shadow-2xl bg-[hsl(var(--background)/0.2)]/80">
            <Image src="/outreach/mayukh_bagchi_3MT_finalist.webp" alt="Outreach talk" fill className="object-cover select-none" sizes="(min-width: 768px) 40vw, 100vw" />
          </div>
          <p className="text-center text-sm text-foreground/70 mt-2">Queen's 3MT Thesis finalist</p>
        </div>

        {/* Copy */}
        <div className="md:col-span-3 space-y-5 max-w-2xl">
          <h1 className="font-sans text-4xl md:text-5xl font-semibold tracking-tight">Outreach</h1>
          <p className="font-sans text-foreground/90 leading-relaxed text-[0.98rem] md:text-base">
            Growing up, science talks by great communicators sparked my curiosity. I believe scientists should actively share the joy of discovery with everyone — to inspire the next generation and to make high‑quality information accessible.
          </p>
          <p className="font-sans text-foreground/90 leading-relaxed text-[0.98rem] md:text-base">
            I'm on a mission to bring astronomy to as many people as I can. I volunteer at the Queen's Observatory open houses and community events in Kingston, and create online videos about space and physics.
          </p>
          
          {/* Small YouTube Stats Card */}
          <div className="mt-6">
            <YouTubeStatsCard />
          </div>
        </div>
      </section>

      {/* Observatory section (images + text grid) */}
      <section className="relative z-10 mt-10 md:mt-14 space-y-6">
        <h2 className="font-sans text-2xl md:text-3xl font-semibold tracking-tight">Active participant/volunteer for the Queen's Observatory</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 items-start">
          {/* Single required image on the left */}
          <div className="md:col-span-3">
            <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden border border-muted/35 shadow-xl bg-[hsl(var(--background)/0.2)]/80">
              <Image src="/outreach/mayukh_bagchi_queens_observatory.webp" alt="Queen's Observatory Open House" fill className="object-contain p-1" />
            </div>
          </div>
          {/* Copy on the right */}
          <div className="md:col-span-3">
            <p className="font-sans text-foreground/90 leading-relaxed text-[0.98rem] md:text-base">
              I volunteer at the Queen's Observatory, where we host monthly open houses with talks, observing, and Q&amp;A for the public. It's a great opportunity to share the wonder of the night sky and spark curiosity.
            </p>
          </div>
        </div>
      </section>

      {/* Eclipse/City section */}
      <section className="relative z-10 mt-10 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 items-start">
          <div className="md:col-span-2 space-y-4 text-[0.98rem] md:text-base text-foreground/90 leading-relaxed">
            <p>
              I also served as a Queen's Eclipse ambassador for the 2024 total solar eclipse. Kingston was under the path of totality — it was amazing to work with the city at Market Square to help thousands enjoy a safe and unforgettable view.
            </p>
          </div>
          <div className="md:col-span-3 relative h-56 md:h-72 rounded-2xl overflow-hidden border border-muted/30 shadow-xl bg-[hsl(var(--background)/0.2)]/80">
            <Image src="/outreach/mayukh_bagchi_2024_kingston_canada_total_solar_eclipse.webp" alt="Total solar eclipse" fill className="object-contain p-1" />
          </div>
        </div>
      </section>

      {/* Latest videos section with 3x3 grid */}
      <section className="relative z-10 mt-10 md:mt-14 space-y-6">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Below are some of my latest videos:</h2>
        {/* @ts-expect-error Server Component */}
        <LatestVideos limit={9} />
      </section>
    </div>
  );
}


