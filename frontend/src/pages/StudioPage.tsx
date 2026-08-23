import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRecordings, fetchRecordingById, reExtractRecording } from '../lib/api';
import { WaveformPlayer } from '../components/WaveformPlayer';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { EntityInspector } from '../components/EntityInspector';
import { Radio, ChevronRight, Sparkles, Clock, User } from 'lucide-react';

export const StudioPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const recordingIdFromUrl = searchParams.get('id');

  const { data: recordings = [], isLoading: listLoading } = useQuery({
    queryKey: ['recordings'],
    queryFn: fetchRecordings,
  });

  const activeRecordingId = recordingIdFromUrl || recordings[0]?.id;

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
    // Reset seekTime trigger after propagation
    setTimeout(() => setSeekTime(null), 50);
  };

  const handleSelectRecording = (id: string) => {
    setSearchParams({ id });
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Audio Studio & AI Inspector</h1>
            <p className="text-xs text-slate-400">
              Listen to on-site recordings, click words in the transcript to jump audio, and inspect CRM entities
            </p>
          </div>
        </div>

        {/* Quick Recording Picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Voice Note:</label>
          <select
            value={activeRecordingId || ''}
            onChange={(e) => handleSelectRecording(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {recordings.map((r) => {
              const name = r.customer?.name || r.extractedData?.customerInfo?.name || 'Voice Note';
              return (
                <option key={r.id} value={r.id}>
                  {name} ({r.audioDurationSec.toFixed(0)}s)
                </option>
              );
            })}
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
