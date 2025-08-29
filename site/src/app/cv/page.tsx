"use client";

import dynamic from 'next/dynamic';
import { VLBIBackgroundSkeleton } from '@/components/loading-skeleton';

// Lazy load heavy components
const VLBIBackground = dynamic(() => import('@/components/vlbi-background'), {
  loading: () => <VLBIBackgroundSkeleton />,
});

// Lazy load the optimized PDF viewer to avoid hydration issues
const OptimizedPdfViewer = dynamic(() => import('@/components/pdf-viewer-optimized'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto w-full max-w-6xl rounded-2xl border border-[hsl(var(--muted)/0.22)] bg-white shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full mx-auto"></div>
        <p className="text-foreground/70">Loading CV...</p>
      </div>
    </div>
  ),
});

export default function CVPage() {
  const fileUrl = "/cv/mayukh_bagchi_cv.pdf";

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <VLBIBackground hideBlackHole />
      <section className="relative z-10 space-y-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Curriculum Vitae</h1>
          <p className="mt-3 text-foreground/80 max-w-2xl">My CV — tuned to the right frequency.</p>
        </div>

        {/* Optimized PDF Viewer with better display and zoom controls */}
        <OptimizedPdfViewer fileUrl={fileUrl} initialZoomPct={80} />
      </section>
    </div>
  );
}