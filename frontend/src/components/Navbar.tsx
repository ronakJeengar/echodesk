import React from 'react';
import { Mic, Activity, User } from 'lucide-react';

interface NavbarProps {
  onOpenUploader: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUploader }) => {
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

      <div className="flex items-center gap-4">
        {/* Real-time sync badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Gateway</span>
        </div>

        {/* Start Voice Note CTA */}
        <button
          onClick={onOpenUploader}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Mic className="w-4 h-4" />
          <span>Record Note</span>
        </button>

        {/* User profile badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Dave Miller</p>
            <p className="text-[11px] text-slate-400 leading-tight">Pro HVAC Solutions</p>
          </div>
        </div>
      </div>
    </header>
  );
};
