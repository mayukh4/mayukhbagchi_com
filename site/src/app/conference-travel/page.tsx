import type { Metadata } from 'next';
import TravelGlobe, { type TravelEvent } from '@/components/travel-globe';
import VLBIBackground from '@/components/vlbi-background';
import data from '../../../conference-travel.json';

export const metadata: Metadata = {
  title: "Conference & Travel",
  description: "Academic conferences, research presentations, and scientific travel by Mayukh Bagchi. Talks, posters, and research collaborations worldwide.",
  keywords: [
    "Mayukh Bagchi conferences",
    "astronomy research presentations",
    "VLBI instrumentation talks",
    "black hole imaging conferences",
    "academic conference travel",
    "research collaboration meetings",
    "astronomy poster presentations",
    "scientific conference speaking"
  ],
  openGraph: {
    title: "Conference & Travel - Mayukh Bagchi | Academic Presentations",
    description: "Academic conferences, research presentations, and scientific travel by Mayukh Bagchi. Talks, posters, and research collaborations worldwide.",
    type: "website",
  },
};

function geocodeApprox(city: string, province?: string, country?: string): { lat: number; lon: number } | null {
  // Minimal lookup for provided locations; extend as needed
  const key = `${city},${province||''},${country||''}`.toLowerCase();
  const map: Record<string, { lat: number; lon: number }> = {
    'waterloo,ontario,canada': { lat: 43.4643, lon: -80.5204 },
    'westford,massachusetts,united states': { lat: 42.5793, lon: -71.4373 },
    'cagliari,sardinia,italy': { lat: 39.2238, lon: 9.1217 },
    'minneapolis,minnesota,united states': { lat: 44.9778, lon: -93.2650 },
    'penticton,british columbia,canada': { lat: 49.4991, lon: -119.5937 },
    'timmins,ontario,canada': { lat: 48.4758, lon: -81.3305 },
    'socorro,new mexico,united states': { lat: 34.0584, lon: -106.8914 },
    'toronto,ontario,canada': { lat: 43.6532, lon: -79.3832 },
  };
  return map[key] || null;
}

function imageFor(ev: any): string | undefined {
  const name = `${(ev.event || '').toLowerCase()}`;
  // crude mapping by keyword
  if (name.includes('haystack')) return '/conference_travel_pics/haystack_july_2022.png';
  if (name.includes('casper')) return '/conference_travel_pics/casper_2022.png';
  if (name.includes('balloon')) return '/conference_travel_pics/balloon_tech_2023.png';
  if (name.includes('casca 2023')) return '/conference_travel_pics/casca_2023.png';
  if (name.includes('casca 2024')) return '/conference_travel_pics/casca_2024.png';
  if (name.includes('nrao') || name.includes('synthesis')) return '/conference_travel_pics/NRAO_2024.png';
  if (name.includes('stratos')) return '/conference_travel_pics/stratos_2023.png';
  if (name.includes('casca 2022')) return '/conference_travel_pics/casca_2022.png';
  return undefined;
}

export default function ConferenceTravelPage() {
  const raw = (data as any).conference_and_workshop_locations as any[];
  const events: TravelEvent[] = raw
    .map((ev, idx) => {
      const g = geocodeApprox(ev.city, ev.province_state, ev.country);
      if (!g) return null;
      return {
        id: `${idx}-${ev.city}`,
        event: ev.event,
        year: ev.year,
        city: ev.city,
        province_state: ev.province_state,
        country: ev.country,
        description: ev.description,
        presentation_type: ev.presentation_type,
        title: ev.title,
        lat: g.lat,
        lon: g.lon,
        image: imageFor(ev),
      } satisfies TravelEvent;
    })
    .filter(Boolean) as TravelEvent[];

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <VLBIBackground mode="travel" />
      <TravelGlobe events={events} />
      <section className="relative z-10 space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Conferences and Workshops</h1>
          <p className="mt-3 text-foreground/80 max-w-2xl">An interactive globe of places I’ve presented, trained, and collaborated. Click to expand</p>
        </div>
        {/* Globe is fixed and full-screen behind via TravelGlobe component */}
      </section>
    </div>
  );
}


