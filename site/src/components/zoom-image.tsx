"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type ZoomImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export function ZoomImage({ src, alt, width, height, className }: ZoomImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={cn("block w-full h-full cursor-zoom-in", className)}
        onClick={() => setIsOpen(true)}
        aria-label="Open image"
      >
        <Image src={src} alt={alt} width={width} height={height} className="w-full h-full object-contain" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 cursor-zoom-out"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="relative w-[70vw] h-[70vh] max-w-[1200px]" onClick={(e) => e.stopPropagation()}>
            <Image src={src} alt={alt} fill sizes="70vw" className="object-contain rounded-xl shadow-2xl" priority />
          </div>
        </div>
      )}
    </>
  );
}


