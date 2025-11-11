"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Loader({ 
  message = "Loading...", 
  fullScreen = false,
  size = "md" 
}: LoaderProps) {
  const sizes = {
    sm: { icon: 24, container: 80 },
    md: { icon: 40, container: 120 },
    lg: { icon: 56, container: 160 },
  };

  const { icon, container } = sizes[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated Brain Icon */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: container, height: container }}
      >
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/20"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-primary/40"
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            },
          }}
        />

        {/* Inner Glow */}
        <motion.div
          className="absolute inset-4 rounded-full bg-primary/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Brain Icon */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Brain 
            className="text-primary relative z-10" 
            style={{ width: icon, height: icon }}
          />
        </motion.div>
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-lg font-medium text-foreground mb-2">{message}</p>
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

// Simple spinner loader
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`border-2 border-primary border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Dots loader
export function DotsLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
