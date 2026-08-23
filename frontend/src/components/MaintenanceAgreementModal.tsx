import React, { useState } from 'react';
import { Award, ShieldCheck, Check, Copy, CheckCircle2, Calendar, Sparkles, FileText } from 'lucide-react';
import { BaseModal } from './BaseModal';

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
        'Free 1-in pleated air filter replacements per visit',
      ],
    },
    platinum: {
      name: 'Platinum Total Peace of Mind',
      monthlyPrice: 49,
      annualPrice: 499,
      badge: 'All-Inclusive Elite',
      color: 'border-cyan-500 bg-cyan-500/10',
      features: [
        '4 Quarterly seasonal precision tune-ups & performance tuning',
        '25% Discount on all parts & complimentary diagnostic fee waiver',
        '2-Hour emergency dispatch VIP response window',
        'Full 1-Year warranty on all replacement parts and labor',
        'Free smart thermostat diagnostics & duct inspection',
      ],
    },
  };

  const activePlan = plans[selectedPlan];
  const price = billingCycle === 'annual' ? activePlan.annualPrice : activePlan.monthlyPrice;

  const agreementText = `========================================================
ECHO DESK PREVENTATIVE SERVICE AGREEMENT (PMA)
========================================================
Contractor: Apex Heating, Cooling & Field Services
Customer: ${customerName} | Phone: ${customerPhone}
Covered Equipment: ${equipmentSummary}
--------------------------------------------------------
Selected Plan: ${activePlan.name.toUpperCase()}
Billing: $${price}/${billingCycle === 'annual' ? 'yr' : 'mo'} (${billingCycle.toUpperCase()})

PLAN INCLUSIONS & GUARANTEES:
${activePlan.features.map((f, i) => `[${i + 1}] ${f}`).join('\n')}

TERMS:
• Renewable annually with 30-day cancellation notice.
• Transferrable to new homeowner upon property sale.
• Priority dispatch applies 24/7/365.
========================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(agreementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Preventative Maintenance Agreement"
      subtitle={`Recurring Service Plan Proposal for ${customerName}`}
      icon={Award}
      iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/30"
      maxWidthClass="max-w-2xl"
    >
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">Billing Interval</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              billingCycle === 'monthly' ? 'bg-emerald-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              billingCycle === 'annual' ? 'bg-emerald-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual</span>
            <span className="text-[9px] bg-black/20 text-black px-1 rounded font-black">SAVE 15%</span>
          </button>
        </div>
      </div>

      {/* Tier Selector Cards */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(plans) as Array<keyof typeof plans>).map((tierKey) => {
          const plan = plans[tierKey];
          const isSelected = selectedPlan === tierKey;
          const tierPrice = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={tierKey}
              onClick={() => setSelectedPlan(tierKey)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {plan.badge}
                </span>
                <h4 className="text-xs font-bold text-white mt-1 leading-tight">{plan.name}</h4>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-black text-white">${tierPrice}</span>
                  <span className="text-[10px] text-slate-400">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tier Coverage & Features */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300">{activePlan.name} Guarantee</span>
          <span className="text-xs font-black text-emerald-400">${price} billed {billingCycle}</span>
        </div>
        <ul className="space-y-1.5 pt-1">
          {activePlan.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition active:scale-95 border border-slate-700"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Agreement Copied!' : 'Copy Proposal Text'}</span>
        </button>

        <button
          onClick={() => setEnrolled(true)}
          disabled={enrolled}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
            enrolled
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] active:scale-95'
          }`}
        >
          {enrolled ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Customer Enrolled in PMA</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Enroll Customer Now</span>
            </>
          )}
        </button>
      </div>
    </BaseModal>
  );
};
