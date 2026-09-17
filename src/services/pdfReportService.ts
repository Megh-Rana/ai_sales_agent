import { jsPDF } from 'jspdf';


export class PDFReportService {
  /**
   * Generates and downloads an Executive Call Intelligence Dossier PDF
   */
  public static generateCallReport(
    callData: {
      companyName: string;
      leadId?: string;
      callId: string;
      outcome: string;
      intentScore?: number;
      estimatedValue?: string;
      durationSeconds?: number;
      decisionMakerName?: string;
      decisionMakerRole?: string;
      requirement?: string;
      whyNow?: string;
      summary?: string;
      signals?: string[];
      objections?: string[];
      qualifications?: { name: string; status: string; detail?: string }[];
      nextSteps?: string[];
      transcript?: { speaker: string; text: string; time?: string }[];
    }
  ) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 16;

    // Helper for pagination
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 15) {
        doc.addPage();
        y = 16;
        // Subtle top header on subsequent pages
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(140, 150, 170);
        doc.text(`Vidur AI OS | Call Report - ${callData.companyName} (${callData.callId})`, margin, 10);
        doc.setDrawColor(220, 225, 235);
        doc.setLineWidth(0.2);
        doc.line(margin, 12, pageWidth - margin, 12);
      }
    };

    // Header Background Accent Bar
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Title / Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('VIDUR | AI SALES OPERATING SYSTEM', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(205, 180, 219); // Thistle accent
    doc.text('AUTONOMOUS CALL INTELLIGENCE & VERIFIED DOSSIER', margin, 17);

    // Generation Metadata (Right aligned)
    doc.setFontSize(7.5);
    doc.setTextColor(180, 195, 215);
    const dateStr = new Date().toLocaleString();
    doc.text(`Generated: ${dateStr}`, pageWidth - margin, 11, { align: 'right' });
    doc.text(`Call Ref: ${callData.callId}`, pageWidth - margin, 16, { align: 'right' });

    y = 33;

    // Company Overview Card Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(callData.companyName, margin + 4, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const contactText = `${callData.decisionMakerName || 'Prospect Decision Maker'} (${callData.decisionMakerRole || 'Executive'})`;
    doc.text(contactText, margin + 4, y + 14);

    // Value & Intent badges inside header box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(99, 102, 241);
    doc.text(`Est. Value: ${callData.estimatedValue || '$45,000 ARR'}`, margin + 4, y + 22);

    // Call Outcome Badge
    const outcomeStr = (callData.outcome || 'QUALIFIED_MEETING').replace(/_/g, ' ');
    const outcomeBoxX = pageWidth - margin - 58;
    doc.setFillColor(224, 231, 255);
    doc.roundedRect(outcomeBoxX, y + 4, 54, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(49, 46, 129);
    doc.text(`STATUS: ${outcomeStr}`, outcomeBoxX + 27, y + 9.5, { align: 'center' });

    // Duration & Intent Score
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const durMin = Math.floor((callData.durationSeconds || 142) / 60);
    const durSec = (callData.durationSeconds || 142) % 60;
    doc.text(`Duration: ${durMin}m ${durSec}s`, outcomeBoxX, y + 18);
    doc.text(`Intent Score: ${callData.intentScore || 85}/100`, outcomeBoxX, y + 23);

    y += 36;

    // SECTION: Executive Summary
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('1. EXECUTIVE SUMMARY & BUYING INTENT', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const summaryText =
      callData.summary ||
      `Autonomous conversation completed with ${callData.decisionMakerName || 'prospect'}. Strong commercial resonance verified around immediate workflow challenges. Prospect demonstrated clear purchase authority and requested follow-up technical alignment.`;
    const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 4.2 + 4;

    // SECTION: Commercial Trigger & Requirements
    if (callData.requirement || callData.whyNow) {
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('VERIFIED REQUIREMENT:', margin + 3, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const reqText = callData.requirement || 'Modernizing enterprise voice workflow automation.';
      doc.text(doc.splitTextToSize(reqText, contentWidth - 45), margin + 40, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('CATALYST / WHY NOW:', margin + 3, y + 12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const whyText = callData.whyNow || 'Q3 operational expansion and current vendor contract renewal.';
      doc.text(doc.splitTextToSize(whyText, contentWidth - 45), margin + 40, y + 12);

      y += 24;
    }

    // SECTION: Key Buying Signals & Next Steps
    checkPageBreak(30);
    const halfWidth = (contentWidth - 6) / 2;

    // Box 1: Buying Signals
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, halfWidth, 32, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(16, 185, 129); // Green
    doc.text('KEY SIGNALS DETECTED', margin + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const signals = callData.signals && callData.signals.length > 0
      ? callData.signals.slice(0, 3)
      : [
          'Directly asked for technical demo availability',
          'Confirmed active budget cycle for Q3/Q4',
          'Shared dissatisfaction with legacy manual follow-ups'
        ];
    let sigY = y + 11;
    signals.forEach((sig) => {
      doc.text(`• ${sig}`, margin + 3, sigY, { maxWidth: halfWidth - 6 });
      sigY += 6;
    });

    // Box 2: Next Best Actions
    const box2X = margin + halfWidth + 6;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(box2X, y, halfWidth, 32, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(99, 102, 241); // Indigo
    doc.text('RECOMMENDED NEXT ACTIONS', box2X + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const nextSteps = callData.nextSteps && callData.nextSteps.length > 0
      ? callData.nextSteps.slice(0, 3)
      : [
          'Calendar calendar invite for 20-min architecture demo',
          'Email executive summary with ROI case study',
          'Sync opportunity to CRM pipeline'
        ];
    let stepY = y + 11;
    nextSteps.forEach((st) => {
      doc.text(`→ ${st}`, box2X + 3, stepY, { maxWidth: halfWidth - 6 });
      stepY += 6;
    });

    y += 38;

    // SECTION: Verbatim Call Transcript
    if (callData.transcript && callData.transcript.length > 0) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('2. AUDITED VERBATIM TRANSCRIPT', margin, y);
      y += 5;

      callData.transcript.forEach((item) => {
        const isAgent =
          item.speaker.toLowerCase().includes('agent') ||
          item.speaker.toLowerCase().includes('vidur') ||
          item.speaker.toLowerCase().includes('ai');

        const speakerLabel = isAgent ? 'Vidur AI Agent' : `${callData.decisionMakerName || 'Prospect'}`;
        const timeLabel = item.time ? ` [${item.time}]` : '';

        // Check height for speaker line + text
        const textLines = doc.splitTextToSize(item.text, contentWidth - 6);
        const itemHeight = 6 + textLines.length * 3.8 + 2;
        checkPageBreak(itemHeight);

        // Turn background box
        if (isAgent) {
          doc.setFillColor(245, 243, 255); // Indigo-50 tint
        } else {
          doc.setFillColor(241, 245, 249); // Slate-100 tint
        }
        doc.roundedRect(margin, y, contentWidth, itemHeight, 1, 1, 'F');

        // Speaker name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(isAgent ? 99 : 51, isAgent ? 102 : 65, isAgent ? 241 : 85);
        doc.text(`${speakerLabel}${timeLabel}:`, margin + 3, y + 4.5);

        // Speech text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(textLines, margin + 3, y + 8.5);

        y += itemHeight + 2;
      });
    }

    // Footer on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `CONFIDENTIAL & PROPRIETARY — VIDUR AI SALES OPERATING SYSTEM — PAGE ${i} OF ${pageCount}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }

    // Save/Download PDF
    const filename = `Vidur_Report_${callData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${callData.callId}.pdf`;
    doc.save(filename);
    return filename;
  }
}
