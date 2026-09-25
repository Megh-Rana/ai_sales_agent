import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  Clock,
  User,
  Target,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Globe,
  HelpCircle
} from 'lucide-react';
import { parseSummaryData } from '../../../utils/summaryUtils';

interface ConversationSummaryCardProps {
  summary: any;
}

export const ConversationSummaryCard: React.FC<ConversationSummaryCardProps> = ({
  summary,
}) => {
  const [copied, setCopied] = useState(false);

  // Normalize summary into clean Account Executive structure
  const parsedData = useMemo(() => parseSummaryData(summary), [summary]);

  // Format plain-text for copy to clipboard according to executive requirements
  const formattedPlainTextCopy = useMemo(() => {
    const {
      durationFormatted,
      totalTurns,
      language,
      leadName,
      companyName,
      interestLevel,
      bantScore,
      objections,
      callbackRequested,
      meetingScheduled,
      narrativeSummary
    } = parsedData;

    const budgetText = bantScore.budget === true ? 'Identified' : (bantScore.budget === false ? 'Not identified' : 'Not evaluated');
    const authorityText = bantScore.authority === true ? 'Identified' : (bantScore.authority === false ? 'Not identified' : 'Not evaluated');
    const needText = bantScore.need === true ? 'Identified' : (bantScore.need === false ? 'Not identified' : 'Not evaluated');
    const timelineText = bantScore.timeline === true ? 'Identified' : (bantScore.timeline === false ? 'Not identified' : 'Not evaluated');

    const objectionsText = objections.length > 0 ? objections.map(o => `• ${o}`).join('\n') : 'None identified';
    const callbackText = callbackRequested === true ? 'Yes' : (callbackRequested === false ? 'No' : 'No');
    const meetingText = meetingScheduled === true ? 'Yes' : (meetingScheduled === false ? 'No' : 'No');

    return `EXECUTIVE CONVERSATION SUMMARY

Call Overview
Duration: ${durationFormatted}
Turns: ${totalTurns}
Language: ${language}

Lead
Name: ${leadName}
Company: ${companyName}
Interest: ${interestLevel}

BANT
Budget: ${budgetText}
Authority: ${authorityText}
Need: ${needText}
Timeline: ${timelineText}
Score: ${bantScore.score}/${bantScore.maxScore}

Objections
${objectionsText}

Next Step
Callback Requested: ${callbackText}
Meeting Scheduled: ${meetingText}

Summary
${narrativeSummary}`;
  }, [parsedData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedPlainTextCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderBantPill = (label: string, value: boolean | null) => {
    const isIdentified = value === true;
    const isNotIdentified = value === false;

    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60 dark:bg-[#1A202C]/60 dark:border-[#2D3748]">
        <span className="text-xs font-medium text-foreground-secondary dark:text-slate-300">
          {label}
        </span>
        {isIdentified ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Identified
          </span>
        ) : isNotIdentified ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground-muted dark:text-slate-400 bg-surface-elevated dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-border dark:border-slate-700">
            <XCircle className="w-3 h-3 text-slate-400" /> Not identified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground-muted dark:text-slate-400 bg-surface-elevated dark:bg-slate-800/40 px-2 py-0.5 rounded-md border border-border dark:border-slate-700">
            <HelpCircle className="w-3 h-3 text-slate-400" /> Not evaluated
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-xs dark:bg-[#12161F] dark:border-[#232B3B] flex flex-col space-y-4 max-h-[620px]">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 dark:border-[#232B3B] pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary dark:bg-blue-500/10 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground dark:text-white tracking-tight leading-none">
              Executive Conversation Summary
            </h3>
            <span className="text-[10px] text-foreground-muted dark:text-slate-400">
              Account Executive Debrief & Intelligence Synthesis
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-foreground-secondary hover:text-foreground bg-surface-elevated hover:bg-surface-hover border border-border rounded-lg transition-all shadow-xs dark:text-slate-300 dark:hover:text-white dark:bg-[#1A202C] dark:border-[#2D3748] active:scale-95 shrink-0"
          title="Copy formatted summary to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-foreground-muted dark:text-slate-400" />
              <span>Copy Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Scrollable Content Container to protect parent layout */}
      <div className="overflow-y-auto pr-1 space-y-3.5 text-xs flex-1 custom-scrollbar">
        {parsedData.isStructured ? (
          <>
            {/* Call Overview & Lead Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Call Overview */}
              <div className="bg-surface-elevated/60 border border-border/80 rounded-lg p-3 space-y-2 dark:bg-[#151A25] dark:border-[#232B3B]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-primary" /> Call Overview
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <div className="p-1.5 rounded bg-surface border border-border/40 dark:bg-[#1A202C] dark:border-[#2D3748]">
                    <span className="text-[9px] text-foreground-muted dark:text-slate-400 block">Duration</span>
                    <span className="font-semibold text-foreground dark:text-slate-200">{parsedData.durationFormatted}</span>
                  </div>
                  <div className="p-1.5 rounded bg-surface border border-border/40 dark:bg-[#1A202C] dark:border-[#2D3748]">
                    <span className="text-[9px] text-foreground-muted dark:text-slate-400 block">Turns</span>
                    <span className="font-semibold text-foreground dark:text-slate-200">{parsedData.totalTurns}</span>
                  </div>
                  <div className="p-1.5 rounded bg-surface border border-border/40 dark:bg-[#1A202C] dark:border-[#2D3748]">
                    <span className="text-[9px] text-foreground-muted dark:text-slate-400 block">Language</span>
                    <span className="font-semibold text-foreground dark:text-slate-200 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate">{parsedData.language}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Lead Info */}
              <div className="bg-surface-elevated/60 border border-border/80 rounded-lg p-3 space-y-2 dark:bg-[#151A25] dark:border-[#232B3B]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted dark:text-slate-400 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-primary" /> Lead
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <div className="p-1.5 rounded bg-surface border border-border/40 dark:bg-[#1A202C] dark:border-[#2D3748]">
                    <span className="text-[9px] text-foreground-muted dark:text-slate-400 block">Name</span>
                    <span className="font-semibold text-foreground dark:text-slate-200 truncate block" title={parsedData.leadName}>
                      {parsedData.leadName}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-surface border border-border/40 dark:bg-[#1A202C] dark:border-[#2D3748]">
                    <span className="text-[9px] text-foreground-muted dark:text-slate-400 block">Company</span>
                    <span className="font-semibold text-foreground dark:text-slate-200 truncate block" title={parsedData.companyName}>
                      {parsedData.companyName}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-surface border border-border/40 dark:bg-[#1A202C] dark:border-[#2D3748]">
                    <span className="text-[9px] text-foreground-muted dark:text-slate-400 block">Interest</span>
                    <span className="font-semibold text-primary dark:text-blue-400 truncate block">
                      {parsedData.interestLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BANT Qualification */}
            <div className="bg-surface-elevated/60 border border-border/80 rounded-lg p-3 space-y-2 dark:bg-[#151A25] dark:border-[#232B3B]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted dark:text-slate-400 flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-emerald-500" /> BANT
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-foreground-secondary dark:text-slate-300">
                    Score:
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {parsedData.bantScore.score} / {parsedData.bantScore.maxScore}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {renderBantPill('Budget', parsedData.bantScore.budget)}
                {renderBantPill('Authority', parsedData.bantScore.authority)}
                {renderBantPill('Need', parsedData.bantScore.need)}
                {renderBantPill('Timeline', parsedData.bantScore.timeline)}
              </div>
            </div>

            {/* Objections & Next Step Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Objections */}
              <div className="bg-surface-elevated/60 border border-border/80 rounded-lg p-3 space-y-2 dark:bg-[#151A25] dark:border-[#232B3B]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-amber-500" /> Objections
                </span>

                {parsedData.objections.length > 0 ? (
                  <ul className="space-y-1 text-xs text-foreground-secondary dark:text-slate-300">
                    {parsedData.objections.map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5 bg-amber-500/5 border border-amber-500/20 p-1.5 rounded-md">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>None identified</span>
                  </div>
                )}
              </div>

              {/* Next Step */}
              <div className="bg-surface-elevated/60 border border-border/80 rounded-lg p-3 space-y-2 dark:bg-[#151A25] dark:border-[#232B3B]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-primary" /> Next Step
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-surface border border-border/60 dark:bg-[#1A202C]/60 dark:border-[#2D3748] flex items-center justify-between">
                    <span className="text-foreground-secondary dark:text-slate-300 font-medium text-[11px]">
                      Callback
                    </span>
                    {parsedData.callbackRequested === true ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Yes
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-surface-elevated dark:bg-slate-800 text-foreground-muted dark:text-slate-400 border border-border dark:border-slate-700">
                        No
                      </span>
                    )}
                  </div>

                  <div className="p-2 rounded-lg bg-surface border border-border/60 dark:bg-[#1A202C]/60 dark:border-[#2D3748] flex items-center justify-between">
                    <span className="text-foreground-secondary dark:text-slate-300 font-medium text-[11px]">
                      Meeting
                    </span>
                    {parsedData.meetingScheduled === true ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Yes
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-surface-elevated dark:bg-slate-800 text-foreground-muted dark:text-slate-400 border border-border dark:border-slate-700">
                        No
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Conversation Summary */}
            <div className="bg-surface-elevated/60 border border-border/80 rounded-lg p-3 space-y-1.5 dark:bg-[#151A25] dark:border-[#232B3B]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-primary" /> Conversation Summary
              </span>
              <div className="text-xs text-foreground dark:text-slate-200 leading-relaxed whitespace-pre-line bg-surface p-3 rounded-md border border-border/60 dark:bg-[#1A202C]/40 dark:border-[#2D3748]">
                {parsedData.narrativeSummary}
              </div>
            </div>
          </>
        ) : (
          /* Fallback for un-structured plain text summaries */
          <div className="bg-surface-elevated border border-border rounded-lg p-3 dark:bg-[#151A25] dark:border-[#232B3B]">
            <p className="text-xs text-foreground-secondary dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {parsedData.narrativeSummary}
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 pt-2 text-[10px] text-foreground-muted dark:text-slate-400 border-t border-border/40 dark:border-[#232B3B] shrink-0">
        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Structured for Account Executive handoff (Overview · BANT · Objections · Next Step)</span>
      </div>
    </div>
  );
};

