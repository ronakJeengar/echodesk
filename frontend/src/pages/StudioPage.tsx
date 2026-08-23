import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRecordings, fetchRecordingById, reExtractRecording } from '../lib/api';
import { WaveformPlayer } from '../components/WaveformPlayer';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { EntityInspector } from '../components/EntityInspector';
import { Radio, Sparkles, Search, Filter } from 'lucide-react';

export const StudioPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'POSITIVE' | 'NEUTRAL' | 'URGENT'>('ALL');

  const recordingIdFromUrl = searchParams.get('id');

  const { data: recordings = [] } = useQuery({
    queryKey: ['recordings'],
    queryFn: fetchRecordings,
  });

  const filteredRecordings = recordings.filter((r) => {
    const custName = (r.customer?.name || r.extractedData?.customerInfo?.name || '').toLowerCase();
    const transcript = (r.rawTranscript || '').toLowerCase();
    const summary = (r.extractedData?.executiveSummary || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !query ||
      custName.includes(query) ||
      transcript.includes(query) ||
      summary.includes(query);

    const matchesSentiment =
      sentimentFilter === 'ALL' || r.extractedData?.sentiment === sentimentFilter;

    return matchesSearch && matchesSentiment;
  });

  const activeRecordingId =
    recordingIdFromUrl && recordings.some((r) => r.id === recordingIdFromUrl)
      ? recordingIdFromUrl
      : filteredRecordings[0]?.id || recordings[0]?.id;

  const { data: activeRecording, isLoading: recordingLoading } = useQuery({
    queryKey: ['recording', activeRecordingId],
    queryFn: () => fetchRecordingById(activeRecordingId!),
    enabled: !!activeRecordingId,
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  const reExtractMutation = useMutation({
    mutationFn: (promptAdjustment: string) =>
      reExtractRecording(activeRecordingId!, promptAdjustment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recording', activeRecordingId] });
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });

  const handleWordClick = (start: number) => {
    setSeekTime(start);
    setTimeout(() => setSeekTime(null), 50);
  };

  const handleSelectRecording = (id: string) => {
    setSearchParams({ id });
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Studio Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Audio Studio & AI Inspector</h1>
            <p className="text-xs text-slate-400">
              Listen to on-site voice notes, click words in the transcript to jump audio, and inspect CRM entities
            </p>
          </div>
        </div>

        {/* Global Search & Recording Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search speech & clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-750 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-44"
            />
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-semibold">
            {(['ALL', 'POSITIVE', 'URGENT'] as const).map((sent) => (
              <button
                key={sent}
                onClick={() => setSentimentFilter(sent)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  sentimentFilter === sent
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sent}
              </button>
            ))}
          </div>

          {/* Quick Voice Note Dropdown */}
          <select
            value={activeRecordingId || ''}
            onChange={(e) => handleSelectRecording(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 max-w-[200px]"
          >
            {filteredRecordings.length === 0 ? (
              <option value="">No notes matched</option>
            ) : (
              filteredRecordings.map((r) => {
                const name = r.customer?.name || r.extractedData?.customerInfo?.name || 'Voice Note';
                return (
                  <option key={r.id} value={r.id}>
                    {name} ({r.audioDurationSec.toFixed(0)}s)
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>

      {recordingLoading || !activeRecording ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center py-24">
          <Sparkles className="w-8 h-8 mx-auto text-emerald-400 mb-3 animate-spin" />
          <p className="text-sm text-slate-400">Loading audio and AI extraction data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Waveform Player & Synchronized Transcript (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            {/* Interactive Wavesurfer Waveform Player */}
            <WaveformPlayer
              audioUrl={activeRecording.audioUrl}
              durationSec={activeRecording.audioDurationSec}
              onTimeUpdate={(t) => setCurrentTime(t)}
              seekTime={seekTime}
            />

            {/* Click-to-Jump Transcript Viewer */}
            <div className="flex-1 min-h-[380px]">
              <TranscriptViewer
                transcript={activeRecording.rawTranscript}
                wordTimestamps={activeRecording.wordTimestamps}
                currentTime={currentTime}
                onWordClick={handleWordClick}
              />
            </div>
          </div>

          {/* Right Column: AI Extracted CRM Entities (5 Cols) */}
          <div className="lg:col-span-5">
            <EntityInspector
              extractedData={activeRecording.extractedData}
              recordingId={activeRecording.id}
              recording={activeRecording}
              onReExtract={async (prompt) => {
                await reExtractMutation.mutateAsync(prompt);
              }}
              isLoading={reExtractMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};
