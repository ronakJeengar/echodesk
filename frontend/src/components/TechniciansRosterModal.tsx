import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTechnicians, Technician } from '../lib/api';
import { Users, X, MapPin, Briefcase, Phone, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TechniciansRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTechnician?: (tech: Technician) => void;
}

export const TechniciansRosterModal: React.FC<TechniciansRosterModalProps> = ({
  isOpen,
  onClose,
  onSelectTechnician,
}) => {
  const { data: technicians = [], isLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: fetchTechnicians,
  });

  if (!isOpen) return null;

  const getStatusBadge = (status: Technician['status']) => {
    switch (status) {
      case 'ON_SITE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            ON SITE
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            EN ROUTE
          </span>
        );
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            AVAILABLE
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
            OFF DUTY
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Fleet & Field Technicians Roster</h2>
              <p className="text-xs text-slate-400">Live dispatch status, active assignments & certifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading fleet roster...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                onClick={() => onSelectTechnician?.(tech)}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition group cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 font-bold text-slate-200 flex items-center justify-center text-sm">
                      {tech.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                        {tech.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{tech.role}</p>
                    </div>
                  </div>
                  {getStatusBadge(tech.status)}
                </div>

                <div className="pt-2 border-t border-slate-850 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-400">Specialty:</span>
                    <span className="font-semibold text-slate-200 truncate">{tech.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Current Job:</span>
                    <span className="font-semibold text-slate-200 truncate">{tech.currentJob}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>{tech.email}</span>
                    <span className="font-mono text-emerald-400 font-semibold">{tech.activeJobs} active jobs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-500">
            {technicians.length} Active Field Operators Deployed
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
