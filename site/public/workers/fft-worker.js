// Web Worker for FFT computation
// This offloads the heavy FFT computation from the main thread

// Import FFT library (needs to be available in worker context)
importScripts('https://unpkg.com/fft.js@4.0.4/lib/fft.js');

function computeFFTMag(imgData) {
  const { width, height, data } = imgData;
  const N = 1 << Math.ceil(Math.log2(Math.max(width, height)));
  const size = N * N;
  const gray = new Float32Array(size);
  
  // Copy grayscale into centered square
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
  
  // Perform row-wise then col-wise FFT using complex interleaved arrays
  const input = new Float32Array(2 * N);
  const output = new Float32Array(2 * N);
  
  // Rows
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
  
  // Cols
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
  
  // Magnitude + log scale + shift quadrants
  const result = new ImageData(N, N);
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
      
      // Cyan-ish palette for VLBI
      result.data[j] = val * 56; // r
      result.data[j + 1] = val * 189; // g
      result.data[j + 2] = val * 248; // b
      result.data[j + 3] = 255;
    }
  }
  
  return result;
}

// Listen for messages from main thread
self.onmessage = function(e) {
  const { type, imgData, id } = e.data;
  
  if (type === 'COMPUTE_FFT') {
    try {
      const result = computeFFTMag(imgData);
      
      // Send result back to main thread
      self.postMessage({
        type: 'FFT_RESULT',
        result: result,
        id: id
      });
    } catch (error) {
      self.postMessage({
        type: 'FFT_ERROR',
        error: error.message,
        id: id
      });
    }
  }
};
