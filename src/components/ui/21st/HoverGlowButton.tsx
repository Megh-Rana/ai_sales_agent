import { motion, HTMLMotionProps } from 'framer-motion';

export interface HoverGlowButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

export const HoverGlowButton: React.FC<HoverGlowButtonProps> = ({
  children,
  glowColor = 'rgba(245, 158, 11, 0.4)',
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 group overflow-hidden cursor-pointer ${className}`}
      {...props}
    >
      {/* Ambient Outer Glow */}
      <div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />

      {/* Shimmering Border Animation */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};

export default HoverGlowButton;
