import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCustomers, fetchRecordings } from '../lib/api';
import { Customer, Recording } from '../types';
import { WorkOrderPdfModal } from '../components/WorkOrderPdfModal';
import { Users, Search, Phone, MapPin, Mic, Briefcase, Plus, Calendar, ArrowUpRight, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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

  const handleOpenPdfForCustomer = (cust: Customer) => {
    // Find customer's latest voice recording or create a structured client work order draft
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
                  View Profile <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel-glow bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  handleOpenPdfForCustomer(selectedCustomer);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Work Order PDF</span>
              </button>

              <button
                onClick={() => {
                  navigate('/studio');
                  setSelectedCustomer(null);
                }}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
              >
                Open Audio Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      <WorkOrderPdfModal
        recording={pdfRecording}
        isOpen={!!pdfRecording}
        onClose={() => setPdfRecording(null)}
      />
    </div>
  );
};
