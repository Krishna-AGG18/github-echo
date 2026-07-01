import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Preloader — curtain-wipe load screen
 * ------------------------------------
 * Five full-height bars tile the viewport and sweep away (top -> bottom,
 * left to right stagger) once the page has finished loading. A live
 * percentage counter sits centered as the focal element while it loads.
 *
 * Usage:
 *   <Preloader color="rgb(255,47,0)" minDuration={1200}>
 *     <YourApp />
 *   </Preloader>
 *
 * Props:
 *   color        - fill color of the bars (default: "#0b0b0d", a near-black)
 *   shimmer      - color of the moving sheen highlight (default: a soft
 *                  translucent white, works over any dark base color)
 *   minDuration  - minimum ms to show the preloader, even if load fires
 *                  instantly (default: 1200) — avoids a jarring flash
 *   onComplete   - optional callback fired after the exit animation ends
 *   children     - your app/page content, mounted underneath immediately
 *                  (so images etc. can start loading) and revealed by the wipe
 */

const BAR_POSITIONS = [10, 30, 50, 70, 90]; // % center positions, 20% wide each -> full tile

const containerVariants = {
  animate: {},
  exit: {
    transition: {
      staggerChildren: 0.09,
      staggerDirection: 1,
    },
  },
};

const barVariants = {
  animate: { scaleY: 1 },
  exit: {
    scaleY: 0,
    transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
  },
};

const counterVariants = {
  animate: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.35, ease: "easeInOut" },
  },
};

export default function Preloader({
  color = "#0b0b0d",
  shimmer = "rgba(255, 255, 255, 0.16)",
  minDuration = 1200,
  onComplete,
  children,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [percent, setPercent] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    let rafId;
    let pageLoaded = false;
    let minTimeElapsed = false;

    const maybeFinish = () => {
      if (pageLoaded && minTimeElapsed) {
        setPercent(100);
        setIsLoading(false);
      }
    };

    // Animate the counter toward ~90% while we wait, so it never feels stuck.
    const tick = () => {
      setPercent((p) => {
        if (p >= 90) return p;
        const elapsed = Date.now() - startRef.current;
        const target = Math.min(90, (elapsed / minDuration) * 90);
        return target > p ? target : p;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleLoad = () => {
      pageLoaded = true;
      maybeFinish();
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    const minTimer = setTimeout(() => {
      minTimeElapsed = true;
      maybeFinish();
    }, minDuration);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(minTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, [minDuration]);

  return (
    <>
      {/* Content mounts immediately underneath so assets can start loading */}
      <div aria-hidden={isLoading}>{children}</div>

      <style>{`
        @keyframes preloaderShimmer {
          0%   { background-position: 0% 0%; }
          100% { background-position: 220% 0%; }
        }
      `}</style>

      <AnimatePresence
        onExitComplete={() => onComplete && onComplete()}
      >
        {isLoading && (
          <motion.div
            key="preloader"
            variants={containerVariants}
            initial="animate"
            animate="animate"
            exit="exit"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {BAR_POSITIONS.map((pos, i) => (
              <motion.div
                key={i}
                variants={barVariants}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `calc(${pos}% - 10%)`,
                  width: "20%",
                  background: color,
                  transformOrigin: "top",
                  overflow: "hidden",
                }}
              >
                {/* moving sheen highlight, offset per bar for a diagonal shimmer */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `linear-gradient(115deg, transparent 30%, ${shimmer} 48%, ${shimmer} 52%, transparent 70%)`,
                    backgroundSize: "300% 100%",
                    animation: `preloaderShimmer 2.4s ${
                      i * 0.15
                    }s linear infinite`,
                  }}
                />
              </motion.div>
            ))}

            <motion.div
              variants={counterVariants}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily:
                  "'Helvetica Neue', Arial, sans-serif",
                fontSize: "clamp(2.5rem, 8vw, 6rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "#fff",
                zIndex: 1,
              }}
            >
              {Math.floor(percent)}%
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}