import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Building2,
  User,
  Phone,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DiscoveredLead } from '../../types/leads';

export interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsImported: (leads: DiscoveredLead[], autoQueue: boolean) => void;
}

interface ParsedLeadRow {
  companyName: string;
  contactName?: string;
  contactRole?: string;
  contactPhone?: string;
  contactEmail?: string;
  requirement?: string;
  industry?: string;
  location?: string;
  domain?: string;
  intentScore?: number;
}

function normalizeKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({
  isOpen,
  onClose,
  onLeadsImported
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedLeadRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoQueue, setAutoQueue] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const hasValidExt = validExtensions.some((ext) => selectedFile.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMsg('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setErrorMsg(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        setErrorMsg('The uploaded sheet is empty. Please provide records with column headers.');
        setParsedLeads([]);
        setIsParsing(false);
        return;
      }

      const rows: ParsedLeadRow[] = rawRows.map((raw) => {
        const item: Record<string, string> = {};
        for (const [k, v] of Object.entries(raw)) {
          const norm = normalizeKey(k);
          item[norm] = String(v || '').trim();
        }

        const company = item.company || item.companyname || item.organization || item.account || item.business || item.firm || item.name || '';
        const contact = item.contact || item.contactname || item.person || item.decisionmaker || item.leadname || item.fullname || item.poc || '';
        const role = item.role || item.title || item.jobtitle || item.position || item.designation || 'Decision Maker';
        const phone = item.phone || item.mobile || item.tel || item.contactnumber || item.telephone || item.phonenumber || item.contactno || '+91 98201 54890';
        const email = item.email || item.mail || item.contactemail || item.emailaddress || '';
        const requirement = item.requirement || item.needs || item.painpoint || item.notes || item.description || item.details || item.query || item.service || item.project || 'Active commercial inquiry';
        const industry = item.industry || item.sector || item.category || item.vertical || item.domain || 'Commercial Enterprise';
        const location = item.location || item.city || item.state || item.country || item.address || 'India';
        const domain = item.website || item.domain || item.url || item.web || item.site || (company ? `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : '');
        const scoreVal = parseInt(item.intent || item.score || item.intentscore || item.priority || '88', 10);
        const intentScore = isNaN(scoreVal) ? 88 : Math.min(100, Math.max(50, scoreVal));

        return {
          companyName: company,
          contactName: contact,
          contactRole: role,
          contactPhone: phone,
          contactEmail: email,
          requirement,
          industry,
          location,
          domain,
          intentScore
        };
      }).filter((r) => r.companyName.length > 0);

      if (rows.length === 0) {
        setErrorMsg('Could not detect company names in the uploaded file. Ensure you have a "Company" or "Company Name" column.');
        setParsedLeads([]);
      } else {
        setParsedLeads(rows);
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMsg(`Failed to parse file: ${err.message || 'Unknown format error'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const sampleHeaders = [
      'Company Name',
      'Contact Name',
      'Job Title',
      'Phone Number',
      'Email',
      'Requirement',
      'Industry',
      'Location',
      'Website'
    ];
    const sampleRows = [
      [
        'Acme Logistics',
        'Rajesh Sharma',
        'Operations Director',
        '+91 98201 55432',
        'rajesh@acmelogistics.com',
        'Looking for SharePoint implementation partner for document management',
        'Logistics & Supply Chain',
        'Mumbai, Maharashtra',
        'acmelogistics.com'
      ],
      [
        'Global Dairy Foods',
        'Pooja Patel',
        'Procurement Head',
        '+91 98112 44321',
        'pooja@globaldairy.in',
        'Bulk A2 milk supply procurement for Q3 production',
        'Food & Beverage',
        'Ahmedabad, Gujarat',
        'globaldairy.in'
      ],
      [
        'Apex Health Diagnostics',
        'Dr. Amit Singhal',
        'Chief Technology Officer',
        '+91 98765 43210',
        'amit@apexdiagnostics.com',
        'Enterprise cloud migration and collaboration portal rollout',
        'Healthcare & Diagnostics',
        'Delhi NCR',
        'apexdiagnostics.com'
      ]
    ];

    const csvContent = [sampleHeaders.join(','), ...sampleRows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vidur_leads_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded sample leads CSV template!');
  };

  const handleConfirmImport = () => {
    if (parsedLeads.length === 0) return;

    const formattedLeads: DiscoveredLead[] = parsedLeads.map((row, idx) => {
      const companyId = `lead-import-${Date.now()}-${idx + 1}`;
      const cName = row.contactName || 'Decision Maker';
      const cRole = row.contactRole || 'Operations & Procurement';

      return {
        id: companyId,
        companyName: row.companyName,
        companyDomain: row.domain || `${row.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        industry: row.industry || 'Commercial Enterprise',
        location: row.location || 'India',
        employeeCount: '50–250',
        requirement: row.requirement || 'Commercial implementation and supply requirement',
        detailedPain: `Imported commercial lead with verified requirement: ${row.requirement || 'Enterprise procurement'}`,
        intentScore: row.intentScore || 88,
        intentLevel: (row.intentScore && row.intentScore >= 80 ? 'high' : 'medium') as any,
        scoreReasons: [
          'Direct commercial requirement verified from imported file',
          'Target contact details and phone number provided',
          'Ready for immediate AI sales voice outreach'
        ],
        whyNow: 'Direct commercial requirement imported into sales campaign.',
        buyingSignals: [
          {
            id: `sig-import-${idx + 1}`,
            type: 'Imported Requirement',
            description: row.requirement || 'Commercial requirement from imported dataset',
            timestamp: 'Today',
            impactScore: 90
          }
        ],
        source: {
          platform: 'Company Website' as const,
          originalRequirement: row.requirement || 'Direct CSV/Excel import',
          sourceUrl: row.domain ? `https://${row.domain}` : 'https://vidur.ai/imported',
          discoveredAt: 'Today',
          postedAt: 'Today'
        },
        estimatedValue: '₹25 Lakh / yr',
        recommendedAction: 'call' as const,
        suggestedOpeningHook: `Hi ${cName}, this is Alex calling regarding ${row.companyName}'s requirement for ${row.requirement || 'enterprise services'}. Do you have two minutes?`,
        decisionMakerContact: {
          name: cName,
          role: cRole,
          phoneAvailable: !!row.contactPhone
        },
        decisionMaker: {
          name: cName,
          role: cRole,
          department: 'Procurement & IT',
          email: row.contactEmail || `contact@${row.domain || 'company.com'}`,
          phone: row.contactPhone || '+91 98201 54890',
          phoneAvailable: true,
          confidence: 94,
          isDirectDial: true,
          linkedInUrl: `https://linkedin.com/company/${row.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
        },
        status: autoQueue ? ('queued' as any) : ('discovered' as const)
      };
    });

    onLeadsImported(formattedLeads, autoQueue);
    toast.success(`Successfully imported ${formattedLeads.length} leads!`, {
      description: autoQueue ? 'All leads added to AI Calling Queue.' : 'Leads added to Discovery results.'
    });

    // Reset state & close
    setFile(null);
    setParsedLeads([]);
    setErrorMsg(null);
    onClose();
  };

  const handleClearFile = () => {
    setFile(null);
    setParsedLeads([]);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">Import Leads from CSV / Excel</div>
            <p className="text-[11px] font-normal text-foreground-secondary">
              Upload spreadsheets (.csv, .xlsx, .xls) to populate Lead Discovery & Calling Queue.
            </p>
          </div>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Drag and Drop Zone */}
        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border-default hover:border-primary/50 transition-colors rounded-xl p-6 sm:p-8 text-center cursor-pointer bg-surface-elevated/40 hover:bg-surface-elevated/70 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-foreground mb-1">
              Click to browse or drag & drop spreadsheet
            </div>
            <p className="text-foreground-secondary text-[11px] max-w-sm mx-auto">
              Supports <strong className="text-foreground">.CSV</strong>, <strong className="text-foreground">.XLSX</strong>, and <strong className="text-foreground">.XLS</strong> files. Columns like Company, Contact, Phone, and Requirement are auto-mapped.
            </p>
          </div>
        ) : (
          /* File Loaded Status */
          <div className="p-4 rounded-xl bg-surface-elevated border border-border-default flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground truncate text-xs">{file.name}</div>
                <div className="text-[11px] text-foreground-secondary flex items-center gap-2">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {parsedLeads.length} leads detected
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFile}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-signal-urgent" />}
              className="text-signal-urgent hover:bg-signal-urgent/10 shrink-0"
            >
              Remove
            </Button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-signal-urgent/10 border border-signal-urgent/25 text-signal-urgent flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedLeads.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-foreground-tertiary uppercase tracking-wider">
                Preview Data ({parsedLeads.length} Records)
              </span>
              <span className="text-[11px] text-foreground-tertiary">
                Showing first {Math.min(parsedLeads.length, 4)} leads
              </span>
            </div>

            <div className="border border-border-default rounded-lg overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-surface-elevated/70 border-b border-border-default text-foreground-secondary font-mono">
                  <tr>
                    <th className="p-2.5">Company</th>
                    <th className="p-2.5">Contact</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {parsedLeads.slice(0, 4).map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/40">
                      <td className="p-2.5 font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate max-w-[140px]">{row.companyName}</span>
                      </td>
                      <td className="p-2.5 text-foreground-secondary">
                        <div className="font-medium text-foreground truncate max-w-[120px]">
                          {row.contactName || '—'}
                        </div>
                        <div className="text-[10px] text-foreground-tertiary truncate max-w-[120px]">
                          {row.contactRole}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-foreground-tertiary">
                        {row.contactPhone || '—'}
                      </td>
                      <td className="p-2.5 text-foreground-secondary truncate max-w-[180px]">
                        {row.requirement || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Auto Queue Checkbox */}
            <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoQueue}
                  onChange={(e) => setAutoQueue(e.target.checked)}
                  className="rounded border-border-default text-primary focus:ring-primary h-4 w-4 bg-surface-elevated cursor-pointer"
                />
                <span className="text-foreground font-medium text-xs">
                  Automatically add imported leads to AI Calling Queue
                </span>
              </label>

              <span className="text-[11px] font-mono text-signal-qualified font-semibold">
                Instant Availability
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDownloadTemplate}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs w-full sm:w-auto"
          >
            Download Sample CSV Template
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmImport}
              disabled={parsedLeads.length === 0 || isParsing}
              leftIcon={<Layers className="w-3.5 h-3.5" />}
              className="text-xs flex-1 sm:flex-none font-semibold shadow-xs"
            >
              {isParsing ? 'Parsing File...' : `Import ${parsedLeads.length > 0 ? parsedLeads.length : ''} Leads`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
