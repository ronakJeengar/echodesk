import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, fetchUserProfile, AppNotification } from '../lib/api';
import { TradeCalculatorsModal } from './TradeCalculatorsModal';
import { TechniciansRosterModal } from './TechniciansRosterModal';
import { EquipmentWarrantyScannerModal } from './EquipmentWarrantyScannerModal';
import { AuthModal } from './AuthModal';
import { UserProfileModal } from './UserProfileModal';
import { Mic, Bell, User, CheckCircle2, FileText, PenTool, Sparkles, X, Clock, Calculator, Users, ScanBarcode, LogIn, Building } from 'lucide-react';

interface NavbarProps {
  onOpenUploader: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUploader }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('echodesk_token');

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 15000,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', token],
    queryFn: fetchUserProfile,
    enabled: !!token,
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  const handleNotificationClick = (notif: AppNotification) => {
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('echodesk_token');
    localStorage.removeItem('echodesk_workspace_id');
    setIsProfileOpen(false);
    setIsAuthOpen(true);
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

  const displayName = userProfile?.fullName || 'Contractor';
  const displayRole = userProfile?.role || 'OWNER';
  const primaryWs = userProfile?.memberships?.[0]?.workspaceName || 'Apex HVAC Operations';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
          <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
            <Mic className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-white tracking-tight leading-tight">EchoDesk</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              AI CRM
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight truncate max-w-[200px]">{primaryWs}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Launchers */}
        <button
          onClick={() => setIsCalcOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span>Calculators</span>
        </button>

        <button
          onClick={() => setIsRosterOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fleet</span>
        </button>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <ScanBarcode className="w-3.5 h-3.5 text-amber-400" />
          <span>Decoder</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUploader}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Voice Note</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 relative transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse ring-2 ring-[#0B0F19]" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Live Activity Feed</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {unreadCount} UNREAD
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No recent notifications.</p>
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
        <div
          onClick={() => {
            if (token) {
              setIsProfileOpen(true);
            } else {
              setIsAuthOpen(true);
            }
          }}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-800 cursor-pointer hover:opacity-90 transition group"
          title="Account & Profile Settings"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-500/50 flex items-center justify-center text-slate-300 transition font-bold text-xs">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
              <span>{displayName}</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">{displayRole}</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-tight">Profile & Workspace</p>
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

      <EquipmentWarrantyScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </header>
  );
};
