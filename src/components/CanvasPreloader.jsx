import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// SVG string for the GitHub logo, encoded for data URI
const GITHUB_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;

const CanvasPreloader = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let particles = [];
    let animationFrameId;

    const initParticles = () => {
      const img = new Image();
      img.src = GITHUB_SVG;
      
      img.onload = () => {
        // Create an offscreen canvas to draw the image and extract pixels
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        
        // Define logo size (about 300x300)
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.4;
        offCanvas.width = size;
        offCanvas.height = size;
        
        // Draw image in the center of offscreen canvas
        offCtx.drawImage(img, 0, 0, size, size);
        
        // Extract pixel data
        const imageData = offCtx.getImageData(0, 0, size, size).data;
        const targetCoordinates = [];
        
        // Step size determines particle density
        const step = 4;
        
        // Calculate the center offset to draw on the main canvas
        const offsetX = (canvas.width - size) / 2;
        const offsetY = (canvas.height - size) / 2;

        for (let y = 0; y < size; y += step) {
          for (let x = 0; x < size; x += step) {
            // Check alpha channel (index + 3)
            const alpha = imageData[(y * size + x) * 4 + 3];
            if (alpha > 128) { // If pixel is significantly opaque
              targetCoordinates.push({
                x: x + offsetX,
                y: y + offsetY
              });
            }
          }
        }

        // Create particles
        particles = targetCoordinates.map(target => {
          // Spawn from outside the screen
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.max(canvas.width, canvas.height) * 0.8;
          
          return {
            x: canvas.width / 2 + Math.cos(angle) * distance, // Start outside
            y: canvas.height / 2 + Math.sin(angle) * distance, // Start outside
            targetX: target.x,
            targetY: target.y,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.05 + 0.02, // Easing speed
            color: `rgba(255, 255, 255, ${0.4 + Math.random() * 0.6})` // Subtle white highlights
          };
        });

        // Trigger animation
        animate();

        // Sequence: Wait 3s (formation), glow/flash, then complete
        setTimeout(() => {
          // Trigger the fade out sequence in React state
          setIsFading(true);
          
          // Flash effect via GSAP on the container
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.2,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              if (onComplete) onComplete();
            }
          });
        }, 3500);
      };
    };

    const animate = () => {
      // Clear with slight trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add a slight floating wobble over time
      const time = Date.now() * 0.002;

      particles.forEach(p => {
        // Lerp towards target
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        // Draw particle
        ctx.beginPath();
        
        // When settled, add wobble. If still moving, just draw at x,y
        const dist = Math.hypot(p.targetX - p.x, p.targetY - p.y);
        let drawX = p.x;
        let drawY = p.y;
        
        if (dist < 2) {
           drawX += Math.sin(time + p.x) * 2;
           drawY += Math.cos(time + p.y) * 2;
        }

        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        // Add glow for particles close to target
        if (dist < 50) {
           ctx.shadowBlur = 10;
           ctx.shadowColor = p.color;
        } else {
           ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black pointer-events-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};


export default CanvasPreloader;
