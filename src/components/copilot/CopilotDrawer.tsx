import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { SalesConversationContext } from '../../types/copilot';
import { CopilotHeader } from './CopilotHeader';
import { ConversationBriefCard } from './ConversationBriefCard';
import { OpeningHookCard } from './OpeningHookCard';
import { TalkingPointsSection } from './TalkingPointsSection';
import { DiscoveryQuestionsSection } from './DiscoveryQuestionsSection';
import { ObjectionMatrix } from './ObjectionMatrix';
import { CopilotActionPanel } from './CopilotActionPanel';

interface CopilotDrawerProps {
  context: SalesConversationContext | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  context,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !context) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Sales Copilot preparation for ${context.companyName}`}
        className="w-full max-w-3xl bg-surface-0 border-l border-border-default h-full flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header Close Bar */}
        <div className="p-4 border-b border-border-default flex items-center justify-between sticky top-0 bg-surface-0 z-20">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">
              Sales Copilot & Conversation Intelligence
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-foreground-tertiary hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
            aria-label="Close Copilot drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Summary */}
        <CopilotHeader context={context} showBack={false} />

        {/* Copilot Body Sections */}
        <div className="p-6 space-y-6 flex-1">
          <ConversationBriefCard context={context} />
          <OpeningHookCard openingHook={context.openingHook} />
          <TalkingPointsSection points={context.talkingPoints} />
          <DiscoveryQuestionsSection questions={context.discoveryQuestions} />
          <ObjectionMatrix objections={context.objections} />
          <CopilotActionPanel context={context} />
        </div>
      </div>
    </div>
  );
};
