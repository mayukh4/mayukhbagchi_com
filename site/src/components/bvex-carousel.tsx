"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface BVEXImage {
  src: string;
  alt: string;
  caption: string;
}

const bvexImages: BVEXImage[] = [
  {
    src: "/research/BVEX/BVEX.webp",
    alt: "BVEX project overview with M87 black hole and balloon telescope concept",
    caption: "BVEX Project Overview"
  },
  {
    src: "/research/BVEX/bvex_csa_carmencita_gondola.webp", 
    alt: "BVEX 0.9-meter telescope mounted on Canadian Space Agency CARMENCITA balloon gondola",
    caption: "BVEX on CSA CARMENCITA Gondola"
  },
  {
    src: "/research/BVEX/bvex_csa_pointing_test.webp",
    alt: "BVEX telescope pointing test at Canadian Space Agency facility",
    caption: "BVEX Pointing Test"
  }
];

export default function BVEXCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-advance every 5 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bvexImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className="relative rounded-2xl overflow-hidden border border-[hsl(var(--muted)/0.18)] group cursor-pointer"
      style={{
        willChange: isHovered ? 'transform' : 'auto',
        contain: 'layout style paint',
        isolation: 'isolate'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main image display */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="relative w-full h-full"
          >
            <Image
              src={bvexImages[currentIndex].src}
              width={1400}
              height={900}
              alt={bvexImages[currentIndex].alt}
              className="w-full h-full object-cover"
              priority={currentIndex === 0}
            />
            
            {/* Subtle overlay for caption readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Image caption - only show on hover */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-4"
      >
        <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2">
          <p className="text-white text-sm font-medium">
            {bvexImages[currentIndex].caption}
          </p>
        </div>
      </motion.div>

      {/* Dot indicators - positioned at bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {bvexImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="group/dot relative"
            aria-label={`View ${bvexImages[index].caption}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/60 hover:bg-white/90'
              }`}
            />
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {bvexImages[index].caption}
            </div>
          </button>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/10">
        <motion.div
          className="h-full bg-accent origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 0 : 1 }}
          transition={{
            duration: isHovered ? 0 : 5,
            ease: "linear",
            repeat: isHovered ? 0 : Infinity,
          }}
          key={`${currentIndex}-${isHovered}`}
        />
      </div>

      {/* Subtle hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-accent/5 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
