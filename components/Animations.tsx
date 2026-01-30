import React from 'react';
import { motion } from 'framer-motion';

// Optimized FadeIn: Uses standard easing instead of spring for better scroll performance
export const FadeIn = ({ children, delay = 0, className = "", direction = "up" }: { children: React.ReactNode, delay?: number, className?: string, direction?: "up" | "down" | "left" | "right" | "none" }) => {
  let initial = { opacity: 0, y: 0, x: 0 };
  if (direction === "up") initial.y = 20; // Reduced distance
  if (direction === "down") initial.y = -20;
  if (direction === "left") initial.x = 20;
  if (direction === "right") initial.x = -20;

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-10%" }} // Trigger slightly earlier, do not re-animate
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, className = "", staggerDelay = 0.05, delay = 0 }: { children: React.ReactNode, className?: string, staggerDelay?: number, delay?: number }) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "0px" }}
    variants={{
      hidden: {},
      show: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = "" }: { children: React.ReactNode, className?: string, key?: React.Key }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } // Removed spring
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);