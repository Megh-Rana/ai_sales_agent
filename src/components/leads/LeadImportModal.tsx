import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  GitMerge,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  dataBackboneService,
  CRMConnectionStatusModel,
  LeadImportResponseModel,
  DuplicateLeadDetailModel,
} from '../../services/dataBackboneService';

export interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (count: number) => void;
}

export const LeadImportModal: React.FC<LeadImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeSource, setActiveSource] = useState<'hubspot' | 'csv'>('hubspot');
  const [crmStatus, setCrmStatus] = useState<CRMConnectionStatusModel | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<LeadImportResponseModel | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importLimit, setImportLimit] = useState<number>(20);

  // Duplicate resolution state: record identifier -> 'merge' | 'skip'
  const [resolutions, setResolutions] = useState<Record<string, 'merge' | 'skip'>>({});
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionSuccess, setResolutionSuccess] = useState<string | null>(null);

  // Load CRM connection status
  useEffect(() => {
    if (isOpen) {
      loadCRMStatus();
      setImportResult(null);
      setResolutionSuccess(null);
      setSelectedFile(null);
    }
  }, [isOpen]);

  const loadCRMStatus = async () => {
    const status = await dataBackboneService.getCRMStatus('hubspot');
    setCrmStatus(status);
  };

  const handleConnectCRM = async () => {
    setIsConnecting(true);
    try {
      const updated = await dataBackboneService.connectCRM('hubspot');
      setCrmStatus(updated);
    } finally {
      setIsConnecting(false);
    }
  };

  // Perform CRM Import
  const handleCRMImport = async () => {
    setIsImporting(true);
    setResolutionSuccess(null);
    try {
      const res = await dataBackboneService.importCRMLeads(
        '22222222-2222-2222-2222-222222222222',
        'hubspot',
        importLimit
      );
      setImportResult(res);

      // Initialize default resolution to 'merge' for all duplicates
      if (res.duplicates && res.duplicates.length > 0) {
        const initialResolutions: Record<string, 'merge' | 'skip'> = {};
        res.duplicates.forEach((d) => {
          const key = d.company_name || d.contact_email || 'unknown';
          initialResolutions[key] = 'merge';
        });
        setResolutions(initialResolutions);
      } else if (res.created > 0 && onImportSuccess) {
        onImportSuccess(res.created);
      }
    } finally {
      setIsImporting(false);
    }
  };

  // Perform CSV Upload
  const handleCSVUpload = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setResolutionSuccess(null);
    try {
      const res = await dataBackboneService.uploadLeadsCSV(
        '22222222-2222-2222-2222-222222222222',
        selectedFile
      );
      setImportResult(res);

      if (res.duplicates && res.duplicates.length > 0) {
        const initialResolutions: Record<string, 'merge' | 'skip'> = {};
        res.duplicates.forEach((d) => {
          const key = d.company_name || d.contact_email || 'unknown';
          initialResolutions[key] = 'merge';
        });
        setResolutions(initialResolutions);
      } else if (res.created > 0 && onImportSuccess) {
        onImportSuccess(res.created);
      }
    } finally {
      setIsImporting(false);
    }
  };

  // Set resolution choice for a duplicate record
  const handleSetResolution = (recordKey: string, choice: 'merge' | 'skip') => {
    setResolutions((prev) => ({
      ...prev,
      [recordKey]: choice,
    }));
  };

  const handleSetAllResolutions = (choice: 'merge' | 'skip') => {
    if (!importResult?.duplicates) return;
    const updated: Record<string, 'merge' | 'skip'> = {};
    importResult.duplicates.forEach((d) => {
      const key = d.company_name || d.contact_email || 'unknown';
      updated[key] = choice;
    });
    setResolutions(updated);
  };

  // Submit Interactive Duplicate Resolutions
  const handleApplyResolutions = async () => {
    if (!importResult?.duplicates || importResult.duplicates.length === 0) return;
    setIsResolving(true);
    try {
      const res = await dataBackboneService.resolveDuplicates(
        '22222222-2222-2222-2222-222222222222',
        resolutions,
        importResult.duplicates
      );

      const mergedCount = res.merged || Object.values(resolutions).filter((v) => v === 'merge').length;
      const skippedCount = res.skipped || Object.values(resolutions).filter((v) => v === 'skip').length;

      setResolutionSuccess(
        `Duplicate resolution finalized: ${mergedCount} record(s) merged into existing database profiles, ${skippedCount} skipped.`
      );

      // Clear duplicate table once resolved
      setImportResult((prev) =>
        prev
          ? {
              ...prev,
              merged: (prev.merged || 0) + mergedCount,
              skipped: (prev.skipped || 0) + skippedCount,
              duplicates: [],
            }
          : null
      );

      if (onImportSuccess) {
        onImportSuccess((importResult?.created || 0) + mergedCount);
      }
    } finally {
      setIsResolving(false);
    }
  };

  const hasDuplicates = importResult && importResult.duplicates && importResult.duplicates.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary border border-primary/25">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Import Leads & Contacts</h2>
            <p className="text-xs text-foreground-tertiary">
              Route CRM & CSV records through unified validation and deduplication
            </p>
          </div>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-5 pt-2">
        {/* Source Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-surface-1 rounded-xl border border-border-subtle">
          <button
            type="button"
            onClick={() => {
              setActiveSource('hubspot');
              setImportResult(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeSource === 'hubspot'
                ? 'bg-surface-elevated text-primary shadow-sm border border-primary/30'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            <Layers className="w-4 h-4 text-[#ff7a59]" />
            <span>HubSpot CRM Connector</span>
            {crmStatus?.connected && (
              <span className="w-2 h-2 rounded-full bg-signal-qualified animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSource('csv');
              setImportResult(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeSource === 'csv'
                ? 'bg-surface-elevated text-primary shadow-sm border border-primary/30'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Bulk CSV Spreadsheet</span>
          </button>
        </div>

        {/* Tab 1: HubSpot CRM Ingestion */}
        {activeSource === 'hubspot' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-foreground">HubSpot OAuth2 Pipeline</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-signal-qualified/15 text-signal-qualified border border-signal-qualified/30">
                    <ShieldCheck className="w-3 h-3" />
                    Live Bi-directional Sync Active
                  </span>
                </div>
                <div className="text-xs text-foreground-secondary">
                  Portal: <span className="font-mono text-foreground">{crmStatus?.portal_id || 'hubspot-portal-9941'}</span> · Account: {crmStatus?.account_name || 'Enterprise Sandbox'}
                </div>
              </div>

              {!crmStatus?.connected ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleConnectCRM}
                  isLoading={isConnecting}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Authorize CRM
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={loadCRMStatus}
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                >
                  Refresh Connection
                </Button>
              )}
            </div>

            {/* Import options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">Import Contact Quantity</div>
                  <div className="text-[11px] text-foreground-tertiary">Max contacts to pull from HubSpot sandbox</div>
                </div>
                <select
                  value={importLimit}
                  onChange={(e) => setImportLimit(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-1 border border-border-subtle text-xs text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value={5}>5 contacts</option>
                  <option value={20}>20 contacts</option>
                  <option value={50}>50 contacts</option>
                </select>
              </div>

              <Button
                variant="primary"
                className="w-full h-full min-h-[44px]"
                onClick={handleCRMImport}
                isLoading={isImporting}
                leftIcon={<RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />}
              >
                {isImporting ? 'Ingesting...' : 'Pull Leads from CRM'}
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: CSV Upload */}
        {activeSource === 'csv' && (
          <div className="space-y-4">
            <div
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center gap-3 transition-colors ${
                selectedFile ? 'border-primary/50 bg-primary/5' : 'border-border-subtle bg-surface-1 hover:border-border'
              }`}
            >
              <FileSpreadsheet className="w-8 h-8 text-foreground-tertiary" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {selectedFile ? selectedFile.name : 'Select or drop your CSV lead list'}
                </p>
                <p className="text-[11px] text-foreground-tertiary mt-0.5">
                  Headers supported: company_name, contact_name, contact_email, contact_phone, requirement, intent_score
                </p>
              </div>

              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => document.getElementById('csv-file-input')?.click()}
                >
                  Choose File
                </Button>
                {selectedFile && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleCSVUpload}
                    isLoading={isImporting}
                    leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                  >
                    Upload & Ingest
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Import Results Metric Summary Cards */}
        {importResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle text-center">
                <div className="text-[11px] text-foreground-tertiary">Processed</div>
                <div className="text-lg font-bold font-mono text-foreground">{importResult.total_rows}</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-1 border border-signal-qualified/30 text-center">
                <div className="text-[11px] text-signal-qualified">Created</div>
                <div className="text-lg font-bold font-mono text-signal-qualified">{importResult.created}</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-1 border border-amber-500/30 text-center">
                <div className="text-[11px] text-amber-400">Duplicates</div>
                <div className="text-lg font-bold font-mono text-amber-400">
                  {importResult.duplicates?.length || importResult.skipped || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle text-center">
                <div className="text-[11px] text-foreground-tertiary">Merged</div>
                <div className="text-lg font-bold font-mono text-primary">{importResult.merged || 0}</div>
              </div>
            </div>

            {/* Rejection / Validation Errors Alert */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-signal-urgent/10 border border-signal-urgent/30 text-xs text-signal-urgent space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  {importResult.errors.length} Malformed Row(s) Rejected by Strict Validator:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-signal-urgent/90">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx}>
                      {err.row ? `Row ${err.row}: ` : ''}{err.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Success Banner after duplicate resolution */}
        {resolutionSuccess && (
          <div className="p-3 rounded-xl bg-signal-qualified/10 border border-signal-qualified/30 text-xs text-signal-qualified flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resolutionSuccess}</span>
          </div>
        )}

        {/* INTERACTIVE DUPLICATE RESOLUTION SECTION */}
        {hasDuplicates && (
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-foreground">
                    Interactive Duplicate Resolution ({importResult.duplicates.length} records flagged)
                  </span>
                </div>
                <p className="text-[11px] text-foreground-tertiary">
                  Choose how to handle each existing record: Merge incoming enrichments or Skip.
                </p>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleSetAllResolutions('merge')}
                  className="px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-[10px] font-semibold transition-colors flex items-center gap-1"
                >
                  <GitMerge className="w-3 h-3" />
                  Merge All
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllResolutions('skip')}
                  className="px-2 py-1 rounded bg-surface-2 hover:bg-surface-hover text-foreground-secondary text-[10px] font-semibold transition-colors flex items-center gap-1"
                >
                  <EyeOff className="w-3 h-3" />
                  Skip All
                </button>
              </div>
            </div>

            {/* Duplicates List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {importResult.duplicates.map((dup: DuplicateLeadDetailModel, idx: number) => {
                const key = dup.company_name || dup.contact_email || `item-${idx}`;
                const currentChoice = resolutions[key] || 'merge';

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-1 border border-border-subtle hover:border-border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">{dup.company_name}</span>
                        {dup.contact_name && (
                          <span className="text-foreground-secondary text-[11px]">
                            ({dup.contact_name})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground-tertiary">
                        {dup.contact_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {dup.contact_email}
                          </span>
                        )}
                        {dup.contact_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {dup.contact_phone}
                          </span>
                        )}
                        <span className="text-amber-400 font-medium">
                          Reason: {dup.conflict_reason}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Choice Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetResolution(key, 'merge')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          currentChoice === 'merge'
                            ? 'bg-primary text-white font-semibold shadow-sm'
                            : 'bg-surface-2 text-foreground-secondary hover:text-foreground border border-border-subtle'
                        }`}
                      >
                        <GitMerge className="w-3 h-3" />
                        <span>Merge</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetResolution(key, 'skip')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          currentChoice === 'skip'
                            ? 'bg-signal-urgent/20 text-signal-urgent font-semibold border border-signal-urgent/40'
                            : 'bg-surface-2 text-foreground-secondary hover:text-foreground border border-border-subtle'
                        }`}
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Skip</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apply Action */}
            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyResolutions}
                isLoading={isResolving}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Apply Resolutions ({importResult.duplicates.length} records)
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
