"use client";

import { useEffect, useRef } from 'react';

export default function DitherBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Bayer matrix 8x8 pour le dithering
    const bayerMatrix = [
      [0, 32, 8, 40, 2, 34, 10, 42],
      [48, 16, 56, 24, 50, 18, 58, 26],
      [12, 44, 4, 36, 14, 46, 6, 38],
      [60, 28, 52, 20, 62, 30, 54, 22],
      [3, 35, 11, 43, 1, 33, 9, 41],
      [51, 19, 59, 27, 49, 17, 57, 25],
      [15, 47, 7, 39, 13, 45, 5, 37],
      [63, 31, 55, 23, 61, 29, 53, 21]
    ];

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      time += 0.002;

      // Générer le pattern de vagues
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          // Coordonnées normalisées
          const nx = (x / width - 0.5) * 2;
          const ny = (y / height - 0.5) * 2;

          // Pattern de vagues avec fbm simplifié
          const dist = Math.sqrt(nx * nx + ny * ny);
          const angle = Math.atan2(ny, nx);
          
          const wave1 = Math.sin(dist * 5 - time * 2 + angle * 2) * 0.5 + 0.5;
          const wave2 = Math.sin(dist * 3 + time * 1.5 - angle) * 0.5 + 0.5;
          const wave3 = Math.sin(nx * 4 + ny * 4 + time) * 0.5 + 0.5;
          
          let value = (wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.3);
          
          // Couleur émeraude/turquoise
          const baseR = 20;
          const baseG = 100;
          const baseB = 80;

          // Appliquer le dithering Bayer
          const bayerX = x % 8;
          const bayerY = y % 8;
          const threshold = bayerMatrix[bayerY][bayerX] / 64.0;
          
          // Réduire le nombre de couleurs (posterization)
          const colorLevels = 4;
          value = Math.floor(value * colorLevels) / colorLevels;
          
          // Ajouter le dithering
          value = value > threshold ? value + 0.25 : value - 0.25;
          value = Math.max(0, Math.min(1, value));

          const r = baseR + value * 40;
          const g = baseG + value * 80;
          const b = baseB + value * 60;

          // Remplir un bloc 2x2 pour l'effet pixelisé
          for (let py = 0; py < 2 && y + py < height; py++) {
            for (let px = 0; px < 2 && x + px < width; px++) {
              const idx = ((y + py) * width + (x + px)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
