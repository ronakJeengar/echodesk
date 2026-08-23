import React from 'react';
import { WordTimestamp } from '../types';
import { Sparkles, FileText } from 'lucide-react';

interface TranscriptViewerProps {
  transcript?: string;
  wordTimestamps?: WordTimestamp[];
  currentTime: number;
  onWordClick: (startTime: number) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  wordTimestamps = [],
  currentTime,
  onWordClick,
}) => {
  if (!transcript) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 text-center py-12">
        <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="text-sm text-slate-400">No transcript available for this recording.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Word-Synchronized Transcript
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Click any word to jump audio
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 leading-relaxed text-slate-300 font-sans text-base select-text">
        {wordTimestamps.length > 0 ? (
          <div className="flex flex-wrap gap-x-1.5 gap-y-2">
            {wordTimestamps.map((wt, idx) => {
              const isActive = currentTime >= wt.start && currentTime <= wt.end;
              return (
                <button
                  key={idx}
                  onClick={() => onWordClick(wt.start)}
                  className={`px-1 py-0.5 rounded transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border-b-2 border-emerald-400 scale-105 shadow-sm'
                      : 'hover:bg-slate-800 hover:text-white text-slate-200'
                  }`}
                  title={`${wt.word} (${wt.start.toFixed(1)}s)`}
                >
                  {wt.word}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-200 leading-relaxed">{transcript}</p>
        )}
      </div>
    </div>
  );
};
