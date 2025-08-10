"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type CarouselItem = {
  src: string;
  alt: string;
};

type CarouselOrbitProps = {
  items: CarouselItem[];
  radius?: number; // px depth
  autoDegPerSec?: number; // degrees/sec
  cardSize?: { w: number; h: number };
};

export default function CarouselOrbit({
  items,
  radius = 360,
  autoDegPerSec = 6,
  cardSize = { w: 280, h: 200 },
}: CarouselOrbitProps) {
  const [rotationDeg, setRotationDeg] = useState(0);
  const rafRef = useRef<number>(0);
  const hoverRef = useRef(false);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    const step = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dtMs = Math.min(64, now - lastRef.current);
      lastRef.current = now;
      if (!hoverRef.current) {
        setRotationDeg((r) => (r + (autoDegPerSec * dtMs) / 1000) % 360);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoDegPerSec]);

  const onMouseEnter = () => { hoverRef.current = true; };
  const onMouseLeave = () => { hoverRef.current = false; };

  const angleStep = 360 / Math.max(1, items.length);

  return (
    <div
      className="relative w-full h-[280px] md:h-[360px]"
      style={{ perspective: "1100px" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="absolute inset-0 mx-auto"
        style={{ transformStyle: "preserve-3d", transform: `translateZ(-${radius}px) rotateY(${rotationDeg}deg)` }}
      >
        {items.map((it, i) => {
          const angle = i * angleStep;
          return (
            <div
              key={it.src}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden border border-[hsl(var(--muted)/0.35)] shadow-2xl bg-[hsl(var(--background)/0.2)]/80 backdrop-blur-xl"
              style={{
                width: cardSize.w,
                height: cardSize.h,
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
              }}
            >
              <Image
                src={it.src}
                alt={it.alt}
                width={cardSize.w}
                height={cardSize.h}
                className="w-full h-full object-cover select-none"
                priority={i < 2}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}


