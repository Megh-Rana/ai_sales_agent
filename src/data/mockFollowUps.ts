import { FollowUpItem } from '../types/followUp';

export interface ExtendedFollowUpItem extends FollowUpItem {
  phone?: string;
  companyDomain?: string;
  industry?: string;
  intentScore: number;
  dealValue?: string;
  campaignName?: string;
  suggestedPitch?: string;
  previousInteraction?: string;
  timingLabel: 'DUE_NOW' | 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING' | 'WAITING';
}

export const mockFollowUpDataset: ExtendedFollowUpItem[] = [
  {
    id: 'fu-101',
    leadId: 'lead-1',
    companyName: 'Acme Logistics',
    contactName: 'Rahul Shah',
    contactRole: 'VP of Fleet Operations',
    phone: '+91 98765 43210',
    companyDomain: 'acmelogistics.in',
    industry: 'Logistics & Supply Chain',
    intentScore: 94,
    dealValue: '₹48.5L',
    campaignName: 'Q3 High-Intent Requirement Surge',
    actionType: 'SEND_PRICING',
    title: 'Deliver Custom Telematics Tier-1 Pricing Proposal',
    date: '2026-09-13',
    time: '14:30',
    priority: 'HIGH',
    status: 'RECOMMENDED',
    owner: 'Priya Sharma',
    reason: 'Prospect reviewed telematics proposal 45 mins ago during AI Voice Call session.',
    timingLabel: 'DUE_NOW',
    suggestedPitch:
      'Hi Rahul, following up on our call regarding Acme Logistics 450-fleet upgrade. I have prepared the tiered enterprise pricing proposal with custom API integration modules.',
    previousInteraction: 'AI Voice Call completed (Sentiment: Highly Receptive, BANT Qualified).',
    createdAt: '2026-09-13T09:15:00Z',
  },
  {
    id: 'fu-102',
    leadId: 'lead-2',
    companyName: 'Apex HealthTech',
    contactName: 'Dr. Ananya Rao',
    contactRole: 'Chief Technology Officer',
    phone: '+91 98234 56789',
    companyDomain: 'apexhealth.co.in',
    industry: 'Healthcare Technology',
    intentScore: 88,
    dealValue: '₹35.0L',
    campaignName: 'SaaS Expansion Cadence',
    actionType: 'SCHEDULE_DEMO',
    title: 'Confirm Architecture Walkthrough with CTO & Security Team',
    date: '2026-09-13',
    time: '16:00',
    priority: 'HIGH',
    status: 'RECOMMENDED',
    owner: 'Amit Patel',
    reason: 'CTO requested HIPAA/NDHM compliance architectural diagram during outbound call.',
    timingLabel: 'DUE_TODAY',
    suggestedPitch:
      'Dr. Ananya, our lead solution architect is ready to walk through Vidur OS security compliance documentation for Apex HealthTech patient triage systems.',
    previousInteraction: 'AI Voice Call completed (Requested compliance documentation).',
    createdAt: '2026-09-13T10:00:00Z',
  },
  {
    id: 'fu-103',
    leadId: 'lead-3',
    companyName: 'Zenith FinTech',
    contactName: 'Vikram Malhotra',
    contactRole: 'Head of Business Development',
    phone: '+91 97112 34567',
    companyDomain: 'zenithfin.io',
    industry: 'Financial Services',
    intentScore: 79,
    dealValue: '₹28.0L',
    campaignName: 'Q3 High-Intent Requirement Surge',
    actionType: 'CALL_AGAIN',
    title: 'Re-engage Key Decision Maker Post-Board Evaluation',
    date: '2026-09-14',
    time: '11:00',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    owner: 'Priya Sharma',
    reason: 'Board evaluation completed yesterday. Trigger follow-up call to lock Q4 rollout.',
    timingLabel: 'UPCOMING',
    suggestedPitch:
      'Hi Vikram, checking in following Zenith FinTech internal strategy review. Were there any technical questions regarding our automated sales dispatch system?',
    previousInteraction: 'Email Proposal Sent 2 days ago (Status: Opened 4x).',
    createdAt: '2026-09-12T14:20:00Z',
  },
  {
    id: 'fu-104',
    leadId: 'lead-4',
    companyName: 'Bharat Commerce',
    contactName: 'Sneha Gupta',
    contactRole: 'VP E-Commerce Growth',
    phone: '+91 99887 65432',
    companyDomain: 'bharatcommerce.com',
    industry: 'E-Commerce & Retail',
    intentScore: 72,
    dealValue: '₹18.0L',
    campaignName: 'Win-Back Churned Prospects',
    actionType: 'SEND_FOLLOW_UP',
    title: 'Awaiting Executive Confirmation on Pilot Scope',
    date: '2026-09-15',
    time: '15:00',
    priority: 'LOW',
    status: 'SCHEDULED',
    owner: 'Rohan Mehta',
    reason: 'Outbound proposal delivered. Prospect requested 48 hours for executive review.',
    timingLabel: 'WAITING',
    suggestedPitch:
      'Hi Sneha, checking if your team had a chance to review the 30-day pilot proposal for Bharat Commerce checkout optimization.',
    previousInteraction: 'Follow-up Email Sent (Waiting for reply).',
    createdAt: '2026-09-11T16:45:00Z',
  },
];
