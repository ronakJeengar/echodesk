import React, { useState } from 'react';
import { Globe, MapPin, Truck, CheckCircle2, Copy, Send, ExternalLink, X, Shield, Phone, CreditCard, Download, UserCheck } from 'lucide-react';

interface CustomerPortalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  jobSummary?: string;
  quotedAmount?: number;
  recordingId?: string;
}

export const CustomerPortalPreviewModal: React.FC<CustomerPortalPreviewModalProps> = ({
  isOpen,
  onClose,
  customerName = 'Sarah Jenkins',
  customerPhone = '(555) 234-5678',
  customerAddress = '742 Evergreen Terrace, Springfield',
  jobSummary = 'Dual-run capacitor replacement & refrigerant level adjustment.',
  quotedAmount = 385.0,
  recordingId = 'rec-101',
}) => {
  const [jobStatus, setJobStatus] = useState<'EN_ROUTE' | 'ON_SITE' | 'COMPLETED'>('COMPLETED');
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!isOpen) return null;

  const portalSlug = `job-${recordingId.substring(0, 8)}-${customerName.toLowerCase().replace(/\s+/g, '-')}`;
  const portalUrl = `https://echodesk.app/portal/${portalSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendSms = () => {
    const text = encodeURIComponent(
      `Hi ${customerName}, track your EchoDesk service visit live, review your technician profile, and view your completed work order invoice here: ${portalUrl}`
    );
    window.open(`sms:${customerPhone}?body=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Customer Self-Service & ETA Tracking Portal</h2>
              <p className="text-xs text-slate-400">Live homeowner link with GPS status, technician bio & instant pay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Switcher (Demo Simulator) */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Live Dispatch ETA Simulator:
          </span>
          <div className="flex items-center gap-1">
            {(['EN_ROUTE', 'ON_SITE', 'COMPLETED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setJobStatus(st)}
                className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                  jobStatus === st
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {st === 'EN_ROUTE' ? '🚗 En Route (12m)' : st === 'ON_SITE' ? '🔧 On-Site' : '✓ Completed'}
              </button>
            ))}
          </div>
        </div>

        {/* Branded Homeowner Portal Viewport */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4 shadow-inner">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-xs">
                ED
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">EchoDesk Field Services</h3>
                <p className="text-[10px] text-slate-400">Licensed & Insured HVAC & Trades</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              VERIFIED WORK ORDER
            </span>
          </div>

          {/* Assigned Technician Bio Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-black font-black text-base shadow-md">
                AM
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">Alex Miller</h4>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40 font-semibold">
                    ★ 4.98 (142 reviews)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Lead HVAC Tech · Lic #HVAC-94821</p>
              </div>
            </div>
            <a
              href="tel:5551234567"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-slate-700"
              title="Call Technician"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Live ETA / Status Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Service Address:</span>
              <span className="font-semibold text-slate-200">{customerAddress}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Work Scope:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[280px]">{jobSummary}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Total Amount Due:</span>
              <span className="text-lg font-black text-emerald-400 font-mono">${quotedAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick Pay Action */}
          <div className="pt-1 flex items-center justify-between">
            {paid ? (
              <div className="w-full p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Invoice Paid Online via Apple Pay / Credit Card!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPaid(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Invoice Online (${quotedAmount.toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Portal Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendSms}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>SMS Portal & ETA Link to Homeowner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
