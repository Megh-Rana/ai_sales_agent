import React, { useState } from 'react';
import { FileText, Copy, Check, Sparkles } from 'lucide-react';

interface ConversationSummaryCardProps {
  summary: string;
}

export const ConversationSummaryCard: React.FC<ConversationSummaryCardProps> = ({
  summary,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Executive Conversation Summary
          </h3>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-[#1A202C] border border-[#2D3748] rounded-md hover:border-slate-500 transition-colors"
          title="Copy summary to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Content */}
      <div className="bg-[#151A25] border border-[#232B3B] rounded-lg p-4">
        <p className="text-sm text-slate-200 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
        <Check className="w-3 h-3 text-emerald-400" />
        <span>Structured for Account Executive handoff (Problem · Situation · Interest · Friction · Next Step)</span>
      </div>
    </div>
  );
};
