"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export function OptimizedPortrait() {
  const [isHover, setIsHover] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="grid place-items-center" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
      <div className="relative">
        <Image
          src="/homepage.webp"
          width={420}
          height={560}
          alt="Mayukh Bagchi at radio telescope"
          className="rounded-2xl shadow-2xl select-none border border-transparent transition-transform duration-300 will-change-transform hover:scale-[1.01]"
          priority
        />
        {/* FFT overlay - only render after mount to prevent hydration mismatch */}
        {isMounted && (
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl transition-opacity duration-500 ${isHover ? "opacity-95" : "opacity-0"}`}
            style={{
              backgroundImage: `url('/homepage_fftt.webp')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
      </div>
    </div>
  );
}
