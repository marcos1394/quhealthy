import { Variants } from "framer-motion";

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

// Fade in and slide up
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Fade in and slide down
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

// Stagger children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Pulse animation
export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

// Slow zoom in animation
export const zoomIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

// Animation for cards appearing sequentially
export const cardAnimation = (delay: number = 0): Variants => ({
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      delay
    }
  }
});

// Button click animation
export const buttonTap: Variants = {
  tap: { scale: 0.97 }
};

// Hover animation
export const hoverScale: Variants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } }
};

// Text reveal animation
export const textReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6
    }
  })
};

// Animation for gradient background shift
export const gradientShift: Variants = {
  hidden: { backgroundPosition: "0% 50%" },
  visible: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "linear"
    }
  }
};