import { Variants } from 'motion/react';

// Eco-friendly natural easing curve matching organic theme
export const customEase = [0.22, 1, 0.36, 1] as const;

// Standard section reveal configuration
export const sectionRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: customEase,
    },
  },
};

// Standard viewport config for scroll-triggered reveals
export const defaultViewport = {
  once: true,
  amount: 0.2,
};

// Container variants with 0.1s staggered children
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Individual card or list item reveal with subtle scale (0.95)
export const cardRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: customEase,
    },
  },
};

// Simple fade & slide item
export const itemRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: customEase,
    },
  },
};
