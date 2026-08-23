import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, Volume2, FastForward } from 'lucide-react';

interface WaveformPlayerProps {
  audioUrl?: string;
  durationSec?: number;
  onTimeUpdate?: (currentTime: number) => void;
  seekTime?: number | null;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  durationSec = 48.5,
  onTimeUpdate,
  seekTime,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Generate synthetic sine/noise waveform when mock audio is used
  const defaultAudio = audioUrl && audioUrl.startsWith('http')
    ? audioUrl
    : 'https://cdn.freesound.org/previews/518/518305_10825313-lq.mp3';

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#334155',
      progressColor: '#10B981',
      cursorColor: '#06B6D4',
      barWidth: 3,
      barGap: 3,
      barRadius: 3,
      height: 72,
      normalize: true,
      url: defaultAudio,
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('timeupdate', (time) => {
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [defaultAudio]);

  // Handle external seek requests (e.g. clicking words in the transcript)
  useEffect(() => {
    if (seekTime !== null && seekTime !== undefined && wavesurferRef.current) {
      const duration = wavesurferRef.current.getDuration() || durationSec;
      if (duration > 0) {
        wavesurferRef.current.seekTo(Math.min(seekTime / duration, 1.0));
      }
    }
  }, [seekTime, durationSec]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    wavesurferRef.current?.setPlaybackRate(nextRate);
  };

  const handleRestart = () => {
    wavesurferRef.current?.seekTo(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive Audio Waveform
          </span>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
          {formatTime(currentTime)} / {formatTime(durationSec)}
        </div>
      </div>

      {/* Waveform Render Canvas */}
      <div ref={containerRef} className="cursor-pointer my-2 rounded-lg overflow-hidden" />

      {/* Playback Controls */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleRestart}
            className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Restart to beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRateChange}
            className="px-2.5 py-1 rounded-md text-xs font-mono font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};
