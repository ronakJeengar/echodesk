import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendInvoiceToCustomer } from '../lib/api';
import { Recording } from '../types';
import { Send, X, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface SendInvoiceModalProps {
  recording: Recording | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SendInvoiceModal: React.FC<SendInvoiceModalProps> = ({
  recording,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'EMAIL' | 'SMS' | 'BOTH'>('EMAIL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (recording) {
      setEmail(recording.customer?.email || recording.extractedData?.customerInfo?.email || '');
      setPhone(recording.customer?.phone || recording.extractedData?.customerInfo?.phone || '');
      setSuccessMessage(null);
    }
  }, [recording]);

  const sendMutation = useMutation({
    mutationFn: (data: { recipientEmail?: string; recipientPhone?: string; deliveryMethod: 'EMAIL' | 'SMS' | 'BOTH' }) => {
      if (!recording) throw new Error('No recording selected');
      return sendInvoiceToCustomer(recording.id, data);
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Invoice sent successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    },
  });

  if (!isOpen || !recording) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMutation.mutate({
      recipientEmail: email.trim() || undefined,
      recipientPhone: phone.trim() || undefined,
      deliveryMethod: method,
    });
  };

  const clientName = recording.customer?.name || recording.extractedData?.customerInfo?.name || 'Customer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Send Invoice to Customer</h2>
              <p className="text-xs text-slate-400">{clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-6 text-center space-y-3 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Dispatched Successfully!</h3>
            <p className="text-xs text-slate-300">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Delivery Method Choice */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('EMAIL')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  method === 'EMAIL'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('SMS')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  method === 'SMS'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('BOTH')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  method === 'BOTH'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>Both</span>
              </button>
            </div>

            {(method === 'EMAIL' || method === 'BOTH') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Customer Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah.jenkins@apex.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {(method === 'SMS' || method === 'BOTH') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Customer Mobile Phone (SMS)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. (555) 019-2834"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {sendMutation.isError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{(sendMutation.error as any)?.message || 'Failed to dispatch invoice.'}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendMutation.isPending || (!email && !phone)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendMutation.isPending ? 'Sending...' : 'Send to Customer'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
