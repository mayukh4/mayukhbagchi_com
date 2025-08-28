"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TelescopeImage {
  src: string;
  alt: string;
  caption: string;
  location: string;
}

const telescopeImages: TelescopeImage[] = [
  {
    src: "/about_me/vla_mayukh_bagchi.webp",
    alt: "Mayukh Bagchi at Very Large Array",
    caption: "Very Large Array",
    location: "New Mexico, USA"
  },
  {
    src: "/about_me/Haystack_observatory_mayukh_bagchi.webp", 
    alt: "Mayukh Bagchi at Haystack Observatory",
    caption: "Haystack Observatory",
    location: "Massachusetts, USA"
  },
  {
    src: "/about_me/chinme_radio_telescope_mayukh_bagchi.webp",
    alt: "Mayukh Bagchi at CHIME Radio Telescope", 
    caption: "CHIME Radio Telescope",
    location: "British Columbia, Canada"
  },
  {
    src: "/about_me/srt_64_radio_telescope_Mayukh-Bagchi.webp",
    alt: "Mayukh Bagchi at Sardinia Radio Telescope",
    caption: "Sardinia Radio Telescope", 
    location: "Sardinia, Italy"
  }
];

export default function TelescopeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 4 seconds unless hovered or paused
  useEffect(() => {
    if (isHovered || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % telescopeImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        setIsPaused(!isPaused);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPaused]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % telescopeImages.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + telescopeImages.length) % telescopeImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className="relative w-full h-[40vh] md:h-[64vh] rounded-2xl overflow-hidden border border-[hsl(var(--muted)/0.35)] shadow-2xl bg-[hsl(var(--background)/0.2)]/80 backdrop-blur-sm group focus-within:ring-2 focus-within:ring-accent/50"
      style={{
        willChange: isHovered ? 'transform' : 'auto',
        contain: 'layout style paint',
        isolation: 'isolate'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Radio telescope image carousel"
      tabIndex={0}
    >
      {/* Main image display */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth feel
            }}
            className="absolute inset-0"
          >
            <Image
              src={telescopeImages[currentIndex].src}
              alt={telescopeImages[currentIndex].alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover select-none"
              priority={currentIndex === 0}
            />
            
            {/* Screen reader announcement */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              Image {currentIndex + 1} of {telescopeImages.length}: {telescopeImages[currentIndex].alt}
            </div>
            
            {/* Subtle gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={goToPrevious}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft size={20} />
      </motion.button>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label="Next image"
      >
        <ChevronRight size={20} />
      </motion.button>

      {/* Image caption */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-4 md:p-6"
      >
        <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-white/10 p-3 md:p-4">
          <h3 className="text-white font-medium text-sm md:text-base">
            {telescopeImages[currentIndex].caption}
          </h3>
          <p className="text-white/80 text-xs md:text-sm mt-1">
            {telescopeImages[currentIndex].location}
          </p>
        </div>
      </motion.div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {telescopeImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group/dot relative"
            aria-label={`Go to image ${index + 1}`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {telescopeImages[index].caption}
            </div>
          </button>
        ))}
      </div>

      {/* Pause/play toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
      >
        {isPaused ? (
          <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        ) : (
          <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        )}
      </motion.button>

      {/* Progress indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
        <motion.div
          className="h-full bg-accent origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isPaused ? 0 : 1 }}
          transition={{
            duration: isPaused ? 0 : 4,
            ease: "linear",
            repeat: isPaused ? 0 : Infinity,
          }}
          key={`${currentIndex}-${isPaused}`}
        />
      </div>
    </div>
  );
}
