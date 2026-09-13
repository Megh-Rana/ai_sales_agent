import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export interface AnimatedNumberTransitionProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedNumberTransition: React.FC<AnimatedNumberTransitionProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    current.toFixed(decimals)
  );

  const [currentText, setCurrentText] = useState(value.toFixed(decimals));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setCurrentText(latest);
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <motion.span
      key={value}
      initial={{ y: -4, opacity: 0.8 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-baseline font-mono font-bold ${className}`}
    >
      {prefix}
      <span>{currentText}</span>
      {suffix}
    </motion.span>
  );
};

export default AnimatedNumberTransition;
