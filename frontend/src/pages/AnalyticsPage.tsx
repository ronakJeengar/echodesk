import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics } from '../lib/api';
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  BarChart3,
  Flame,
  Zap,
  Wrench,
  Home,
  Hammer,
  RefreshCw,
  Download,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['workspace-analytics'],
    queryFn: fetchAnalytics,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm font-medium">Aggregating Financial & Trade Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-400 text-sm">Failed to load analytics.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium text-white transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, tradeBreakdown, topParts, revenueTrends } = data;
  const maxRevenue = Math.max(...revenueTrends.map((t) => t.revenue), 100);

  const getTradeIcon = (trade: string) => {
    switch (trade) {
      case 'HVAC':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Electrical':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Plumbing':
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      case 'Inspection':
        return <Home className="w-4 h-4 text-indigo-400" />;
      default:
        return <Hammer className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('echodesk_token');
    fetch('/api/v1/jobs/export/csv', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `echodesk-financials-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Financial Intelligence & Trade Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time revenue metrics, field labor averages, and material inventory demand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Quoted Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            ${kpis.totalQuotedRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            Extracted from on-site voice quotes
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Job Value</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            ${kpis.averageJobValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Across all scheduled work orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Field Labor</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{kpis.averageLaborHours} hrs</p>
          <p className="text-[11px] text-slate-400 font-medium">Per on-site diagnostic service call</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Task Completion</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{kpis.taskCompletionRate}%</p>
          <p className="text-[11px] text-amber-400 font-medium">
            {kpis.activeJobsCount} active work orders in flight
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Velocity Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Weekly Revenue Velocity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily quoted volume from field technician voice recordings
              </p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-2 px-4 border-b border-slate-800">
            {revenueTrends.map((item, idx) => {
              const heightPercent = Math.max(12, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition text-[11px] font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 shadow-md">
                    ${item.revenue.toLocaleString()}
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-800 rounded-t-xl overflow-hidden flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-xl group-hover:brightness-125 transition-all duration-300"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-300">{item.period}</p>
                    <p className="text-[10px] text-slate-500">{item.jobs} jobs</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume by Trade */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              Volume by Trade
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across field specializations</p>
          </div>

          <div className="space-y-4 my-auto">
            {tradeBreakdown.map((trade) => (
              <div key={trade.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    {getTradeIcon(trade.name)}
                    {trade.name}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {trade.count} jobs ({trade.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${Math.max(5, trade.percentage)}%` }}
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-cyan-300 leading-relaxed">
            💡 AI Domain Vocabulary engine automatically adapts model prompting per trade category.
          </div>
        </div>
      </div>

      {/* Top Materials & Parts Inventory Table */}
      {topParts.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                Top Extracted Materials & Parts Inventory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Frequently replaced items and diagnostic hardware extracted from technician voice notes
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl font-bold">Material / Equipment</th>
                  <th className="py-3 px-4 font-bold">Units Deployed</th>
                  <th className="py-3 px-4 font-bold">Avg Unit Cost</th>
                  <th className="py-3 px-4 rounded-r-xl font-bold text-right">Total Revenue Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-medium">
                {topParts.map((part, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 text-white font-semibold flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      {part.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">{part.quantity} pcs</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      ${part.quantity > 0 ? (part.totalCost / part.quantity).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ${part.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
