import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  subtext?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  trend,
  trendDirection = 'up',
  subtext,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition shadow-lg ${
        onClick ? 'cursor-pointer hover:border-slate-700 hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl border ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendDirection === 'up'
                ? 'text-emerald-400 bg-emerald-500/10'
                : trendDirection === 'down'
                ? 'text-rose-400 bg-rose-500/10'
                : 'text-slate-400 bg-slate-800'
            }`}
          >
            {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-black text-white tracking-tight">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
        {subtext && <p className="text-[11px] text-slate-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};
