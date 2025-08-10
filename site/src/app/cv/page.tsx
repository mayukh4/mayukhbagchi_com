import type { Metadata } from 'next';
import VLBIBackground from '@/components/vlbi-background';
import PdfViewer from '@/components/pdf-viewer';

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


