import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
}

export interface AnimatedCardChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  type?: 'bar' | 'area' | 'line';
  color?: string;
  height?: number;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const AnimatedCardChart: React.FC<AnimatedCardChartProps> = ({
  title,
  subtitle,
  data,
  type = 'bar',
  color = '#3B82F6',
  height = 180,
  className = '',
  valuePrefix = '',
  valueSuffix = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={`p-4 rounded-xl border border-border-default bg-surface-0 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-small font-bold text-foreground">{title}</h4>
          {subtitle && <p className="text-caption text-foreground-tertiary">{subtitle}</p>}
        </div>
        {hoveredIndex !== null && (
          <div className="text-right animate-fade-in">
            <span className="text-caption text-foreground-secondary block">
              {data[hoveredIndex].label}
            </span>
            <span className="text-small font-mono font-bold text-primary">
              {valuePrefix}
              {data[hoveredIndex].value.toLocaleString()}
              {valueSuffix}
            </span>
          </div>
        )}
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {type === 'bar' && (
          <div className="flex items-end justify-between gap-1.5 h-full pt-4">
            {data.map((item, idx) => {
              const heightPercent = (item.value / maxValue) * 100;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="w-full relative flex items-end justify-center h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05, ease: 'easeOut' }}
                      className={`w-full max-w-[28px] rounded-t-md transition-colors ${
                        item.highlight
                          ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-xs shadow-amber-500/20'
                          : isHovered
                          ? 'bg-primary'
                          : 'bg-primary/40 group-hover:bg-primary/70'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-mono mt-2 transition-colors ${
                      isHovered ? 'text-foreground font-semibold' : 'text-foreground-tertiary'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {(type === 'line' || type === 'area') && (
          <div className="w-full h-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

              {/* Area Path */}
              {type === 'area' && (
                <motion.path
                  initial={{ opacity: 0, d: `M 0 100 L 0 100 ${data.map((_, i) => `L ${(i / (data.length - 1)) * 100} 100`).join(' ')} Z` }}
                  animate={{
                    opacity: 0.25,
                    d: `M 0 100 ${data
                      .map(
                        (d, i) =>
                          `L ${(i / (data.length - 1)) * 100} ${100 - (d.value / maxValue) * 85}`
                      )
                      .join(' ')} L 100 100 Z`,
                  }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  fill={color}
                />
              )}

              {/* Line Path */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                d={`M 0 ${100 - (data[0].value / maxValue) * 85} ${data
                  .slice(1)
                  .map(
                    (d, i) =>
                      `L ${((i + 1) / (data.length - 1)) * 100} ${100 - (d.value / maxValue) * 85}`
                  )
                  .join(' ')}`}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Interactive Data Points */}
            <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
              {data.map((d, i) => {
                const leftPercent = (i / (data.length - 1)) * 100;
                const bottomPercent = (d.value / maxValue) * 85;
                const isHovered = hoveredIndex === i;

                return (
                  <div
                    key={i}
                    style={{
                      left: `${leftPercent}%`,
                      bottom: `${bottomPercent}%`,
                    }}
                    className="absolute -translate-x-1/2 translate-y-1/2 pointer-events-auto cursor-pointer group"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className={`w-3 h-3 rounded-full border-2 border-surface-0 transition-transform ${
                        isHovered ? 'scale-150 bg-white' : 'bg-primary'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedCardChart;
