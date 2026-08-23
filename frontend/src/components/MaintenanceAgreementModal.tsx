import React, { useState } from 'react';
import { Award, ShieldCheck, Check, X, Copy, CheckCircle2, DollarSign, Calendar, Sparkles, FileText } from 'lucide-react';

interface MaintenanceAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerPhone?: string;
  equipmentSummary?: string;
}

export const MaintenanceAgreementModal: React.FC<MaintenanceAgreementModalProps> = ({
  isOpen,
  onClose,
  customerName = 'Valued Customer',
  customerPhone = '(555) 234-5678',
  equipmentSummary = 'Central HVAC & Heating System',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'silver' | 'gold' | 'platinum'>('gold');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [copied, setCopied] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  if (!isOpen) return null;

  const plans = {
    silver: {
      name: 'Silver Seasonal Care',
      monthlyPrice: 19,
      annualPrice: 199,
      badge: 'Essential Coverage',
      color: 'border-slate-600',
      features: [
        '2 Comprehensive seasonal tune-ups / yr (Spring AC + Fall Heating)',
        '21-Point mechanical & electrical safety inspection',
        'Standard 5% discount on all repairs & replacement parts',
        'Priority scheduling window within 48 hours',
      ],
    },
    gold: {
      name: 'Gold Priority Club',
      monthlyPrice: 29,
      annualPrice: 299,
      badge: 'Most Popular ★',
      color: 'border-emerald-500 bg-emerald-500/10',
      features: [
        '2 Comprehensive seasonal tune-ups / yr with coil wash',
        '15% Discount on all repairs, diagnostic fees & parts',
        'Guaranteed same-day emergency dispatch priority',
        'No overtime or weekend dispatch surcharges',
        'Extended 2-year labor warranty on all repairs',
      ],
    },
    platinum: {
      name: 'Platinum 24/7 Total Shield',
      monthlyPrice: 49,
      annualPrice: 499,
      badge: 'Zero-Downtime Guarantee',
      color: 'border-purple-500',
      features: [
        'Unlimited seasonal tune-ups & multi-zone airflow audits',
        '20% Discount on all repairs + $500 annual equipment replacement accrual',
        '24/7 365 Immediate VIP priority emergency response',
        'Zero diagnostic dispatch fees ($119 value per call)',
        'Lifetime warranty on all contractor-installed parts',
        'Complimentary MERV-11 high efficiency filter replacements',
      ],
    },
  };

  const currentPlan = plans[selectedPlan];
  const price = billingCycle === 'annual' ? `$${currentPlan.annualPrice} / year` : `$${currentPlan.monthlyPrice} / month`;

  const handleCopyProposal = () => {
    const proposal = `EchoDesk Preventative Maintenance Agreement (PMA) Proposal\nCustomer: ${customerName} | Equipment: ${equipmentSummary}\nSelected Plan: ${currentPlan.name} (${price})\n\nBenefits Included:\n${currentPlan.features.map((f) => `• ${f}`).join('\n')}\n\nTerms: Pre-authorized agreement with automatic recurring renewal. Cancel anytime with 30 days notice.`;
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Preventative Maintenance Agreement (PMA)</h2>
              <p className="text-xs text-slate-400">Generate recurring service memberships & warranty proposals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg transition font-semibold ${
                billingCycle === 'monthly' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/40">SAVE 15%</span>
            </button>
          </div>
        </div>

        {/* Plan Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(plans) as (keyof typeof plans)[]).map((key) => {
            const p = plans[key];
            const isSel = selectedPlan === key;
            const pPrice = billingCycle === 'annual' ? `$${p.annualPrice}/yr` : `$${p.monthlyPrice}/mo`;

            return (
              <div
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                  isSel ? 'border-emerald-500 bg-slate-950 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-black text-white font-mono">{pPrice}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-850 space-y-1.5">
                  {p.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Agreement Status Banner */}
        {enrolled && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Customer successfully enrolled in {currentPlan.name} ({price})!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopyProposal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Copied Proposal!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Agreement Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setEnrolled(true);
              setTimeout(onClose, 1200);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Enroll Customer & Authorize PMA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
