/**
 * Summary utilities for parsing, cleaning, and formatting AI Call Summaries & Executive Takeaways across the application.
 */

export interface ParsedExecutiveSummary {
  durationSeconds?: number;
  durationFormatted: string;
  totalTurns: number | string;
  language: string;
  leadName: string;
  companyName: string;
  interestLevel: string;
  objections: string[];
  callbackRequested: boolean | null;
  meetingScheduled: boolean | null;
  bantScore: {
    budget: boolean | null;
    authority: boolean | null;
    need: boolean | null;
    timeline: boolean | null;
    score: number;
    maxScore: number;
  };
  narrativeSummary: string;
  isStructured: boolean;
}

export function formatDurationSeconds(seconds?: number | string | null): string {
  if (seconds === undefined || seconds === null || seconds === '') return 'Not available';
  const num = typeof seconds === 'number' ? seconds : parseFloat(String(seconds));
  if (isNaN(num)) return String(seconds);

  const rounded = Math.round(num);
  if (rounded <= 0) return '0 sec';

  const hrs = Math.floor(rounded / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (hrs > 0) {
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  if (mins > 0) {
    return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
  }
  return `${secs} sec`;
}

export function formatLanguage(lang?: string | null): string {
  if (!lang) return 'Not specified';
  const clean = String(lang).trim().toLowerCase();
  const langMap: Record<string, string> = {
    hi: 'Hindi',
    hinglish: 'Hindi / Hinglish',
    en: 'English',
    gu: 'Gujarati',
    mr: 'Marathi',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    bn: 'Bengali',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
  };
  if (langMap[clean]) return langMap[clean];
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function formatInterestLevel(level?: string | null): string {
  if (!level || level === 'null' || level === 'undefined') return 'Unknown';
  const clean = String(level).trim().toLowerCase();
  const map: Record<string, string> = {
    unknown: 'Unknown',
    not_interested: 'Not Interested',
    maybe: 'Maybe',
    interested: 'Interested',
    very_interested: 'Very Interested',
    high: 'High Interest',
    medium: 'Medium Interest',
    low: 'Low Interest',
  };
  return map[clean] || (String(level).charAt(0).toUpperCase() + String(level).slice(1));
}

export function cleanText(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\r/g, '')
    .trim();
}

/**
 * Safely parse any raw summary input (JSON object, stringified JSON, markdown fences, or plain text)
 */
export function parseSummaryData(rawSummary: any): ParsedExecutiveSummary {
  let parsedObj: any = null;
  let rawText = '';

  if (typeof rawSummary === 'object' && rawSummary !== null) {
    parsedObj = rawSummary;
  } else if (typeof rawSummary === 'string') {
    rawText = rawSummary.trim();

    let cleanedString = rawText;
    if (cleanedString.startsWith('```')) {
      cleanedString = cleanedString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    if (cleanedString.startsWith('{') && cleanedString.endsWith('}')) {
      try {
        parsedObj = JSON.parse(cleanedString);
      } catch (e) {
        parsedObj = null;
      }
    }
  }

  if (parsedObj && (parsedObj.lead_info || parsedObj.duration_seconds !== undefined || parsedObj.bant_score || parsedObj.total_turns !== undefined)) {
    const leadInfo = parsedObj.lead_info || {};
    const bant = parsedObj.bant_score || leadInfo.bant_score || {};

    const durationSec = parsedObj.duration_seconds ?? parsedObj.duration;
    const durationFormatted = formatDurationSeconds(durationSec);

    const totalTurns = parsedObj.total_turns ?? parsedObj.turns ?? 'Not recorded';
    const language = formatLanguage(parsedObj.language || leadInfo.language);

    const leadName = leadInfo.name ? String(leadInfo.name).trim() : 'Not provided';
    const companyName = leadInfo.company ? String(leadInfo.company).trim() : 'Not provided';
    const interestLevel = formatInterestLevel(leadInfo.interest_level);

    let objections: string[] = [];
    if (Array.isArray(leadInfo.objections)) {
      objections = leadInfo.objections.map((o: any) =>
        typeof o === 'string' ? cleanText(o) : cleanText(o?.concern || o?.title || o?.text || JSON.stringify(o))
      ).filter(Boolean);
    } else if (typeof leadInfo.objections === 'string' && leadInfo.objections.trim()) {
      objections = [cleanText(leadInfo.objections)];
    }

    const callbackRequested = typeof leadInfo.callback_requested === 'boolean' ? leadInfo.callback_requested : null;
    const meetingScheduled = typeof leadInfo.meeting_scheduled === 'boolean' ? leadInfo.meeting_scheduled : null;

    const budget = typeof bant.budget === 'boolean' ? bant.budget : (typeof leadInfo.budget_discussed === 'boolean' ? leadInfo.budget_discussed : null);
    const authority = typeof bant.authority === 'boolean' ? bant.authority : (typeof leadInfo.authority_confirmed === 'boolean' ? leadInfo.authority_confirmed : null);
    const need = typeof bant.need === 'boolean' ? bant.need : (typeof leadInfo.need_identified === 'boolean' ? leadInfo.need_identified : null);
    const timeline = typeof bant.timeline === 'boolean' ? bant.timeline : (typeof leadInfo.timeline_discussed === 'boolean' ? leadInfo.timeline_discussed : null);

    let calculatedScore = 0;
    if (budget === true) calculatedScore++;
    if (authority === true) calculatedScore++;
    if (need === true) calculatedScore++;
    if (timeline === true) calculatedScore++;

    const score = typeof bant.score === 'number' ? bant.score : calculatedScore;
    const maxScore = typeof bant.max_score === 'number' ? bant.max_score : 4;

    let narrativeSummary = cleanText(parsedObj.summary_text || parsedObj.narrative_summary || parsedObj.summary || leadInfo.summary_text);

    if (!narrativeSummary) {
      const parts: string[] = [];

      if (need === true) {
        parts.push('The prospect confirmed active operational needs regarding their current payment infrastructure.');
      } else {
        parts.push('Autonomous voice call completed with verified BANT qualification.');
      }

      if (objections.length > 0) {
        parts.push(`Primary objection raised: ${objections.join('; ')}.`);
      }

      if (meetingScheduled === true) {
        parts.push('Product walkthrough demo successfully scheduled.');
      } else if (callbackRequested === true) {
        parts.push('Callback requested at a later time.');
      } else {
        parts.push('Call concluded without a demo or callback scheduled.');
      }

      narrativeSummary = parts.join(' ');
    }

    return {
      durationSeconds: typeof durationSec === 'number' ? durationSec : undefined,
      durationFormatted,
      totalTurns,
      language,
      leadName,
      companyName,
      interestLevel,
      objections,
      callbackRequested,
      meetingScheduled,
      bantScore: {
        budget,
        authority,
        need,
        timeline,
        score,
        maxScore,
      },
      narrativeSummary,
      isStructured: true,
    };
  }

  const cleanedNarrative = cleanText(rawText || (typeof rawSummary === 'string' ? rawSummary : JSON.stringify(rawSummary)));

  return {
    durationFormatted: 'Not available',
    totalTurns: 'Not recorded',
    language: 'Not specified',
    leadName: 'Not provided',
    companyName: 'Not provided',
    interestLevel: 'Unknown',
    objections: [],
    callbackRequested: null,
    meetingScheduled: null,
    bantScore: {
      budget: null,
      authority: null,
      need: null,
      timeline: null,
      score: 0,
      maxScore: 4,
    },
    narrativeSummary: cleanedNarrative || 'No summary available.',
    isStructured: false,
  };
}

/**
 * Format any raw summary or keyTakeaway text into a clean 1-3 sentence Executive Takeaway
 * Suitable for Dashboard cards, Takeaway paragraphs, and list previews.
 */
export function formatExecutiveTakeaway(rawSummary: any): string {
  if (!rawSummary) return 'Autonomous AI voice call completed.';

  const parsed = parseSummaryData(rawSummary);
  if (!parsed.isStructured) {
    return parsed.narrativeSummary;
  }

  // Build a crisp 2-sentence executive takeaway for Dashboard cards
  const parts: string[] = [];

  const langStr = parsed.language !== 'Not specified' ? ` (${parsed.language})` : '';
  const durStr = parsed.durationFormatted !== 'Not available' ? ` [${parsed.durationFormatted}]` : '';

  if (parsed.bantScore.need === true) {
    parts.push(`Prospect confirmed operational requirements regarding payment infrastructure${langStr}${durStr}.`);
  } else {
    parts.push(`Autonomous AI voice call completed${langStr}${durStr}.`);
  }

  if (parsed.objections.length > 0) {
    parts.push(`Objection raised: ${parsed.objections[0]}.`);
  } else if (parsed.meetingScheduled === true) {
    parts.push('Product walkthrough demo successfully confirmed.');
  } else if (parsed.callbackRequested === true) {
    parts.push('Follow-up callback requested.');
  } else {
    parts.push(`BANT Score: ${parsed.bantScore.score}/${parsed.bantScore.maxScore}.`);
  }

  return parts.join(' ');
}
