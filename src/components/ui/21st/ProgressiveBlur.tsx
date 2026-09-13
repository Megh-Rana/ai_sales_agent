import React from 'react';

export interface ProgressiveBlurProps {
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'full';
  className?: string;
}

export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({
  children,
  position = 'full',
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Progressive Blur Layer Steps */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 backdrop-blur-[2px] opacity-30" />
        <div className="absolute inset-0 backdrop-blur-[4px] opacity-40 mask-gradient" />
        <div className="absolute inset-0 backdrop-blur-[8px] opacity-30" />
      </div>

      <div className="relative z-20">{children}</div>
    </div>
  );
};

export default ProgressiveBlur;
