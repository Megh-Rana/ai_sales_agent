import React, { useEffect, useState } from 'react';

export interface SpotlightCursorProps {
  className?: string;
  size?: number;
  color?: string;
}

export const SpotlightCursor: React.FC<SpotlightCursorProps> = ({
  className = '',
  size = 500,
  color = 'rgba(59, 130, 246, 0.07)',
}) => {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check mobile / touch screen
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsMobile(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (isMobile || !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-10 transition-opacity duration-300 ${className}`}
      style={{
        background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%)`,
      }}
    />
  );
};

export default SpotlightCursor;
