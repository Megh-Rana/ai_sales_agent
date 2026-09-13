import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Bot, Building2, User } from 'lucide-react';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'user' | 'company' | 'ai';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  type = 'user',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getInitials = (str?: string) => {
    if (!str) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  if (type === 'ai') {
    return (
      <div
        className={twMerge(
          clsx(
            'relative flex items-center justify-center rounded-md bg-primary-muted text-primary-hover border border-primary/30 shrink-0 select-none font-mono font-semibold',
            sizeClasses[size],
            className
          )
        )}
        title="Vidur AI Sales Agent"
      >
        <span className="relative flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-hover" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary-hover rounded-full animate-ping opacity-75" />
        </span>
      </div>
    );
  }

  if (type === 'company') {
    return (
      <div
        className={twMerge(
          clsx(
            'flex items-center justify-center rounded-md bg-surface-elevated text-foreground-secondary border border-border-default shrink-0 select-none font-semibold',
            sizeClasses[size],
            className
          )
        )}
      >
        {src ? (
          <img src={src} alt={name || 'Company'} className="w-full h-full object-cover rounded-md" />
        ) : name ? (
          <span>{getInitials(name)}</span>
        ) : (
          <Building2 className="w-4 h-4 text-foreground-tertiary" />
        )}
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center justify-center rounded-full bg-surface-elevated text-foreground border border-border-default shrink-0 select-none font-medium',
          sizeClasses[size],
          className
        )
      )}
    >
      {src ? (
        <img src={src} alt={name || 'User'} className="w-full h-full object-cover rounded-full" />
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <User className="w-4 h-4 text-foreground-tertiary" />
      )}
    </div>
  );
};
