import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Bot, 
  User, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Copy,
  Sparkles,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { TranscriptTurn } from '../../../types/callResults';

interface VerbatimTranscriptPanelProps {
  transcript: TranscriptTurn[];
  highlightedTurnId?: string | null;
}

export const VerbatimTranscriptPanel: React.FC<VerbatimTranscriptPanelProps> = ({
  transcript,
  highlightedTurnId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!transcript || transcript.length === 0) {
    return (
      <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 text-center">
        <FileText className="w-6 h-6 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-300">No transcript turns available</p>
        <p className="text-xs text-slate-500 mt-1">This call session did not record conversational audio turns.</p>
      </div>
    );
  }

  const filteredTurns = transcript.filter((turn) =>
    turn.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turn.speakerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (turn.markerLabel && turn.markerLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopyFullTranscript = () => {
    const fullText = transcript
      .map((t) => `[${t.timestamp}] ${t.speakerName}: ${t.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getMarkerBadge = (marker?: TranscriptTurn['marker'], label?: string) => {
    if (!marker) return null;

    switch (marker) {
      case 'BUYING_SIGNAL':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>{label || 'Buying Signal'}</span>
          </span>
        );
      case 'OBJECTION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>{label || 'Objection'}</span>
          </span>
        );
      case 'QUALIFICATION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded">
            <Tag className="w-2.5 h-2.5" />
            <span>{label || 'Qualification'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
            <Tag className="w-2.5 h-2.5" />
            <span>{label || marker}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#12161F] border border-[#232B3B] rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Verbatim Call Transcript
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1E2536] text-slate-300 border border-[#2D3748]">
            {transcript.length} Turns
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-44 sm:w-56 pl-8 pr-2.5 py-1 text-xs rounded-md bg-[#161B26] border border-[#263143] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Copy Full Transcript */}
          <button
            onClick={handleCopyFullTranscript}
            className="p-1.5 rounded-md bg-[#1A202C] hover:bg-[#252D3D] text-slate-200 hover:text-white border border-[#3B4861] transition-colors"
            title="Copy entire transcript"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Collapse/Expand toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md bg-[#1A202C] hover:bg-[#252D3D] text-slate-200 hover:text-white border border-[#3B4861] transition-colors"
            title={isExpanded ? 'Collapse transcript' : 'Expand transcript'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 mt-3 max-h-[540px] overflow-y-auto pr-1">
          {filteredTurns.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching conversation turns found for "{searchTerm}".
            </div>
          ) : (
            filteredTurns.map((turn) => {
              const isAi = turn.speaker === 'ai_agent';
              const isTargeted = highlightedTurnId === turn.id;

              return (
                <div
                  key={turn.id}
                  id={`transcript-turn-${turn.id}`}
                  className={`p-3.5 rounded-lg border transition-all duration-300 ${
                    isTargeted
                      ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/40 shadow-md'
                      : isAi
                      ? 'bg-[#151A25] border-[#222C3D]'
                      : 'bg-[#0E121B] border-[#1E2536]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isAi
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </div>

                      <span className={`text-xs font-semibold ${isAi ? 'text-blue-300' : 'text-emerald-300'}`}>
                        {turn.speakerName}
                      </span>

                      <span className="text-[11px] font-mono text-slate-500">
                        {turn.timestamp}
                      </span>
                    </div>

                    {getMarkerBadge(turn.marker, turn.markerLabel)}
                  </div>

                  <p className="text-xs text-slate-200 pl-7 leading-relaxed font-normal">
                    {turn.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
