import React from 'react';
import { Recording } from '../types';
import { printWorkOrderPdf } from '../lib/pdf';
import { X, Printer, FileText, CheckCircle2, DollarSign, Wrench, Package, CalendarCheck, User } from 'lucide-react';

interface WorkOrderPdfModalProps {
  recording: Recording | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkOrderPdfModal: React.FC<WorkOrderPdfModalProps> = ({
  recording,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !recording) return null;

  const data = recording.extractedData;
  const customerName = recording.customer?.name || data?.customerInfo?.name || 'Customer';
  const customerCompany = recording.customer?.companyName || data?.customerInfo?.companyName || '';
  const customerPhone = recording.customer?.phone || data?.customerInfo?.phone || 'N/A';
  const customerAddress = recording.customer?.address || data?.customerInfo?.address || 'N/A';

  const invoiceNo = `WO-${recording.id.replace('rec-', '').toUpperCase()}`;
  const dateStr = new Date(recording.recordedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    printWorkOrderPdf(recording);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Work Order & Diagnostic Invoice</h2>
              <p className="text-xs text-slate-400">{invoiceNo} • Generated from Voice AI</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper Card Preview */}
        <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-inner space-y-6 text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Pro HVAC Solutions</h1>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
                Field Operations & Work Order Invoice
              </p>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                ⚡ Extracted & Synced via EchoDesk Voice AI
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-black text-slate-900">{invoiceNo}</span>
              <p className="text-xs text-slate-600 mt-1">Date: {dateStr}</p>
              <p className="text-xs text-slate-600">Technician: Dave Miller</p>
            </div>
          </div>

          {/* Customer Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Client Information
              </p>
              <p className="font-bold text-slate-900 text-base">
                {customerName} {customerCompany && `(${customerCompany})`}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{customerAddress}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Contact & Status
              </p>
              <p className="text-xs font-mono font-bold text-slate-800">{customerPhone}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                COMPLETED
              </span>
            </div>
          </div>

          {/* Diagnostic & Service Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              Diagnostic & Service Summary
            </h3>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs leading-relaxed text-slate-700">
              {data?.executiveSummary || recording.rawTranscript || 'Field diagnosis logged.'}
            </div>
          </div>

          {/* Itemized Parts */}
          {data?.partsAndServices && data.partsAndServices.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Itemized Materials & Parts Used
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.partsAndServices.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium">{p.name}</td>
                        <td className="p-2.5 text-center">{p.quantity}</td>
                        <td className="p-2.5 text-right font-mono">${p.unitCost.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          ${(p.totalCost || p.unitCost * p.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Breakdown */}
          {data?.financials && (
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs text-slate-700">
                {data.financials.laborCost && (
                  <div className="flex justify-between">
                    <span>Labor & Diagnostics:</span>
                    <span className="font-mono">${data.financials.laborCost.toFixed(2)}</span>
                  </div>
                )}
                {data.financials.partsCost && (
                  <div className="flex justify-between">
                    <span>Materials & Parts:</span>
                    <span className="font-mono">${data.financials.partsCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-300 font-black text-sm text-slate-900">
                  <span>TOTAL DUE:</span>
                  <span className="text-lg font-mono text-emerald-700">
                    ${data.financials.quotedAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Follow-ups */}
          {data?.actionItems && data.actionItems.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Scheduled Follow-Ups & Next Steps
              </h3>
              <div className="space-y-1.5">
                {data.actionItems.map((a, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium flex items-center justify-between"
                  >
                    <span>• {a.title}</span>
                    <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-200">
                      {a.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="flex justify-between pt-8 mt-6 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="w-48 border-t border-slate-400 pt-1 text-center">
              Technician Signature (Dave Miller)
            </div>
            <div className="w-48 border-t border-slate-400 pt-1 text-center">
              Customer Acceptance Signature
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Work Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
