import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Building, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'lead' | 'company' | 'call';
  score?: number;
}

export interface AnimatedSearchInteractionProps {
  placeholder?: string;
  className?: string;
}

export const AnimatedSearchInteraction: React.FC<AnimatedSearchInteractionProps> = ({
  placeholder = 'Search leads, companies, intent signals...',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const mockResults: SearchResultItem[] = [
    { id: '1', title: 'Acme Corp', subtitle: 'Enterprise Software • High Intent (94%)', type: 'company', score: 94 },
    { id: '2', title: 'Sarah Jenkins', subtitle: 'VP Engineering @ Acme • Active Decision Maker', type: 'lead', score: 89 },
    { id: '3', title: 'CloudScale Inc', subtitle: 'DevOps & Infra • AI Call Completed', type: 'company', score: 82 },
  ];

  const filtered = query.trim()
    ? mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : mockResults;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{
          width: isExpanded ? '320px' : '220px',
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center bg-surface-1/80 border border-border-default hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-3 py-1.5 transition-all"
      >
        <Search className="w-4 h-4 text-foreground-tertiary shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-foreground placeholder-foreground-tertiary outline-none ml-2 font-medium"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-0.5 hover:bg-surface-elevated rounded text-foreground-tertiary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>

      {/* Floating Results Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full mt-2 bg-surface-0 border border-border-default rounded-xl shadow-xl z-50 p-2 overflow-hidden"
          >
            <div className="text-[10px] font-mono font-semibold uppercase text-foreground-tertiary px-2 py-1 flex items-center justify-between border-b border-border-subtle mb-1">
              <span>Search Results</span>
              <span>{filtered.length} found</span>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={() => {
                    navigate('/leads');
                    setIsExpanded(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded bg-surface-1 group-hover:bg-primary/20 shrink-0">
                      {item.type === 'company' ? (
                        <Building className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-foreground-tertiary block truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  {item.score && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 ml-2">
                      {item.score}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedSearchInteraction;
