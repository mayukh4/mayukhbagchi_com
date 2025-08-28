import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { VLBIBackgroundSkeleton } from '@/components/loading-skeleton';

// Lazy load heavy components
const VLBIBackground = dynamic(() => import('@/components/vlbi-background'), {
  loading: () => <VLBIBackgroundSkeleton />,
});

const PdfViewer = dynamic(() => import('@/components/pdf-viewer'), {
  loading: () => (
    <div className="w-full mx-auto max-w-5xl rounded-2xl border border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.08)]/80 backdrop-blur-xl p-2 md:p-3 shadow-2xl">
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-foreground/60">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full mx-auto mb-4"></div>
          <p>Loading CV...</p>
        </div>
      </div>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "CV",
  description: "Download Mayukh Bagchi's CV - PhD candidate in astronomy specializing in VLBI instrumentation, black hole imaging, and balloon-borne radio astronomy research.",
  keywords: [
    "Mayukh Bagchi CV",
    "astronomy researcher CV",
    "VLBI instrumentation resume",
    "PhD astronomy CV",
    "radio astronomy researcher profile",
    "black hole imaging expert CV",
    "academic CV astronomy",
    "researcher resume download"
  ],
  openGraph: {
    title: "CV - Mayukh Bagchi | PhD Astronomy Researcher",
    description: "Download Mayukh Bagchi's CV - PhD candidate in astronomy specializing in VLBI instrumentation and black hole imaging research.",
    type: "website",
    url: "https://mayukhbagchi.com/cv",
    images: [
      {
        url: "https://mayukhbagchi.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mayukh Bagchi CV",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CV - Mayukh Bagchi | PhD Astronomy Researcher",
    description: "Download academic CV - PhD candidate specializing in VLBI instrumentation and black hole imaging.",
    images: ["https://mayukhbagchi.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://mayukhbagchi.com/cv",
  },
};

export default function CVPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <VLBIBackground hideBlackHole />
      <section className="relative z-10 space-y-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Curriculum Vitae</h1>
          <p className="mt-3 text-foreground/80 max-w-2xl">My CV — tuned to the right frequency.</p>
        </div>

        {/* PDF Viewer */}
        <div className="mt-2">
          <PdfViewer fileUrl="/cv/mayukh_bagchi_cv.pdf" />
        </div>
      </section>
    </div>
  );
}


