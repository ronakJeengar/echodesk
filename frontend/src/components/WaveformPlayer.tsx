import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, FastForward, Bookmark, Plus, X, Tag } from 'lucide-react';

export interface AudioBookmark {
  id: string;
  timeSec: number;
  label: string;
  color?: string;
}

interface WaveformPlayerProps {
  audioUrl?: string;
  durationSec?: number;
  onTimeUpdate?: (currentTime: number) => void;
  seekTime?: number | null;
  initialBookmarks?: AudioBookmark[];
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  durationSec = 48.5,
  onTimeUpdate,
  seekTime,
  initialBookmarks,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bookmarks, setBookmarks] = useState<AudioBookmark[]>(
    initialBookmarks || [
      { id: 'bm-1', timeSec: 4.5, label: 'Client / Site Intro', color: 'emerald' },
      { id: 'bm-2', timeSec: 16.0, label: 'Diagnostic Findings', color: 'amber' },
      { id: 'bm-3', timeSec: 28.5, label: 'Quoted Price & Approval', color: 'cyan' },
    ]
  );
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBookmarkLabel, setNewBookmarkLabel] = useState('');

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

  const handleSeekTo = (timeSec: number) => {
    if (wavesurferRef.current) {
      const duration = wavesurferRef.current.getDuration() || durationSec;
      if (duration > 0) {
        wavesurferRef.current.seekTo(Math.min(timeSec / duration, 1.0));
        if (!isPlaying) {
          wavesurferRef.current.play();
        }
      }
    }
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkLabel.trim()) return;

    const newBm: AudioBookmark = {
      id: `bm-${Date.now()}`,
      timeSec: parseFloat(currentTime.toFixed(1)),
      label: newBookmarkLabel.trim(),
      color: 'cyan',
    };

    setBookmarks([...bookmarks, newBm].sort((a, b) => a.timeSec - b.timeSec));
    setNewBookmarkLabel('');
    setIsAddingBookmark(false);
  };

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
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

      {/* Key-Moment Bookmarks Carousel */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>Key Audio Moments & Equipment Pins</span>
          </div>

          <button
            onClick={() => setIsAddingBookmark(!isAddingBookmark)}
            className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Pin Moment ({formatTime(currentTime)})</span>
          </button>
        </div>

        {isAddingBookmark && (
          <form onSubmit={handleAddBookmark} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-750">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              autoFocus
              value={newBookmarkLabel}
              onChange={(e) => setNewBookmarkLabel(e.target.value)}
              placeholder={`Label at ${formatTime(currentTime)} (e.g. Model Serial Number)`}
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-[11px] transition"
            >
              Pin
            </button>
            <button
              type="button"
              onClick={() => setIsAddingBookmark(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {bookmarks.map((bm) => (
            <button
              key={bm.id}
              onClick={() => handleSeekTo(bm.timeSec)}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-200 transition"
            >
              <span className="font-mono text-[10px] font-bold text-cyan-400">
                {formatTime(bm.timeSec)}
              </span>
              <span className="font-medium">{bm.label}</span>
              <span
                onClick={(e) => handleDeleteBookmark(bm.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-rose-400 ml-1 transition"
                title="Remove pin"
              >
                ×
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
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
