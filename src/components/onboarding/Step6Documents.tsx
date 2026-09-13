import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  FileCode,
  Paperclip,
} from 'lucide-react';
import { KnowledgeDocument } from '../../types/onboarding';

export interface Step6DocumentsProps {
  documents: KnowledgeDocument[];
  onChange: (docs: KnowledgeDocument[]) => void;
  errors: Record<string, string>;
}

export const Step6Documents: React.FC<Step6DocumentsProps> = ({
  documents,
  onChange,
  errors,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-signal-urgent" />;
    if (ext === 'xlsx' || ext === 'csv' || ext === 'xls')
      return <FileSpreadsheet className="w-5 h-5 text-signal-qualified" />;
    if (ext === 'pptx' || ext === 'ppt')
      return <FileText className="w-5 h-5 text-signal-high" />;
    return <FileCode className="w-5 h-5 text-primary" />;
  };

  const inferCategory = (fileName: string): KnowledgeDocument['category'] => {
    const lower = fileName.toLowerCase();
    if (lower.includes('price') || lower.includes('pricing') || lower.includes('roi'))
      return 'pricing';
    if (lower.includes('deck') || lower.includes('presentation') || lower.includes('pitch'))
      return 'presentation';
    if (lower.includes('faq') || lower.includes('objection')) return 'faq';
    if (lower.includes('brochure') || lower.includes('spec')) return 'brochure';
    return 'documentation';
  };

  // Mock Upload Simulation Handler
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDocs: KnowledgeDocument[] = Array.from(files).map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      sizeBytes: file.size,
      type: file.type || 'application/octet-stream',
      category: inferCategory(file.name),
      uploadProgress: 20,
      status: 'uploading',
      uploadedAt: 'Just now',
    }));

    const updated = [...documents, ...newDocs];
    onChange(updated);

    // Simulate progressive upload finishing in 800ms
    setTimeout(() => {
      onChange(
        updated.map((d) => ({
          ...d,
          uploadProgress: 100,
          status: 'ready',
        }))
      );
    }, 900);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    onChange(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-h3 font-bold text-foreground tracking-tight">
              Knowledge Base & Sales Collateral
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-elevated text-foreground-tertiary border border-border-subtle">
              Optional
            </span>
          </div>
          <p className="text-body text-foreground-secondary leading-relaxed">
            Upload product brochures, pricing sheets, case studies, or objection handbooks to ground your AI agent.
          </p>
        </div>

        {documents.length === 0 && (
          <button
            type="button"
            onClick={() => {
              onChange([
                {
                  id: 'sample-doc-1',
                  name: 'Enterprise_Solution_Overview_Deck.pdf',
                  sizeBytes: 3840000,
                  type: 'application/pdf',
                  category: 'presentation',
                  uploadProgress: 100,
                  status: 'ready',
                  uploadedAt: 'Just now',
                },
                {
                  id: 'sample-doc-2',
                  name: 'Pricing_and_ROI_Model_2026.xlsx',
                  sizeBytes: 980000,
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  category: 'pricing',
                  uploadProgress: 100,
                  status: 'ready',
                  uploadedAt: 'Just now',
                },
              ]);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-surface-1 text-primary border border-primary/30 hover:bg-surface-elevated transition-colors shrink-0 font-medium self-start sm:self-auto"
          >
            + Attach Sample Collateral
          </button>
        )}
      </div>

      {/* Accessible Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-xl transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-primary bg-primary-muted/20 scale-[0.99]'
            : 'border-border-default hover:border-primary/60 bg-surface-1/40 hover:bg-surface-1/70'
        }`}
      >
        <div className="p-3 rounded-full bg-surface-elevated text-primary border border-border-subtle shadow-xs">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div className="space-y-1 max-w-sm">
          <div className="text-body font-semibold text-foreground">
            Click to browse or drag and drop files
          </div>
          <p className="text-caption text-foreground-tertiary">
            Supports PDF, DOCX, XLSX, PPTX, or TXT up to 25MB each.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.docx,.xlsx,.xls,.pptx,.txt,.csv"
          onChange={(e) => handleFilesAdded(e.target.files)}
        />
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-foreground-tertiary px-1">
            <span>Attached Knowledge Sources ({documents.length})</span>
            <span>RAG Vectorization Status</span>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 bg-surface-1 border border-border-default rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                {/* File Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-2 rounded-lg bg-surface-elevated shrink-0 border border-border-subtle">
                    {getFileIcon(doc.name)}
                  </span>

                  <div className="min-w-0 space-y-0.5">
                    <div className="font-semibold text-foreground truncate max-w-md">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-foreground-tertiary flex items-center gap-2">
                      <span className="font-mono">{formatFileSize(doc.sizeBytes)}</span>
                      <span>·</span>
                      <span className="capitalize font-mono text-primary bg-primary-muted px-1.5 py-0.2 rounded border border-primary/20 text-[10px]">
                        {doc.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {doc.status === 'uploading' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary animate-pulse"
                          style={{ width: `${doc.uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-primary">Ingesting...</span>
                    </div>
                  ) : doc.status === 'ready' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-signal-qualified font-semibold bg-signal-qualified-muted px-2 py-0.5 rounded border border-signal-qualified/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Indexed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-signal-urgent font-semibold bg-signal-urgent-muted px-2 py-0.5 rounded border border-signal-urgent/30">
                      <AlertCircle className="w-3 h-3" />
                      Failed
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(doc.id)}
                    className="text-foreground-tertiary hover:text-signal-urgent transition-colors p-1.5 rounded hover:bg-surface-elevated"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-surface-1/40 border border-border-subtle text-caption text-foreground-tertiary flex items-center gap-2.5">
          <Paperclip className="w-4 h-4 text-foreground-tertiary shrink-0" />
          <span>
            No documents uploaded yet. You can proceed without collateral; your agent will rely on Steps 1–5 and can be enriched with additional files later in Workspace Settings.
          </span>
        </div>
      )}
    </div>
  );
};
