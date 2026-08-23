import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCustomers, fetchRecordings, fetchCustomerTimeline } from '../lib/api';
import { Customer, Recording } from '../types';
import { WorkOrderPdfModal } from '../components/WorkOrderPdfModal';
import { AddCustomerModal } from '../components/AddCustomerModal';
import { Users, Search, Phone, MapPin, Mic, Briefcase, Plus, Calendar, ArrowUpRight, Printer, X, Play, Clock, Sparkles, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [pdfRecording, setPdfRecording] = useState<Recording | null>(null);
  const navigate = useNavigate();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => fetchCustomers(search),
  });

  const { data: recordings = [] } = useQuery({
    queryKey: ['recordings'],
    queryFn: fetchRecordings,
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['customer-timeline', selectedCustomer?.id],
    queryFn: () => (selectedCustomer ? fetchCustomerTimeline(selectedCustomer.id) : null),
    enabled: !!selectedCustomer,
  });

  const handleOpenPdfForCustomer = (cust: Customer) => {
    const matchedRecording = recordings.find(
      (r) => r.customerId === cust.id || r.customer?.id === cust.id
    );

    const recordingToPrint: Recording = matchedRecording || {
      id: `client-${cust.id.slice(0, 8)}`,
      workspaceId: cust.workspaceId,
      customerId: cust.id,
      audioUrl: '',
      audioDurationSec: 45.0,
      audioFormat: 'm4a',
      fileSizeBytes: 1048576,
      status: 'COMPLETED',
      wordTimestamps: [],
      customer: {
        id: cust.id,
        name: cust.name,
        companyName: cust.companyName,
        phone: cust.phone,
        address: cust.address,
      },
      extractedData: {
        executiveSummary: `On-site diagnostic inspection and scheduled service for ${cust.name}.`,
        sentiment: 'POSITIVE',
        confidenceScore: 0.98,
        customerInfo: {
          name: cust.name,
          companyName: cust.companyName,
          phone: cust.phone,
          address: cust.address,
        },
        partsAndServices: [],
        financials: {
          quotedAmount: 250.0,
          laborCost: 150.0,
          partsCost: 100.0,
          isPaid: false,
          paymentMethod: 'INVOICE_PENDING',
        },
        actionItems: [
          {
            title: `Follow up with ${cust.name}`,
            priority: 'HIGH',
            assigneeRole: 'ADMIN',
          },
        ],
      },
      recordedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPdfRecording(recordingToPrint);
  };

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

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients, companies, phones..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 shrink-0 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Client</span>
          </button>
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

      {/* Customer Profile & Activity Timeline Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-panel-glow bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    ACTIVE CLIENT
                  </span>
                </div>
                {selectedCustomer.companyName && (
                  <p className="text-xs text-slate-400 mt-0.5">{selectedCustomer.companyName}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase">Phone</span>
                <p className="text-slate-200 font-mono mt-0.5">{selectedCustomer.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold uppercase">Service Address</span>
                <p className="text-slate-200 mt-0.5">{selectedCustomer.address || 'N/A'}</p>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Customer Voice Notes & Job Timeline
              </h3>

              {timelineLoading ? (
                <p className="text-xs text-slate-500 py-4 text-center">Loading timeline...</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {timelineData?.recordings?.length === 0 && timelineData?.jobs?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No recorded debriefs yet.</p>
                  ) : (
                    <>
                      {timelineData?.recordings?.map((rec: any) => (
                        <div
                          key={rec.id}
                          onClick={() => {
                            navigate(`/studio?id=${rec.id}`);
                            setSelectedCustomer(null);
                          }}
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-950 cursor-pointer transition flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Mic className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                                Voice Debrief ({rec.audioDurationSec?.toFixed(1)}s)
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(rec.recordedAt || rec.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {rec.extractedData?.executiveSummary || rec.rawTranscript}
                            </p>
                          </div>
                          <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-current opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      ))}

                      {timelineData?.jobs?.map((job: any) => (
                        <div
                          key={job.id}
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="font-semibold text-white">{job.title}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                              {job.status}
                            </span>
                          </div>
                          {job.quotedAmount && (
                            <span className="font-mono font-bold text-emerald-400">
                              ${job.quotedAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleOpenPdfForCustomer(selectedCustomer)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Work Order PDF</span>
              </button>

              <button
                onClick={() => handleOpenPdfForCustomer(selectedCustomer)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs border border-cyan-500/30 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Account Statement PDF</span>
              </button>

              <button
                onClick={() => {
                  navigate('/studio');
                  setSelectedCustomer(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
              >
                Open Audio Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      {/* PDF Modal */}
      <WorkOrderPdfModal
        recording={pdfRecording}
        isOpen={!!pdfRecording}
        onClose={() => setPdfRecording(null)}
      />
    </div>
  );
};
