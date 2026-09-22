import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Clock, 
  Phone, 
  Bot, 
  UserCheck, 
  CalendarPlus, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  PhoneOff,
  HelpCircle,
  FileDown
} from 'lucide-react';
import { toast } from 'sonner';
import { CallResultData, CallOutcomeType } from '../../../types/callResults';
import { PDFReportService } from '../../../services/pdfReportService';

interface CallResultHeaderProps {
  data: CallResultData;
  onOpenScheduleDemo: () => void;
  onOpenFollowUp: () => void;
}

export const CallResultHeader: React.FC<CallResultHeaderProps> = ({
  data,
  onOpenScheduleDemo,
  onOpenFollowUp,
}) => {
  const navigate = useNavigate();

  const getOutcomeBadge = (outcome: CallOutcomeType) => {
    switch (outcome) {
      case 'QUALIFIED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'QUALIFIED LEAD',
          icon: ShieldCheck,
        };
      case 'INTERESTED':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400',
          label: 'INTERESTED',
          icon: UserCheck,
        };
      case 'FOLLOW_UP':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          label: 'FOLLOW-UP REQUIRED',
          icon: Clock,
        };
      case 'NO_ANSWER':
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-400',
          label: 'NO ANSWER',
          icon: PhoneOff,
        };
      case 'FAILED':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          label: 'CALL DROPPED / FAILED',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400',
          label: outcome,
          icon: HelpCircle,
        };
    }
  };

  const badge = getOutcomeBadge(data.outcome);
  const BadgeIcon = badge.icon;

  return (
    <div className="bg-[#12161F] border-b border-[#232B3B] px-4 sm:px-6 lg:px-8 py-5">
      {/* Top row: Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/leads/${data.leadId}`)}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-100 hover:text-white bg-[#1A202C] hover:bg-[#252D3D] px-3 py-1.5 rounded-lg border border-[#3B4861] transition-colors focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            title="Return to Lead Dossier"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Lead Dossier</span>
          </button>

          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-xs text-slate-300 hidden sm:inline">
            Call ID: <span className="font-mono text-slate-200">{data.callId}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/leads/${data.leadId}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-100 hover:text-white bg-[#1A202C] hover:bg-[#252D3D] border border-[#3B4861] rounded-lg hover:border-slate-400 transition-colors shadow-xs"
          >
            <span>View Dossier</span>
            <ExternalLink className="w-3 h-3 text-slate-300" />
          </button>

          <button
            onClick={onOpenFollowUp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E293B] hover:bg-[#2B3B52] border border-slate-600 hover:border-slate-400 rounded-lg transition-colors shadow-xs"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-300" />
            <span>Send Follow-up</span>
          </button>

          <button
            onClick={() => {
              try {
                PDFReportService.generateCallReport({
                  companyName: data.companyName,
                  callId: data.callId,
                  leadId: data.leadId,
                  outcome: data.outcome,
                  intentScore: 85,
                  estimatedValue: '$50,000 ARR',
                  durationSeconds: 155,
                  decisionMakerName: data.contactName,
                  decisionMakerRole: data.contactRole,
                  requirement: data.nextBestAction?.action || 'Commercial Sales Discovery',
                  summary: data.summary,
                  signals: data.buyingSignals?.map(s => s.title),
                  objections: data.objections?.map(o => o.concern),
                  transcript: data.transcript?.map(t => ({ speaker: t.speaker, text: t.text, time: t.timestamp }))
                });
                toast.success('Executive Call Report PDF downloaded successfully');
              } catch (err) {
                toast.error('Failed to export PDF report');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-500 rounded-lg transition-colors shadow-sm"
            title="Download executive debrief PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-white" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={onOpenScheduleDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover active:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Schedule Demo</span>
          </button>
        </div>
      </div>

      {/* Main Info Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Company & Contact Profile */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0 shadow-inner">
            {data.companyName.charAt(0)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {data.companyName}
              </h1>
              
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
                <BadgeIcon className="w-3 h-3" />
                <span>{badge.label}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{data.contactName}</span>
                <span className="text-slate-500">({data.contactRole})</span>
              </div>
              
              <div className="flex items-center gap-1 text-slate-400">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{data.contactPhone}</span>
              </div>

              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-slate-400 hidden md:inline">{data.industry}</span>

              <span className="text-slate-600 hidden lg:inline">•</span>
              <span className="text-slate-400 hidden lg:inline">{data.location}</span>
            </div>
          </div>
        </div>

        {/* Telephony Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161B26] border border-[#232B3B] text-xs text-slate-300">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">Duration:</span>
            <span className="font-medium text-white">{data.metadata.duration}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161B26] border border-[#232B3B] text-xs text-slate-300">
            <Calendar className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-400">Call Time:</span>
            <span className="font-medium text-white">{data.metadata.callTime}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161B26] border border-[#232B3B] text-xs text-slate-300">
            <Bot className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">Agent:</span>
            <span className="font-medium text-white">{data.metadata.agent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
