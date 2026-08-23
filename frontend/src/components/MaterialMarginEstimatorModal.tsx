import React, { useState } from 'react';
import { DollarSign, Percent, Plus, Trash2, Copy, CheckCircle2, X, Calculator, ArrowRight, TrendingUp } from 'lucide-react';

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

interface MaterialMarginEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEstimate?: (financials: { partsCost: number; laborCost: number; quotedAmount: number }) => void;
}

export const MaterialMarginEstimatorModal: React.FC<MaterialMarginEstimatorModalProps> = ({
  isOpen,
  onClose,
  onApplyEstimate,
}) => {
  const [items, setItems] = useState<MaterialItem[]>([
    { id: '1', name: '45/5 MFD Dual-Run Capacitor', quantity: 1, unitCost: 35.0 },
    { id: '2', name: 'R-410A Refrigerant (lbs)', quantity: 2, unitCost: 45.0 },
    { id: '3', name: 'Contactor Switch 2-Pole 30A', quantity: 1, unitCost: 28.0 },
  ]);

  const [laborHours, setLaborHours] = useState<number>(2.0);
  const [laborRatePerHour, setLaborRatePerHour] = useState<number>(125.0);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(45.0); // 45% Gross Margin
  const [taxRatePct, setTaxRatePct] = useState<number>(7.5);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: 'New Material / Part', quantity: 1, unitCost: 25.0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof MaterialItem, val: any) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, [field]: val } : i))
    );
  };

  // Calculations
  const totalPartsCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const totalLaborCost = laborHours * laborRatePerHour;
  const directJobCost = totalPartsCost + totalLaborCost;

  // Margin Formula: Price = Cost / (1 - Margin%)
  const marginDecimal = targetMarginPct / 100.0;
  const subtotalWithMargin = marginDecimal < 1.0 ? directJobCost / (1 - marginDecimal) : directJobCost * 1.5;
  const grossProfit = subtotalWithMargin - directJobCost;
  const taxAmount = (subtotalWithMargin * taxRatePct) / 100.0;
  const finalQuotedTotal = subtotalWithMargin + taxAmount;

  const handleCopySummary = () => {
    const summary = `Price Estimate (${targetMarginPct}% Target Margin): Direct Cost: $${directJobCost.toFixed(2)} (Parts: $${totalPartsCost.toFixed(2)}, Labor: $${totalLaborCost.toFixed(2)}) | Gross Profit: $${grossProfit.toFixed(2)} | Subtotal: $${subtotalWithMargin.toFixed(2)} | Tax (${taxRatePct}%): $${taxAmount.toFixed(2)} | Final Quoted Total: $${finalQuotedTotal.toFixed(2)}.`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    onApplyEstimate?.({
      partsCost: totalPartsCost,
      laborCost: totalLaborCost,
      quotedAmount: parseFloat(finalQuotedTotal.toFixed(2)),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Job Scope & Profit Margin Estimator</h2>
              <p className="text-xs text-slate-400">Calculate material markup, labor billing & gross margin pricing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Materials Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Materials & Wholesale Parts List
            </span>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Part</span>
            </button>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                  className="flex-1 bg-transparent text-white font-medium focus:outline-none"
                  placeholder="Part name"
                />

                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Qty:</span>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value, 10) || 1)}
                    className="w-12 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500">$</span>
                  <input
                    type="number"
                    value={item.unitCost}
                    onChange={(e) => handleUpdateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-right text-white font-mono"
                  />
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Labor & Margin Controls */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400">Labor Time (Hours)</span>
            <input
              type="number"
              step="0.5"
              value={laborHours}
              onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <span className="text-slate-400">Hourly Rate ($/hr)</span>
            <input
              type="number"
              value={laborRatePerHour}
              onChange={(e) => setLaborRatePerHour(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <span className="text-slate-400">Target Margin: <strong className="text-emerald-400">{targetMarginPct}%</strong></span>
            <input
              type="range"
              min="20"
              max="65"
              value={targetMarginPct}
              onChange={(e) => setTargetMarginPct(parseFloat(e.target.value))}
              className="w-full mt-2 accent-emerald-500"
            />
          </div>
        </div>

        {/* Financial Profit & Quote Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Direct Cost (Parts ${totalPartsCost.toFixed(2)} + Labor ${totalLaborCost.toFixed(2)}):</span>
            <span className="font-mono text-slate-200">${directJobCost.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Estimated Gross Profit ({targetMarginPct}% Margin):</span>
            <span className="font-mono text-emerald-400 font-bold">+${grossProfit.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Estimated Sales Tax ({taxRatePct}%):</span>
            <span className="font-mono text-slate-300">${taxAmount.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
            <span className="font-bold text-white uppercase">Final Quoted Customer Price:</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">${finalQuotedTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Copied Estimate!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Estimate Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition hover:scale-105 active:scale-95"
          >
            <span>Apply Estimate to Work Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
