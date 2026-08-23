import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStats, fetchRecordings } from '../lib/api';
import { Recording } from '../types';
import { WorkOrderPdfModal } from '../components/WorkOrderPdfModal';
import {
  Mic,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  FileText,
  Printer
} from 'lucide-react';

interface DashboardPageProps {
  onOpenUploader: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenUploader }) => {
  const navigate = useNavigate();
  const [selectedRecordingForPdf, setSelectedRecordingForPdf] = useState<Recording | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 10000,
  });

  const { data: recordings = [] } = useQuery({
    queryKey: ['recordings'],
    queryFn: fetchRecordings,
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="glass-panel-glow p-8 rounded-3xl bg-gradient-to-r from-[#0C1527] via-[#0D1B2A] to-[#0A111F] border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Voice Agent & Field Operations CRM
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, Dave Miller
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            EchoDesk converts your spoken on-site field visits into structured CRM entries, jobs, parts used, and customer quotes in seconds.
          </p>
        </div>

        <button
          onClick={onOpenUploader}
          className="z-10 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Mic className="w-5 h-5" />
          <span>Record New Voice Note</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Voice Hours</p>
            <p className="text-2xl font-bold text-white mt-0.5 font-mono">
              {statsLoading ? '...' : `${stats?.totalVoiceHours || 0}h`}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</p>
            <p className="text-2xl font-bold text-white mt-0.5 font-mono">
              {statsLoading ? '...' : stats?.totalJobs || 0}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Jobs</p>
            <p className="text-2xl font-bold text-white mt-0.5 font-mono">
              {statsLoading ? '...' : stats?.completedJobs || 0}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Action Items</p>
            <p className="text-2xl font-bold text-white mt-0.5 font-mono">
              {statsLoading ? '...' : stats?.pendingTasks || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Voice Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Voice Debriefs & Extractions</h2>
            <p className="text-xs text-slate-400">Click any note to open interactive audio studio or export work order PDF</p>
          </div>
          <Link
            to="/studio"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>Open Audio Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recordings.length === 0 ? (
            <div className="col-span-full glass-panel p-8 rounded-2xl border border-slate-800 text-center py-12">
              <p className="text-sm text-slate-400">No recordings found. Click &quot;Record New Voice Note&quot; to begin!</p>
            </div>
          ) : (
            recordings.map((rec) => {
              const customerName = rec.customer?.name || rec.extractedData?.customerInfo?.name || 'General On-Site Visit';
              const companyName = rec.customer?.companyName || rec.extractedData?.customerInfo?.companyName;
              const summary = rec.extractedData?.executiveSummary || rec.rawTranscript || 'Voice recording processed.';
              const quoted = rec.extractedData?.financials?.quotedAmount;

              return (
                <div
                  key={rec.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/90 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all group shadow-lg flex flex-col justify-between"
                >
                  <div
                    onClick={() => navigate(`/studio?id=${rec.id}`)}
                    className="space-y-2 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                          {customerName}
                        </span>
                        {companyName && (
                          <span className="text-xs text-slate-400 ml-1.5">({companyName})</span>
                        )}
                      </div>

                      {quoted !== undefined && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                          ${quoted.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {rec.audioDurationSec.toFixed(1)}s
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {rec.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecordingForPdf(rec);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition"
                        title="Preview & Print PDF Work Order"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>PDF Invoice</span>
                      </button>

                      <button
                        onClick={() => navigate(`/studio?id=${rec.id}`)}
                        className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 transition font-medium"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      <WorkOrderPdfModal
        recording={selectedRecordingForPdf}
        isOpen={!!selectedRecordingForPdf}
        onClose={() => setSelectedRecordingForPdf(null)}
      />
    </div>
  );
};
