import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
  shortcutHint?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, shortcutHint = '⌘K', placeholder = 'Search opportunities, signals, or accounts...', ...props }, ref) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-foreground-tertiary hover:text-foreground p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : shortcutHint ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-foreground-tertiary border border-border-subtle">
              {shortcutHint}
            </span>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
