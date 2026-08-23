import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, Users, Kanban, FileAudio } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/studio', label: 'Audio Studio', icon: Radio },
    { to: '/customers', label: 'Customers CRM', icon: Users },
    { to: '/jobs', label: 'Jobs & Tasks', icon: Kanban },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0B0F19]/90 flex flex-col justify-between p-4 shrink-0 hidden md:flex">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Operations
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Mobile App Sync Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-white">Mobile Sync Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          On-site speech recorded in Flutter app syncs to this web dashboard in real time.
        </p>
      </div>
    </aside>
  );
};
