import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, AppNotification } from '../lib/api';
import { TradeCalculatorsModal } from './TradeCalculatorsModal';
import { TechniciansRosterModal } from './TechniciansRosterModal';
import { Mic, Bell, User, CheckCircle2, FileText, PenTool, Sparkles, X, Clock, Calculator, Users } from 'lucide-react';

interface NavbarProps {
  onOpenUploader: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUploader }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 15000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleNotificationClick = (notif: AppNotification) => {
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'AI_PROCESSED':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'SIGNATURE_CAPTURED':
        return <PenTool className="w-4 h-4 text-cyan-400" />;
      case 'INVOICE_SENT':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'TASK_REMINDER':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
          <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
            <Mic className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            EchoDesk
          </span>
          <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            AI AGENT
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time sync badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Gateway</span>
        </div>

        {/* Start Voice Note CTA */}
        <button
          onClick={onOpenUploader}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Mic className="w-4 h-4" />
          <span className="hidden sm:inline">Record Note</span>
        </button>

        {/* Trade Diagnostic Calculator CTA */}
        <button
          onClick={() => setIsCalcOpen(true)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
          title="Field Diagnostic Calculators"
        >
          <Calculator className="w-4 h-4" />
        </button>

        {/* Fleet & Technicians Roster CTA */}
        <button
          onClick={() => setIsRosterOpen(true)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
          title="Fleet Technicians Roster"
        >
          <Users className="w-4 h-4" />
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Dispatch & AI Alerts
                  </span>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No recent notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 ${
                        notif.read
                          ? 'bg-slate-950/60 border-slate-850 hover:bg-slate-850'
                          : 'bg-slate-850 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-800 shrink-0 mt-0.5">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-white truncate">{notif.title}</p>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-snug line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Alex Miller</p>
            <p className="text-[11px] text-slate-400 leading-tight">Lead Field Tech</p>
          </div>
        </div>
      </div>

      <TradeCalculatorsModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />

      <TechniciansRosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
      />
    </header>
  );
};
