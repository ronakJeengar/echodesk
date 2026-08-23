import React, { useState } from 'react';
import { ExtractedData, Recording } from '../types';
import { printWorkOrderPdf } from '../lib/pdf';
import { SendInvoiceModal } from './SendInvoiceModal';
import { SignatureCaptureModal } from './SignatureCaptureModal';
import { CustomerFollowUpComposerModal } from './CustomerFollowUpComposerModal';
import { SafetyAuditModal } from './SafetyAuditModal';
import { MaterialMarginEstimatorModal } from './MaterialMarginEstimatorModal';
import {
  User,
  Wrench,
  Package,
  DollarSign,
  CalendarCheck,
  Sparkles,
  Edit3,
  Printer,
  FileText,
  Send,
  PenTool,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  HardHat,
  TrendingUp
} from 'lucide-react';

interface EntityInspectorProps {
  extractedData?: ExtractedData;
  recordingId: string;
  recording?: Recording;
  onReExtract: (promptAdjustment: string) => Promise<void>;
  isLoading?: boolean;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({
  extractedData,
  recordingId,
  recording,
  onReExtract,
  isLoading,
}) => {
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isSafetyAuditOpen, setIsSafetyAuditOpen] = useState(false);
  const [isMarginEstimatorOpen, setIsMarginEstimatorOpen] = useState(false);
  const [signedBy, setSignedBy] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!extractedData) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 text-center py-12">
        <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2 animate-pulse" />
        <p className="text-sm text-slate-400">Extracting structured CRM entities...</p>
      </div>
    );
  }

  const handlePrintPdf = () => {
    const recToPrint: Recording = recording || {
      id: recordingId,
      workspaceId: '',
      audioUrl: '',
      audioDurationSec: 45.0,
      audioFormat: 'm4a',
      fileSizeBytes: 1048576,
      status: 'COMPLETED',
      wordTimestamps: [],
      extractedData,
      recordedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    printWorkOrderPdf(recToPrint);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsSubmitting(true);
    try {
      await onReExtract(promptText);
      setIsAdjustOpen(false);
      setPromptText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sentimentColors = {
    POSITIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    NEUTRAL: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
    NEGATIVE: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    URGENT: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Extracted CRM Entities</h2>
            <p className="text-xs text-slate-400">Structured data synced with PostgreSQL CRM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${sentimentColors[extractedData.sentiment] || sentimentColors.NEUTRAL}`}>
            {extractedData.sentiment}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            {(extractedData.confidenceScore * 100).toFixed(0)}% MATCH
          </span>
        </div>
      </div>

      {/* 1. Customer Card */}
      {extractedData.customerInfo && (
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <User className="w-4 h-4 text-emerald-400" />
            Customer Identified
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-white">
                {extractedData.customerInfo.name || 'Unknown Client'}
              </p>
              {extractedData.customerInfo.companyName && (
                <p className="text-xs text-slate-400">{extractedData.customerInfo.companyName}</p>
              )}
            </div>
            {extractedData.customerInfo.phone && (
              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">
                {extractedData.customerInfo.phone}
              </span>
            )}
          </div>
          {extractedData.customerInfo.address && (
            <p className="text-xs text-slate-400 mt-2">{extractedData.customerInfo.address}</p>
          )}
        </div>
      )}

      {/* 2. Executive Work Summary */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          Executive Work Summary & Diagnostic
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {extractedData.executiveSummary}
        </p>
      </div>

      {/* 3. Materials & Parts Used */}
      {extractedData.partsAndServices?.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Package className="w-4 h-4 text-amber-400" />
            Materials & Parts Used ({extractedData.partsAndServices.length})
          </div>
          <div className="divide-y divide-slate-800/60">
            {extractedData.partsAndServices.map((part, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                <span className="text-slate-200">
                  <span className="font-semibold text-emerald-400 mr-2">{part.quantity}x</span>
                  {part.name}
                </span>
                <span className="font-mono text-slate-300">
                  ${(part.totalCost || part.unitCost * part.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Financials */}
      {extractedData.financials && (
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Financial Breakdown
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {extractedData.financials.paymentMethod.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-emerald-400">
                ${extractedData.financials.quotedAmount.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 ml-2">Total Quoted</span>
            </div>
            <div className="text-xs text-slate-400 space-x-3">
              {extractedData.financials.laborCost && (
                <span>Labor: ${extractedData.financials.laborCost.toFixed(2)}</span>
              )}
              {extractedData.financials.partsCost && (
                <span>Parts: ${extractedData.financials.partsCost.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Action Items & Scheduled Tasks */}
      {extractedData.actionItems?.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <CalendarCheck className="w-4 h-4 text-blue-400" />
            Scheduled Action Items ({extractedData.actionItems.length})
          </div>
          <div className="space-y-2">
            {extractedData.actionItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  )}
                  {item.dueDate && (
                    <p className="text-xs font-mono text-emerald-400 mt-1">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions: Send to Customer, Digital Signature, PDF Export & AI Correction */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={() => setIsSendModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
        >
          <Send className="w-4 h-4" />
          Send Invoice to Customer (Email / SMS)
        </button>

        <button
          onClick={() => setIsSignatureOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold text-xs border border-cyan-500/30 transition"
        >
          {signedBy ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Signed & Approved by {signedBy}</span>
            </>
          ) : (
            <>
              <PenTool className="w-4 h-4" />
              <span>Sign & Authorize Work Order (Draw On-Screen)</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsMarginEstimatorOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Margin & Scope Estimator
          </button>

          <button
            onClick={() => setIsSafetyAuditOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Safety & Code Audit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsFollowUpOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            AI Follow-Up Message
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
          >
            <Printer className="w-4 h-4" />
            Print Work Order PDF
          </button>
        </div>

        <button
          onClick={() => setIsAdjustOpen(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-750 transition"
        >
          <Edit3 className="w-4 h-4 text-emerald-400" />
          AI Prompt Extraction Correction
        </button>
      </div>

      {/* Job Scope & Material Margin Estimator Modal */}
      <MaterialMarginEstimatorModal
        isOpen={isMarginEstimatorOpen}
        onClose={() => setIsMarginEstimatorOpen(false)}
        onApplyEstimate={(fin) => {
          if (extractedData.financials) {
            extractedData.financials.quotedAmount = fin.quotedAmount;
            extractedData.financials.laborCost = fin.laborCost;
            extractedData.financials.partsCost = fin.partsCost;
          }
        }}
      />

      {/* AI Safety & Code Compliance Audit Modal */}
      <SafetyAuditModal
        isOpen={isSafetyAuditOpen}
        onClose={() => setIsSafetyAuditOpen(false)}
        executiveSummary={extractedData.executiveSummary}
      />

      {/* AI Post-Service Follow-Up Composer Modal */}
      <CustomerFollowUpComposerModal
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        customerName={extractedData.customerInfo?.name || 'Customer'}
        customerPhone={extractedData.customerInfo?.phone || '(555) 234-5678'}
        jobSummary={extractedData.executiveSummary}
      />

      {/* Digital Signature Capture Modal */}
      <SignatureCaptureModal
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        initialSignerName={extractedData.customerInfo?.name}
        onSigned={(_dataUrl, name, role) => {
          setSignedBy(`${name} (${role})`);
        }}
      />

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        recording={
          recording || {
            id: recordingId,
            workspaceId: '',
            audioUrl: '',
            audioDurationSec: 45.0,
            audioFormat: 'm4a',
            fileSizeBytes: 1048576,
            status: 'COMPLETED',
            wordTimestamps: [],
            extractedData,
            recordedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />

      {/* Prompt Adjustment Modal */}
      {isAdjustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel-glow bg-slate-900 p-6 rounded-2xl max-w-md w-full border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Adjust AI Extraction</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Instruct the AI what to change (e.g. &quot;The labor quoted is 2 hours at $160 total&quot; or &quot;Customer is Apex Logistics&quot;).
            </p>

            <form onSubmit={handleAdjustSubmit}>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter adjustment instruction..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !promptText.trim()}
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Re-extracting...' : 'Re-Extract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
