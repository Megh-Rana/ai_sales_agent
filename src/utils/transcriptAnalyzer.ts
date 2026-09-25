/**
 * transcriptAnalyzer.ts
 *
 * Pure client-side, zero-latency transcript analysis engine.
 * Runs after every new transcript turn and produces:
 *   - Updated QualificationDimension map (status + detail)
 *   - New IntelligenceEvent[] to append to the feed
 *
 * Multi-lingual: handles English, Hindi, Gujarati, Marathi via
 * keyword / pattern matching. No backend LLM call required.
 */

import {
  TranscriptItem,
  QualificationDimension,
  QualificationStatus,
  IntelligenceEvent,
  IntelligenceEventType,
} from '../types/calls';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnalysisResult {
  qualificationUpdates: Partial<Record<string, Partial<QualificationDimension>>>;
  newIntelligenceEvents: IntelligenceEvent[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function norm(s: string): string {
  return s.toLowerCase().replace(/[।,.!?'"]/g, ' ');
}

function contains(text: string, patterns: string[]): boolean {
  const n = norm(text);
  return patterns.some((p) => n.includes(p));
}

function excerpt(text: string, maxLen = 80): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen).trim()}…` : clean;
}

// ---------------------------------------------------------------------------
// Signal keyword maps — multilingual
// ---------------------------------------------------------------------------

const NEED_PATTERNS: string[] = [
  'automate','automation','looking for','we need','we want','require',
  'requirement','evaluation','evaluating','considering','rfi','rfp','rfq',
  'initiative','project','scaling','scale','expand','expansion',
  'जरूरत','आवश्यकता','चाहते हैं','देख रहे हैं','योजना',
  'જરૂર','આવશ્યકતા','ઓટોમેશન',
  'गरज','आवश्यकता','स्वयंचलित',
];

const PAIN_PATTERNS: string[] = [
  'problem','issue','challenge','pain','struggle','bottleneck','manual',
  'slow','delay','overhead','overwhelmed','stuck','miss','inefficient',
  'waste','hours','time consuming','lag','friction','costly','expensive',
  'eroding','losing','losing money','दिक्कत','परेशानी','धीमा','मैनुअल',
  'समस्या','तकलीफ','अडचण','त्रास',
];

const TIMELINE_PATTERNS: string[] = [
  'quarter','q1','q2','q3','q4','month','week','by end of','deadline',
  'before','asap','urgently','soon','next quarter','this year','timeline',
  'go-live','go live','launch','deploy','rollout','target date',
  'committee','review','board','approval','procurement',
  'जल्दी','तुरंत','अगले','महीने','तिमाही','समयसीमा',
  'ઝડપી','સમયસીમા','આ ત્રિમાસ',
  'लवकर','तातडीने','पुढील तिमाही',
];

const BUDGET_PATTERNS: string[] = [
  'budget','approved','capex','opex','spend','investment','cost','funding',
  'allocated','finances','financial','affordability','price','pricing',
  'license','subscription','roi','payback',
  'बजट','खर्च','निवेश','लागत','मूल्य',
  'બજેટ','ખર્ચ','ગુંતવણૂક',
  'बजेट','गुंतवणूक',
];

const STAKEHOLDER_PATTERNS: string[] = [
  'ceo','cto','cfo','vp','head of','director','manager','team lead',
  'committee','board','stakeholder','decision maker','approval','sign off',
  'sign-off','leadership','executive','it team','procurement team',
  'प्रमुख','निदेशक','अनुमोदन','समिति',
  'વડા','નિર્ણય',
  'संचालक','मंजुरी',
];

const TECH_STACK_PATTERNS: string[] = [
  'using','currently use','existing','legacy','old system','software',
  'crm','erp','salesforce','hubspot','zoho','pipedrive','sap','oracle',
  'microsoft','dynamics','freshdesk','freshsales','zendesk','twilio',
  'freshworks','dialer','pbx','ivr','avaya','genesys',
  'मौजूदा','पुराना सिस्टम','सीआरएम',
  'હાલ ઉપયોગ','સોફ્ટવેર',
  'सध्या वापर','सॉफ्टवेअर',
];

const INTEGRATION_PATTERNS: string[] = [
  'integrate','integration','api','connect','plugin','webhook',
  'compatibility','migration','downtime','deploy','implementation',
  'onboard','setup','configuration','customize','customization',
  'एकीकरण','कनेक्ट','एकत्रित',
  'ઇન્ટિગ્રેશન','જોડવું',
  'एकत्रीकरण','जोडणे',
];

const STRONG_BUYING_PATTERNS: string[] = [
  'send the calendar','book a demo','schedule a meeting','set up a call',
  'thursday','friday','monday','tuesday','wednesday',
  'works for me','sounds good','interested','very interested','would love',
  'absolutely','yes let','send the invite','calendar invite','proposal',
  'send over','move forward','next step','sign','contract','poc','pilot',
  'हाँ चलिए','बिल्कुल','ठीक है','डेमो चाहिए','आगे बढ़ते हैं',
  'હા ચાલો','બિલકુલ',
  'हो चला','नक्की',
];

const OBJECTION_PATTERNS: string[] = [
  'concern','worried','not sure','hesitant','downtime','risk','risky',
  'cannot','cannot afford','too expensive','not a priority','not now',
  'later','busy','not ready','no budget','no approval','complicated',
  'complex','difficult','security','compliance','gdpr',
  'चिंता','जोखिम','सुरक्षा','महंगा','जटिल',
  'ચિંતા','જોખમ',
  'काळजी','जोखीम','महाग',
];

// ---------------------------------------------------------------------------
// Main analyzer
// ---------------------------------------------------------------------------

/**
 * Analyze transcript turns since lastAnalyzedCount and return updates.
 *
 * @param allTurns           Full transcript so far
 * @param lastAnalyzedCount  How many turns were analyzed in the prior run
 * @param currentQual        Current qualification state (never downgrade)
 * @param existingEventIds   IDs already in the feed (dedup guard)
 */
export function analyzeTranscript(
  allTurns: TranscriptItem[],
  lastAnalyzedCount: number,
  currentQual: Record<string, QualificationDimension>,
  existingEventIds: Set<string>
): AnalysisResult {
  const newTurns = allTurns.slice(lastAnalyzedCount);
  if (newTurns.length === 0) {
    return { qualificationUpdates: {}, newIntelligenceEvents: [] };
  }

  const qualUpdates: Partial<Record<string, Partial<QualificationDimension>>> = {};
  const newEvents: IntelligenceEvent[] = [];

  const ORDER: Record<QualificationStatus, number> = {
    unknown: 0,
    discovering: 1,
    confirmed: 2,
  };

  const upgradeQual = (
    dim: string,
    status: QualificationStatus,
    detail: string,
    evidence?: string
  ) => {
    const cur = currentQual[dim]?.status ?? 'unknown';
    const prev = qualUpdates[dim]?.status ?? cur;
    const prevOrder = ORDER[prev as QualificationStatus] ?? 0;
    if (ORDER[status] > prevOrder) {
      qualUpdates[dim] = {
        ...qualUpdates[dim],
        status,
        detail: excerpt(detail),
        ...(evidence ? { evidence: excerpt(evidence) } : {}),
      };
    } else if (!qualUpdates[dim]?.detail && !currentQual[dim]?.detail) {
      qualUpdates[dim] = { ...qualUpdates[dim], detail: excerpt(detail) };
    }
  };

  for (const turn of newTurns) {
    const txt = turn.text || '';
    if (!txt.trim()) continue;

    const isProspect = turn.speaker === 'prospect';
    const ts = turn.timestamp || '00:00';
    const id = turn.id;

    // 1. NEED
    if (contains(txt, NEED_PATTERNS)) {
      upgradeQual('Need', isProspect ? 'confirmed' : 'discovering', txt, txt);
      if (isProspect) {
        const eid = `sig-need-${id}`;
        if (!existingEventIds.has(eid)) {
          newEvents.push({
            id: eid,
            type: 'qualification' as IntelligenceEventType,
            title: 'Business Need Confirmed',
            description: 'Prospect articulated a specific business requirement.',
            quote: excerpt(txt, 110),
            timestamp: ts,
            dimension: 'Need',
            impactScore: 85,
            whyItMatters: 'Stated requirement is the foundation of a qualified deal.'
          });
        }
      }
    }

    // 2. PAIN POINT
    if (contains(txt, PAIN_PATTERNS)) {
      upgradeQual('Pain Point', isProspect ? 'confirmed' : 'discovering', txt, txt);
      if (isProspect) {
        const eid = `sig-pain-${id}`;
        if (!existingEventIds.has(eid)) {
          newEvents.push({
            id: eid,
            type: 'buying_signal' as IntelligenceEventType,
            title: 'Pain Point Disclosed',
            description: 'Prospect described a concrete operational problem.',
            quote: excerpt(txt, 110),
            timestamp: ts,
            dimension: 'Pain Point',
            impactScore: 88,
            whyItMatters: 'Stated pain signals active dissatisfaction — prime timing for solution positioning.'
          });
        }
      }
    }

    // 3. TIMELINE
    if (contains(txt, TIMELINE_PATTERNS)) {
      upgradeQual('Timeline', isProspect ? 'confirmed' : 'discovering', txt, txt);
      if (isProspect) {
        const eid = `sig-timeline-${id}`;
        if (!existingEventIds.has(eid)) {
          newEvents.push({
            id: eid,
            type: 'buying_signal' as IntelligenceEventType,
            title: 'Decision Timeline Surfaced',
            description: 'Prospect revealed a specific urgency or time constraint.',
            quote: excerpt(txt, 110),
            timestamp: ts,
            dimension: 'Timeline',
            impactScore: 90,
            whyItMatters: 'A stated timeline confirms active vendor evaluation and urgency to close.'
          });
        }
      }
    }

    // 4. BUDGET
    if (contains(txt, BUDGET_PATTERNS)) {
      upgradeQual('Budget', isProspect ? 'confirmed' : 'discovering', txt, txt);
      if (isProspect) {
        const eid = `sig-budget-${id}`;
        if (!existingEventIds.has(eid)) {
          newEvents.push({
            id: eid,
            type: 'qualification' as IntelligenceEventType,
            title: 'Budget Signal Detected',
            description: 'Prospect mentioned budget, pricing, or financial capacity.',
            quote: excerpt(txt, 110),
            timestamp: ts,
            dimension: 'Budget',
            impactScore: 87,
            whyItMatters: 'Budget visibility is a critical BANT qualifier.'
          });
        }
      }
    }

    // 5. STAKEHOLDERS
    if (contains(txt, STAKEHOLDER_PATTERNS)) {
      upgradeQual('Decision Maker', isProspect ? 'confirmed' : 'discovering', txt, txt);
      if (isProspect) {
        const eid = `sig-dm-${id}`;
        if (!existingEventIds.has(eid)) {
          newEvents.push({
            id: eid,
            type: 'qualification' as IntelligenceEventType,
            title: 'Stakeholder Identified',
            description: 'Prospect referenced a decision maker or approval chain.',
            quote: excerpt(txt, 110),
            timestamp: ts,
            dimension: 'Decision Maker',
            impactScore: 82,
            whyItMatters: 'Knowing decision authority enables a targeted close strategy.'
          });
        }
      }
    }

    // 6. TECH STACK
    if (contains(txt, TECH_STACK_PATTERNS)) {
      upgradeQual('Current Solution', isProspect ? 'confirmed' : 'discovering', txt, txt);
      if (isProspect) {
        const eid = `sig-tech-${id}`;
        if (!existingEventIds.has(eid)) {
          newEvents.push({
            id: eid,
            type: 'interest' as IntelligenceEventType,
            title: 'Tech Stack Disclosed',
            description: 'Prospect revealed their current tools or software environment.',
            quote: excerpt(txt, 110),
            timestamp: ts,
            dimension: 'Current Solution',
            impactScore: 78,
            whyItMatters: 'Understanding the stack enables precise integration positioning.'
          });
        }
      }
    }

    // 7. INTEGRATION READINESS
    if (contains(txt, INTEGRATION_PATTERNS)) {
      upgradeQual(
        'Implementation Readiness',
        isProspect ? 'confirmed' : 'discovering',
        txt,
        txt
      );
    }

    // 8. STRONG BUYING SIGNAL
    if (isProspect && contains(txt, STRONG_BUYING_PATTERNS)) {
      const eid = `sig-buy-${id}`;
      if (!existingEventIds.has(eid)) {
        newEvents.push({
          id: eid,
          type: 'buying_signal' as IntelligenceEventType,
          title: 'Strong Buying Signal',
          description: 'Prospect expressed strong intent or agreed to a concrete next step.',
          quote: excerpt(txt, 110),
          timestamp: ts,
          impactScore: 96,
          whyItMatters: 'High-confidence purchase signal — prioritize immediate follow-through.'
        });
      }
    }

    // 9. OBJECTION
    if (isProspect && contains(txt, OBJECTION_PATTERNS)) {
      const eid = `sig-obj-${id}`;
      if (!existingEventIds.has(eid)) {
        newEvents.push({
          id: eid,
          type: 'objection' as IntelligenceEventType,
          title: 'Objection / Concern Raised',
          description: 'Prospect expressed a concern, risk, or hesitation.',
          quote: excerpt(txt, 110),
          timestamp: ts,
          impactScore: 75,
          whyItMatters: 'Address this proactively before it becomes a deal blocker.'
        });
      }
    }
  }

  return { qualificationUpdates: qualUpdates, newIntelligenceEvents: newEvents };
}
