import React from 'react';
import { motion } from 'framer-motion';

export interface InteractiveHoverLinksProps {
  text: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export const InteractiveHoverLinks: React.FC<InteractiveHoverLinksProps> = ({
  text,
  href,
  onClick,
  className = '',
  active = false,
}) => {
  return (
    <a
      href={href || '#'}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative inline-block font-medium transition-colors group cursor-pointer ${
        active ? 'text-primary font-bold' : 'text-foreground-secondary hover:text-foreground'
      } ${className}`}
    >
      <span className="relative z-10">{text}</span>

      {/* Sliding Underline Bar */}
      <motion.span
        className={`absolute bottom-0 left-0 h-[2px] bg-primary rounded-full transition-all duration-300 ${
          active ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </a>
  );
};

export default InteractiveHoverLinks;
