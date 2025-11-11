"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function ConfettiEffect({ isActive, onComplete }: ConfettiEffectProps) {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      setIsRunning(true);
      const timer = setTimeout(() => {
        setIsRunning(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isRunning) return null;

  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
    />
  );
}
