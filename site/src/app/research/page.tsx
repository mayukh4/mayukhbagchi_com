import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Research",
  description: "Cutting-edge research in balloon-borne high-frequency VLBI instrumentation for imaging black holes and resolving photon rings. Explore VLBI system design, calibration, and analysis.",
  keywords: [
    "VLBI instrumentation research",
    "balloon-borne black hole imaging",
    "high-frequency VLBI systems",
    "black hole imaging techniques",
    "photon ring observation",
    "radio astronomy instrumentation",
    "VLBI calibration methods",
    "astronomical research collaboration"
  ],
  openGraph: {
    title: "Research - Mayukh Bagchi | Balloon-Borne VLBI Instrumentation",
    description: "Cutting-edge research in balloon-borne high-frequency VLBI instrumentation for imaging black holes and resolving photon rings.",
    type: "website",
  },
};

export default function ResearchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Research</h1>
      <p className="text-muted max-w-3xl">
        Balloon-borne HF VLBI instrumentation, system design, calibration, and analysis—laying the groundwork for imaging black holes and resolving photon rings.
      </p>
    </div>
  );
}


