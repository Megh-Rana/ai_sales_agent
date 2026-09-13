import { Variants } from 'framer-motion';

export const motionDurations = {
  micro: 0.18,
  interaction: 0.25,
  page: 0.3,
  data: 0.5,
  ai: 1.2,
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: motionDurations.interaction, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: motionDurations.micro, ease: 'easeIn' } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: motionDurations.interaction, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 8, transition: { duration: motionDurations.micro, ease: 'easeIn' } },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0, transition: { duration: motionDurations.interaction, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: motionDurations.micro, ease: 'easeIn' } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: motionDurations.interaction, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: motionDurations.micro } },
};

export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { duration: motionDurations.page, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: '100%', transition: { duration: motionDurations.interaction, ease: 'easeIn' } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const buttonMotion = {
  whileHover: { scale: 1.01, transition: { duration: motionDurations.micro } },
  whileTap: { scale: 0.98, transition: { duration: motionDurations.micro } },
};
