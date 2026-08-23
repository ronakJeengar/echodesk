import React, { useState } from 'react';
import { Globe, MapPin, Truck, CheckCircle2, Copy, Send, ExternalLink, Shield, Phone, CreditCard, Download, UserCheck } from 'lucide-react';
import { BaseModal } from './BaseModal';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Live Service Portal"
      subtitle="White-labeled client tracking & payment portal link"
      icon={Globe}
      iconColorClass="text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
      maxWidthClass="max-w-2xl"
    >
      {/* Shareable Link Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-slate-300 font-mono truncate">{portalUrl}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition active:scale-95"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
          </button>
          <button
            onClick={handleSendSms}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-black transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Interactive Status Simulation */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2">Simulate Live Service Status</label>
        <div className="grid grid-cols-3 gap-2">
          {(['EN_ROUTE', 'ON_SITE', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setJobStatus(status)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                jobStatus === status
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status === 'EN_ROUTE' && '🚚 En Route'}
              {status === 'ON_SITE' && '🔧 On-Site Working'}
              {status === 'COMPLETED' && '✅ Job Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Mobile Mockup Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
        {/* Mock Top Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white tracking-wide">Apex Heating & Air</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">SECURE LINK</span>
        </div>

        {/* Live Service ETA Card */}
        <div className="p-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Live Service Status</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  jobStatus === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                {jobStatus === 'EN_ROUTE' ? 'Arriving in 14 mins' : jobStatus === 'ON_SITE' ? 'In Progress' : 'Work Complete'}
              </span>
            </div>

            <div className="flex items-start gap-3 mt-3 pt-3 border-t border-slate-800">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                AM
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white">Alex Miller</p>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400">Master HVAC Specialist · EPA Universal Certified</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-emerald-400 font-semibold">★ 4.98 (142 reviews)</span>
                  <a
                    href="tel:5550192834"
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Phone className="w-2.5 h-2.5" /> Call Tech
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Job & Invoice Details */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Customer</span>
              <span className="font-semibold text-white">{customerName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Service Location</span>
              <span className="font-medium text-slate-300 text-right truncate max-w-[220px]">{customerAddress}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Scope of Work</span>
              <span className="font-medium text-slate-300 text-right truncate max-w-[220px]">{jobSummary}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-white">Total Service Charge</span>
              <span className="text-sm font-black text-emerald-400">${quotedAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Simulated Online Pay / PDF Action */}
          <div className="flex gap-2">
            <button
              onClick={() => setPaid(true)}
              disabled={paid}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                paid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] active:scale-95'
              }`}
            >
              {paid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Invoice Paid via Card ($385.00)</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Work Order Online</span>
                </>
              )}
            </button>

            <button
              onClick={() => alert(`Downloading Work Order PDF for ${customerName}`)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
