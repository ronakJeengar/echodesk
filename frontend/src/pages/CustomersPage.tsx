import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCustomers } from '../lib/api';
import { Customer } from '../types';
import { Users, Search, Phone, MapPin, Mic, Briefcase, Plus, Calendar, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const navigate = useNavigate();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => fetchCustomers(search),
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer CRM Directory</h1>
          <p className="text-xs text-slate-400">
            Client profiles automatically populated and enriched from spoken voice notes
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients, companies, phones..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Customer Grid */}
      {isLoading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center py-20">
          <p className="text-sm text-slate-400">Loading customer profiles...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center py-20">
          <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No customers found matching &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      {cust.name}
                    </h3>
                    {cust.companyName && (
                      <p className="text-xs text-slate-400">{cust.companyName}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-800/40">
                    <Mic className="w-3.5 h-3.5" />
                    <span>{cust._count?.recordings || 0}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {cust.phone && (
                    <p className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono">{cust.phone}</span>
                    </p>
                  )}
                  {cust.address && (
                    <p className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cust.address}</span>
                    </p>
                  )}
                </div>

                {cust.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cust.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800 text-xs text-slate-400">
                <span>{cust._count?.jobs || 0} Active Jobs</span>
                <span className="text-emerald-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                  View Timeline <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal / Slide-over */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel-glow bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                {selectedCustomer.companyName && (
                  <p className="text-sm text-slate-400">{selectedCustomer.companyName}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-sm">
              {selectedCustomer.phone && (
                <p className="text-slate-300">
                  <strong className="text-slate-400">Phone:</strong> {selectedCustomer.phone}
                </p>
              )}
              {selectedCustomer.address && (
                <p className="text-slate-300">
                  <strong className="text-slate-400">Address:</strong> {selectedCustomer.address}
                </p>
              )}
              <p className="text-slate-300">
                <strong className="text-slate-400">Voice Notes Count:</strong>{' '}
                {selectedCustomer._count?.recordings || 0}
              </p>
            </div>

            <button
              onClick={() => {
                navigate('/studio');
                setSelectedCustomer(null);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              Open Customer Audio Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
