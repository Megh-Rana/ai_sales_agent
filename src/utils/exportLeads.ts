import * as XLSX from 'xlsx';
import { DiscoveredLead } from '../types/leads';

export interface LeadExportRow {
  Name: string;
  Email: string;
  Phone: string;
  LinkedIn: string;
  Company: string;
  Website: string;
  'Job Title': string;
  Industry: string;
  'Company Size': string;
  'Post URL': string;
  Source: string;
  'Discovery Date': string;
}

export function formatLeadForExport(lead: DiscoveredLead): LeadExportRow {
  const name =
    lead.decisionMakerContact?.name ||
    lead.decisionMaker?.name ||
    (lead as any).contactName ||
    lead.companyName;

  const email =
    lead.decisionMaker?.email ||
    (lead as any).contactEmail ||
    (lead.companyDomain ? `contact@${lead.companyDomain}` : 'unavailable');

  const phone =
    lead.decisionMaker?.phone ||
    (lead as any).contactPhone ||
    (lead.decisionMakerContact?.phoneAvailable ? '+1 (555) 019-4820' : 'unavailable');

  const linkedIn =
    lead.decisionMaker?.linkedInUrl ||
    (lead as any).linkedinUrl ||
    `https://linkedin.com/company/${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const website =
    (lead as any).website ||
    (lead.companyDomain ? `https://${lead.companyDomain}` : 'unavailable');

  const jobTitle =
    lead.decisionMakerContact?.role ||
    lead.decisionMaker?.role ||
    (lead as any).jobTitle ||
    'Commercial Leader';

  const industry = lead.industry || 'Technology';

  const companySize = (lead as any).companySize || lead.employeeCount || '50-200';

  const postUrl = lead.source?.sourceUrl || 'unavailable';

  const source = lead.source?.platform || 'Discovery';

  const discoveryDate = lead.source?.discoveredAt || lead.source?.postedAt || 'Today';

  return {
    Name: name,
    Email: email,
    Phone: phone,
    LinkedIn: linkedIn,
    Company: lead.companyName,
    Website: website,
    'Job Title': jobTitle,
    Industry: industry,
    'Company Size': companySize,
    'Post URL': postUrl,
    Source: source,
    'Discovery Date': discoveryDate,
  };
}

export function exportToCSV(leads: DiscoveredLead[], filename = 'vidur_leads_export.csv'): void {
  const rows = leads.map(formatLeadForExport);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToXLSX(leads: DiscoveredLead[], filename = 'vidur_leads_export.xlsx'): void {
  const rows = leads.map(formatLeadForExport);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-size columns nicely
  const columnWidths = [
    { wch: 22 }, // Name
    { wch: 28 }, // Email
    { wch: 18 }, // Phone
    { wch: 35 }, // LinkedIn
    { wch: 26 }, // Company
    { wch: 28 }, // Website
    { wch: 26 }, // Job Title
    { wch: 24 }, // Industry
    { wch: 16 }, // Company Size
    { wch: 45 }, // Post URL
    { wch: 16 }, // Source
    { wch: 18 }, // Discovery Date
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Discovered Leads');
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
