"use client";

import { useState, useEffect } from "react";
import { Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Printer } from "lucide-react";

type PdfViewerProps = {
  fileUrl: string;
  initialZoomPct?: number;
};

export default function OptimizedPdfViewer({ fileUrl, initialZoomPct = 100 }: PdfViewerProps) {
  const [zoomPct, setZoomPct] = useState(initialZoomPct);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const zoomIn = () => setZoomPct((z) => Math.min(200, z + 20));
  const zoomOut = () => setZoomPct((z) => Math.max(60, z - 20));
  const resetZoom = () => setZoomPct(initialZoomPct);

  const openInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };
  
  const download = () => {
    if (typeof window !== 'undefined') {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileUrl.split("/").pop() || "cv.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };
  
  const printPdf = () => {
    if (typeof window !== 'undefined') {
      const w = window.open(fileUrl, "_blank");
      if (!w) return;
      const onLoad = () => { try { w.focus(); w.print(); } catch { /* ignore */ } };
      w.addEventListener?.("load", onLoad, { once: true });
    }
  };

  const scale = zoomPct / 100;

  if (!isMounted) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-[hsl(var(--muted)/0.22)] bg-white shadow-2xl overflow-hidden">
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full mx-auto"></div>
            <p className="text-foreground/70">Loading CV...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 flex items-center gap-2 rounded-xl border border-[hsl(var(--muted)/0.3)] bg-[hsl(var(--background)/0.9)] backdrop-blur-xl px-3 py-2 w-fit">
        <button 
          onClick={download} 
          className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60 transition-colors"
        >
          <Download size={16} /> Download
        </button>
        <button 
          onClick={openInNewTab} 
          className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60 transition-colors"
        >
          <ExternalLink size={16} /> Open
        </button>
        <button 
          onClick={printPdf} 
          className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60 transition-colors"
        >
          <Printer size={16} /> Print
        </button>

        <div className="ml-4 flex items-center gap-1">
          <button 
            onClick={zoomOut} 
            aria-label="Zoom out" 
            className="rounded border border-muted/40 p-1 hover:border-accent/60 transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <span className="px-2 text-sm tabular-nums min-w-[50px] text-center">{zoomPct}%</span>
          <button 
            onClick={zoomIn} 
            aria-label="Zoom in" 
            className="rounded border border-muted/40 p-1 hover:border-accent/60 transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={resetZoom} 
            aria-label="Reset zoom" 
            className="ml-1 rounded border border-muted/40 p-1 hover:border-accent/60 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* PDF Viewer Container - More compact display */}
      <div className="mx-auto w-full max-w-4xl">
        <div 
          className="mx-auto bg-white rounded-xl shadow-lg border border-[hsl(var(--muted)/0.2)] overflow-hidden"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center',
            width: `${100 / scale}%`,
            maxWidth: '950px'
          }}
        >
          {/* Multiple fallback approaches for maximum compatibility */}
          <object 
            data={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&page=1&view=FitH,top`}
            type="application/pdf"
            className="w-full"
            style={{ height: "calc(100vh - 220px)", minHeight: "700px" }}
          >
            {/* Fallback iframe */}
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&page=1&view=FitH,top`}
              className="w-full border-0"
              title="CV PDF"
              style={{ height: "calc(100vh - 220px)", minHeight: "700px" }}
              sandbox="allow-same-origin allow-scripts allow-popups"
            >
              {/* Final fallback */}
              <div className="p-8 text-center bg-gray-50">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">PDF Viewer</h3>
                <p className="text-gray-700 mb-6 max-w-md mx-auto">
                  Your browser doesn't support inline PDF viewing. Click the button below to open the PDF in a new tab.
                </p>
                <div className="flex gap-3 justify-center">
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={18} />
                    Open PDF
                  </a>
                  <a 
                    href={fileUrl}
                    download="mayukh_bagchi_cv.pdf"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 hover:border-gray-400 transition-colors"
                  >
                    <Download size={18} />
                    Download
                  </a>
                </div>
              </div>
            </iframe>
          </object>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="flex gap-2 md:hidden">
        <button
          onClick={openInNewTab}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-muted/40 px-3 py-2 hover:border-accent/60 transition-colors"
        >
          <ExternalLink size={16} /> Open PDF
        </button>
        <button 
          onClick={download} 
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-muted/40 px-3 py-2 hover:border-accent/60 transition-colors"
        >
          <Download size={16} /> Download
        </button>
      </div>
    </div>
  );
}
