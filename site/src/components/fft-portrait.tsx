"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FFT from "fft.js";

function computeFFTMag(imgData: ImageData): ImageData {
  const { width, height, data } = imgData;
  const N = 1 << Math.ceil(Math.log2(Math.max(width, height)));
  const size = N * N;
  const gray = new Float32Array(size);
  // copy grayscale into centered square
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const ix = Math.min(x, width - 1);
      const iy = Math.min(y, height - 1);
      const i = (iy * width + ix) * 4;
      gray[y * N + x] = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
    }
  }
  const fft = new FFT(N);
  const outRe = new Float32Array(size);
  const outIm = new Float32Array(size);
  // perform row-wise then col-wise FFT using complex interleaved arrays
  const input = new Float32Array(2 * N);
  const output = new Float32Array(2 * N);
  // rows
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      input[2 * x] = gray[y * N + x];
      input[2 * x + 1] = 0;
    }
    fft.transform(output, input);
    for (let x = 0; x < N; x++) {
      outRe[y * N + x] = output[2 * x];
      outIm[y * N + x] = output[2 * x + 1];
    }
  }
  // cols
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      input[2 * y] = outRe[y * N + x];
      input[2 * y + 1] = outIm[y * N + x];
    }
    fft.transform(output, input);
    for (let y = 0; y < N; y++) {
      outRe[y * N + x] = output[2 * y];
      outIm[y * N + x] = output[2 * y + 1];
    }
  }
  // magnitude + log scale + shift quadrants
  const out = new ImageData(N, N);
  let maxMag = 0;
  for (let i = 0; i < size; i++) {
    const mag = Math.hypot(outRe[i], outIm[i]);
    if (mag > maxMag) maxMag = mag;
  }
  const logBase = Math.log(1 + maxMag);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const u = (x + N / 2) % N;
      const v = (y + N / 2) % N;
      const mag = Math.hypot(outRe[i], outIm[i]);
      const val = logBase > 0 ? Math.log(1 + mag) / logBase : 0;
      const j = (v * N + u) * 4;
      // cyan-ish palette for VLBI
      out.data[j] = val * 56; // r
      out.data[j + 1] = val * 189; // g
      out.data[j + 2] = val * 248; // b
      out.data[j + 3] = 255;
    }
  }
  return out;
}

export function FFTPortrait() {
  const [isHover, setIsHover] = useState(false);
  const [computed, setComputed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Cache the FFT as an offscreen canvas for high-quality scaling
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isHover || computed) return;
    const overlay = canvasRef.current;
    if (!overlay) return;

    const ctxOverlay = overlay.getContext("2d");
    if (!ctxOverlay) return;

    const img = new window.Image();
    img.onload = () => {
      const w = Math.min(512, img.naturalWidth);
      const h = Math.min(512, img.naturalHeight);

      // Prepare work canvas
      const work = document.createElement("canvas");
      work.width = w;
      work.height = h;
      const wctx = work.getContext("2d", { willReadFrequently: true });
      if (!wctx) return;
      wctx.drawImage(img, 0, 0, w, h);
      const imgData = wctx.getImageData(0, 0, w, h);

      // Compute square FFT image
      const fftImg = computeFFTMag(imgData);
      const fftCanvas = document.createElement("canvas");
      fftCanvas.width = fftImg.width;
      fftCanvas.height = fftImg.height;
      const fctx = fftCanvas.getContext("2d")!;
      fctx.putImageData(fftImg, 0, 0);
      offscreenRef.current = fftCanvas;
      setComputed(true);

      // Initial render to fit overlay
      const drawToFit = () => {
        const frame = frameRef.current;
        if (!frame || !offscreenRef.current) return;
        const targetW = frame.clientWidth;
        const targetH = frame.clientHeight;
        overlay.width = targetW;
        overlay.height = targetH;

        const src = offscreenRef.current;
        const sW = src.width;
        const sH = src.height;
        const scale = Math.max(targetW / sW, targetH / sH);
        const cropW = Math.min(sW, targetW / scale);
        const cropH = Math.min(sH, targetH / scale);
        const sx = (sW - cropW) / 2;
        const sy = (sH - cropH) / 2;
        ctxOverlay.clearRect(0, 0, targetW, targetH);
        ctxOverlay.drawImage(src, sx, sy, cropW, cropH, 0, 0, targetW, targetH);
      };

      drawToFit();

      // Redraw on resize so it always covers the portrait area
      const ro = new ResizeObserver(drawToFit);
      if (frameRef.current) ro.observe(frameRef.current);
      return () => ro.disconnect();
    };
    img.src = "/homepage.webp";
  }, [isHover, computed]);

  return (
    <div className="grid place-items-center" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
      <div ref={frameRef} className="relative">
        <Image
          src="/homepage.webp"
          width={420}
          height={560}
          alt="Mayukh Bagchi at radio telescope"
          className="rounded-2xl shadow-2xl select-none border border-transparent transition-transform duration-300 will-change-transform hover:scale-[1.01]"
          priority
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full rounded-2xl transition-opacity duration-300 ${isHover && computed ? "opacity-80" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}


