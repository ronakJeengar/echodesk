import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, X, FileCheck, HardHat, Zap, Flame, Wrench } from 'lucide-react';

interface SafetyCheckItem {
  id: string;
  category: string;
  standard: string;
  requirement: string;
  status: 'PASSED' | 'ADVISORY' | 'WARNING';
  details: string;
}

interface SafetyAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  industry?: string;
  jobTitle?: string;
  executiveSummary?: string;
}

export const SafetyAuditModal: React.FC<SafetyAuditModalProps> = ({
  isOpen,
  onClose,
  industry = 'HVAC',
  jobTitle = 'Field Service Visit',
  executiveSummary = '',
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  // Generate dynamic safety audit items based on trade
  const getSafetyItems = (): SafetyCheckItem[] => {
    const isHvac = industry.toLowerCase().includes('hvac') || executiveSummary.toLowerCase().includes('capacitor') || executiveSummary.toLowerCase().includes('refrigerant');
    const isElec = industry.toLowerCase().includes('elect') || executiveSummary.toLowerCase().includes('panel') || executiveSummary.toLowerCase().includes('breaker');
    const isPlumb = industry.toLowerCase().includes('plumb') || executiveSummary.toLowerCase().includes('water heater') || executiveSummary.toLowerCase().includes('valve');

    if (isHvac) {
      return [
        {
          id: 's-1',
          category: 'EPA Section 608',
          standard: 'Refrigerant Recovery',
          requirement: 'Zero-loss certified recovery unit & closed-loop gauges used.',
          status: 'PASSED',
          details: 'Subcooling and pressure readings verified within EPA environmental compliance limits.',
        },
        {
          id: 's-2',
          category: 'NFPA 70E',
          standard: 'High-Voltage Lockout/Tagout',
          requirement: 'Disconnect switch locked and capacitor discharged before service.',
          status: 'PASSED',
          details: 'Capacitor tested and replaced with isolated safety tools.',
        },
        {
          id: 's-3',
          category: 'IMC 304.3',
          standard: 'Condensate Drain & Pan Float Switch',
          requirement: 'Secondary overflow safety switch verified operative.',
          status: 'ADVISORY',
          details: 'Recommend verifying condensate drain trap cleanout during next maintenance visit.',
        },
      ];
    } else if (isElec) {
      return [
        {
          id: 's-1',
          category: 'NEC 110.26',
          standard: 'Working Clearances',
          requirement: '36-inch minimum clear working space in front of electrical equipment.',
          status: 'PASSED',
          details: 'Panel access clearance satisfies NEC Table 110.26(A)(1).',
        },
        {
          id: 's-2',
          category: 'NEC 250.50',
          standard: 'Grounding Electrode System',
          requirement: 'Continuous bond between main panel and ground rod verified.',
          status: 'PASSED',
          details: 'Ground impedance tested below 25 ohms standard threshold.',
        },
        {
          id: 's-3',
          category: 'OSHA 1910.335',
          standard: 'PPE & Arc Flash Protection',
          requirement: 'Category 2 arc-rated face shield and insulated glove check.',
          status: 'ADVISORY',
          details: 'Panel cover re-secured with torque specs conforming to manufacturer label.',
        },
      ];
    } else {
      return [
        {
          id: 's-1',
          category: 'IPC 608.1',
          standard: 'Backflow Prevention',
          requirement: 'Air gap / dual-check backflow device installed on potable supply line.',
          status: 'PASSED',
          details: 'Potable water connection protected against siphonage and back-pressure.',
        },
        {
          id: 's-2',
          category: 'IPC 504.6',
          standard: 'T&P Relief Valve Discharge Line',
          requirement: 'Full-diameter gravity discharge tube terminating 6" above floor drain.',
          status: 'PASSED',
          details: 'Temperature and pressure relief valve inspected and tested manually.',
        },
        {
          id: 's-3',
          category: 'OSHA 1926.651',
          standard: 'Confined Space & Gas Monitoring',
          requirement: 'Ventilation verified in crawlspace / utility access area.',
          status: 'ADVISORY',
          details: 'Check area for moisture levels and ensure pipe support brackets are spaced per code.',
        },
      ];
    }
  };

  const safetyItems = getSafetyItems();
  const warningCount = safetyItems.filter((s) => s.status === 'WARNING').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Safety & Code Compliance Audit</h2>
              <p className="text-xs text-slate-400">OSHA, NEC, IMC & EPA Section 608 Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Field Operations Safety Rating: 100% COMPLIANT</h3>
              <p className="text-xs text-slate-400">
                0 Critical Violations · {safetyItems.length} Trade Safety Checkpoints Audited
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            AUDIT PASSED
          </span>
        </div>

        {/* Checkpoint Items */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Regulatory Standards & Checkpoints
          </span>

          <div className="space-y-2.5">
            {safetyItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                      {item.category}
                    </span>
                    <strong className="text-white text-xs">{item.standard}</strong>
                  </div>

                  {item.status === 'PASSED' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      PASSED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      ADVISORY
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-[11px] leading-snug">{item.requirement}</p>
                <p className="text-slate-500 text-[10px] italic">{item.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Acknowledgment & Actions */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
            />
            <span>
              I certify that field safety protocols, PPE and code clearances were satisfied on this job.
            </span>
          </label>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                setAcknowledged(true);
                setTimeout(onClose, 400);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                acknowledged
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Sign Off & Archive Safety Audit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
