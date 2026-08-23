import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWebhooks, createWebhook, deleteWebhook, testPingWebhook, WebhookSubscription } from '../lib/api';
import {
  Webhook,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Settings,
  Building,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'recording.completed',
    'job.created',
  ]);
  const [pingResult, setPingResult] = useState<{ id: string; success: boolean; message: string } | null>(
    null
  );

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: fetchWebhooks,
  });

  const createMutation = useMutation({
    mutationFn: createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setNewUrl('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const pingMutation = useMutation({
    mutationFn: testPingWebhook,
    onSuccess: (data, vars) => {
      setPingResult({
        id: vars.url,
        success: data.success,
        message: data.message,
      });
    },
    onError: (err: any, vars) => {
      setPingResult({
        id: vars.url,
        success: false,
        message: err.message || 'Ping failed',
      });
    },
  });

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    createMutation.mutate({
      url: newUrl.trim(),
      events: selectedEvents,
    });
  };

  const availableEvents = [
    { id: 'recording.completed', label: 'recording.completed (Full transcript & AI extracted CRM entities)' },
    { id: 'job.created', label: 'job.created (When a work order or field job is dispatched)' },
    { id: 'customer.created', label: 'customer.created (When a new client is identified from voice)' },
  ];

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Workspace & Integration Settings</h1>
        <p className="text-xs text-slate-400">
          Configure real-time webhooks for Zapier, QuickBooks, ServiceTitan, and external CRMs
        </p>
      </div>

      {/* Workspace Info Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Pro HVAC Solutions</h2>
            <p className="text-xs text-slate-400">Workspace Slug: pro-hvac • Industry: HVAC & Field Mechanical</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-semibold uppercase">API Gateway Port</span>
            <p className="text-slate-200 font-mono mt-0.5">:5001/api/v1</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-semibold uppercase">Database Engine</span>
            <p className="text-slate-200 font-mono mt-0.5">PostgreSQL 18.3 (Prisma 7)</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-semibold uppercase">AI Speech Engine</span>
            <p className="text-slate-200 font-mono mt-0.5">Deepgram Nova-2 + OpenAI</p>
          </div>
        </div>
      </div>

      {/* Outbound Webhooks Gateway Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Outbound Webhooks Gateway</h2>
              <p className="text-xs text-slate-400">
                HMAC-SHA256 signed payloads dispatched automatically when voice notes finish processing
              </p>
            </div>
          </div>
        </div>

        {/* Add Webhook Form */}
        <form onSubmit={handleAddWebhook} className="space-y-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Add Webhook Endpoint
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Endpoint URL (Zapier / Make / QuickBooks Webhook URL)
            </label>
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Subscribe to Events:</label>
            <div className="space-y-2">
              {availableEvents.map((evt) => (
                <label
                  key={evt.id}
                  className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(evt.id)}
                    onChange={() => toggleEvent(evt.id)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span>{evt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || !newUrl.trim() || selectedEvents.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{createMutation.isPending ? 'Adding...' : 'Add Webhook'}</span>
            </button>
          </div>
        </form>

        {/* Existing Webhooks List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Webhooks ({webhooks.length})
          </h3>

          {isLoading ? (
            <p className="text-xs text-slate-500 py-4 text-center">Loading webhooks...</p>
          ) : webhooks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center">
              <p className="text-xs text-slate-500">
                No webhooks configured. Add your Zapier or Make URL above to sync data automatically!
              </p>
            </div>
          ) : (
            webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-mono font-bold text-white break-all">{wh.url}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Key className="w-3 h-3 text-slate-500" />
                      <span>Secret: {wh.secret.slice(0, 14)}••••••••</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => pingMutation.mutate({ url: wh.url, secret: wh.secret })}
                      disabled={pingMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition"
                      title="Send a live test ping to this URL"
                    >
                      <Send className="w-3 h-3" />
                      <span>Test Ping</span>
                    </button>

                    <button
                      onClick={() => deleteMutation.mutate(wh.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subscribed Events */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {wh.events.map((evt, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-emerald-400 border border-emerald-800/40"
                    >
                      {evt}
                    </span>
                  ))}
                </div>

                {/* Ping Result Feedback */}
                {pingResult && pingResult.id === wh.url && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      pingResult.success
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                        : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                    }`}
                  >
                    {pingResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{pingResult.message}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
