import React, { useState } from 'react';
import { MessageSquare, Mail, Copy, CheckCircle2, X, Sparkles, Send, Star, Phone } from 'lucide-react';

interface CustomerFollowUpComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  jobSummary?: string;
  technicianName?: string;
  companyName?: string;
}

export const CustomerFollowUpComposerModal: React.FC<CustomerFollowUpComposerModalProps> = ({
  isOpen,
  onClose,
  customerName,
  customerPhone = '(555) 234-5678',
  customerEmail = 'customer@example.com',
  jobSummary = 'Completed seasonal AC maintenance, replaced 45/5 MFD dual-run capacitor, and verified 12°F subcooling.',
  technicianName = 'Alex Miller',
  companyName = 'Apex Climate & Electric',
}) => {
  const [channel, setChannel] = useState<'SMS' | 'EMAIL'>('SMS');
  const [tone, setTone] = useState<'FRIENDLY' | 'PROFESSIONAL' | 'CONCISE'>('FRIENDLY');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMessage = () => {
    if (channel === 'SMS') {
      if (tone === 'FRIENDLY') {
        return `Hi ${customerName}! 🌟 ${technicianName} from ${companyName} here. Thank you for having us out today! We ${jobSummary.toLowerCase()} Everything is running smoothly. If you have 30 seconds, we'd love your review: https://g.page/r/review/apex`;
      } else if (tone === 'PROFESSIONAL') {
        return `Hello ${customerName}, your service visit with ${companyName} is complete. Summary: ${jobSummary} All components are tested and verified. Please retain this text for your warranty records. Direct support: (555) 019-2831.`;
      } else {
        return `${companyName} Service Update: Work complete for ${customerName}. ${jobSummary} Thank you for your business!`;
      }
    } else {
      const subject = `Service Summary & Warranty Confirmation - ${companyName}`;
      let body = '';
      if (tone === 'FRIENDLY') {
        body = `Dear ${customerName},\n\nThank you for choosing ${companyName}! Our lead technician, ${technicianName}, completed your service call today.\n\nSummary of Service Performed:\n• ${jobSummary}\n\nAll parts installed carry our standard 1-year labor and manufacturer warranty. Please let us know if you need anything else.\n\nWarm regards,\n${technicianName}\n${companyName}`;
      } else if (tone === 'PROFESSIONAL') {
        body = `Attention: ${customerName}\n\nThis email confirms the completion of field operations by ${companyName}.\n\nScope of Work Executed:\n${jobSummary}\n\nInvoice & Payment Ledger:\nAll recorded items have been synchronized with your account statement. For technical inquiries or warranty assistance, contact dispatch at support@apexclimate.com.\n\nSincerely,\nField Operations Team\n${companyName}`;
      } else {
        body = `Hi ${customerName},\n\nService is complete: ${jobSummary}.\n\nThank you for partnering with ${companyName}.\n\nBest,\n${companyName}`;
      }
      return { subject, body };
    }
  };

  const messageData = generateMessage();
  const messageText = typeof messageData === 'string' ? messageData : messageData.body;
  const emailSubject = typeof messageData === 'object' ? messageData.subject : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(typeof messageData === 'string' ? messageData : `Subject: ${emailSubject}\n\n${messageText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLaunch = () => {
    if (channel === 'SMS') {
      window.open(`sms:${customerPhone}?body=${encodeURIComponent(messageText)}`, '_blank');
    } else {
      window.open(`mailto:${customerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(messageText)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Post-Service Follow-Up Composer</h2>
              <p className="text-xs text-slate-400">Generate personalized SMS or Email debriefs for {customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel & Tone Selectors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Delivery Channel:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setChannel('SMS')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  channel === 'SMS'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SMS Text Message</span>
              </button>

              <button
                onClick={() => setChannel('EMAIL')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  channel === 'EMAIL'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Draft</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">AI Tone:</span>
            <div className="flex gap-1.5">
              {(['FRIENDLY', 'PROFESSIONAL', 'CONCISE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    tone === t
                      ? 'bg-slate-700 text-white border border-slate-500'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'FRIENDLY' ? '🌟 Friendly & Warm' : t === 'PROFESSIONAL' ? '💼 Professional' : '⚡ Concise'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-2">
          {channel === 'EMAIL' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-500">Subject: </span>
              <span className="text-white font-semibold">{emailSubject}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-850">
              <span>To: <strong className="text-slate-200">{channel === 'SMS' ? customerPhone : customerEmail}</strong></span>
              {channel === 'SMS' && (
                <span className="font-mono text-[10px] text-emerald-400">
                  {messageText.length} chars ({(messageText.length / 160).toFixed(1)} segments)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {messageText}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Draft</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Launch {channel === 'SMS' ? 'SMS Messenger' : 'Email Client'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
