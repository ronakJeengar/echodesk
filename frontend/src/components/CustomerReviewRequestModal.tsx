import React, { useState } from 'react';
import { Star, QrCode, Send, Copy, CheckCircle2, X, MessageSquare, ExternalLink, ThumbsUp } from 'lucide-react';

interface CustomerReviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceCompleted?: string;
}

export const CustomerReviewRequestModal: React.FC<CustomerReviewRequestModalProps> = ({
  isOpen,
  onClose,
  customerName = 'Valued Customer',
  customerPhone = '(555) 234-5678',
  customerEmail = 'customer@example.com',
  serviceCompleted = 'HVAC Heating & Cooling Service',
}) => {
  const [platform, setPlatform] = useState<'Google' | 'Yelp' | 'Trustpilot'>('Google');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const reviewUrls = {
    Google: 'https://g.page/r/echodesk-service/review',
    Yelp: 'https://www.yelp.com/biz/echodesk-field-service',
    Trustpilot: 'https://www.trustpilot.com/evaluate/echodesk.com',
  };

  const activeUrl = reviewUrls[platform];

  const reviewMessage = `Hi ${customerName}, thank you for choosing EchoDesk for your ${serviceCompleted}! If you were satisfied with our service today, could you take 30 seconds to leave us a 5-star review on ${platform}? It helps our local team tremendously: ${activeUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendSms = () => {
    const encoded = encodeURIComponent(reviewMessage);
    window.open(`sms:${customerPhone}?body=${encoded}`, '_blank');
    setStatusMsg('SMS review invitation dispatched to customer!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`EchoDesk Service Experience - We'd love your feedback!`);
    const body = encodeURIComponent(reviewMessage);
    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank');
    setStatusMsg('Email review invitation prepared!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Generate QR code URL using standard QR server API
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeUrl)}&bgcolor=111726&color=10B981`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-amber-400 border border-amber-500/30">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">5-Star Review & Feedback Engine</h2>
              <p className="text-xs text-slate-400">Generate on-screen QR codes & SMS review invitations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector */}
        <div className="grid grid-cols-3 gap-2">
          {(['Google', 'Yelp', 'Trustpilot'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                platform === p
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${platform === p ? 'fill-emerald-400' : ''}`} />
              <span>{p} Reviews</span>
            </button>
          ))}
        </div>

        {/* QR Code & Direct Scan View */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-2 bg-slate-900 border border-emerald-500/30 rounded-2xl flex flex-col items-center">
            <img
              src={qrCodeImageUrl}
              alt="Scan to Review"
              className="w-32 h-32 rounded-xl object-contain"
            />
            <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <QrCode className="w-3 h-3" />
              Scan with Phone Camera
            </span>
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-400 font-bold text-xs">
              <ThumbsUp className="w-4 h-4" />
              <span>Instant On-Site Homeowner Review</span>
            </div>
            <p className="text-xs text-slate-300">
              Hold phone camera up to the QR code to open our direct <strong>{platform}</strong> 5-star review page with pre-selected ratings.
            </p>
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-semibold"
            >
              <span>{activeUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Message Preview */}
        <div className="space-y-1.5 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">
            SMS / Email Invitation Copy
          </span>
          <textarea
            rows={3}
            value={reviewMessage}
            readOnly
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none resize-none font-sans"
          />
        </div>

        {statusMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendSms}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
            <span>Send SMS</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Email</span>
          </button>
        </div>
      </div>
    </div>
  );
};
