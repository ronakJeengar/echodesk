import React, { useState, useRef } from 'react';
import { Mic, Square, Upload, X, Loader2, Sparkles } from 'lucide-react';
import { requestPresignedUrl, processRecording } from '../lib/api';
import { subscribeToRecording } from '../lib/socket';

interface AudioUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessed: (recordingId: string) => void;
}

export const AudioUploaderModal: React.FC<AudioUploaderModalProps> = ({
  isOpen,
  onClose,
  onProcessed,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobCategory, setJobCategory] = useState('HVAC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

  const startBrowserRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopBrowserRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp4' });
        const file = new File([audioBlob], `voice-note-${Date.now()}.m4a`, { type: 'audio/mp4' });
        setSelectedFile(file);
      };
    }
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setStatusMessage('Requesting secure upload URL...');
    setProgressPercent(15);

    try {
      // 1. Request presigned upload URL
      const presigned = await requestPresignedUrl({
        durationSec: recordingDuration > 0 ? recordingDuration : 45.0,
        fileSizeBytes: selectedFile.size,
        audioFormat: 'm4a',
      });

      const { recordingId, uploadUrl } = presigned;

      // 2. Subscribe to real-time status updates via Socket.IO
      const unsubscribe = subscribeToRecording(recordingId, (evt) => {
        if (evt.type === 'status_change') {
          setStatusMessage(evt.message || evt.status);
          setProgressPercent(evt.progressPercent || 50);
        } else if (evt.type === 'completed') {
          setProgressPercent(100);
          setStatusMessage('Processing complete!');
          setTimeout(() => {
            setIsProcessing(false);
            onClose();
            onProcessed(recordingId);
          }, 800);
        }
      });

      // 3. Upload audio binary directly
      setStatusMessage('Uploading audio to EchoDesk storage...');
      setProgressPercent(35);

      await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type || 'audio/mp4',
        },
      });

      // 4. Trigger backend AI extraction pipeline
      setStatusMessage('Transcribing & extracting CRM entities with AI...');
      setProgressPercent(60);

      await processRecording(recordingId, { jobCategory });

      // Fallback polling in case WebSockets are delayed
      setTimeout(() => {
        unsubscribe();
        setIsProcessing(false);
        onClose();
        onProcessed(recordingId);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Error processing audio: ' + (err.message || 'Unknown error'));
      setIsProcessing(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="glass-panel-glow bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Capture Voice Note</h2>
            <p className="text-xs text-slate-400">Record speech or upload field audio file</p>
          </div>
        </div>

        <div className="my-5 space-y-4">
          {/* Industry Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Industry Domain Boost
            </label>
            <select
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="HVAC">HVAC (Capacitors, Refrigerants, Heat Pumps)</option>
              <option value="Plumbing">Plumbing (PEX, PRV, Water Heaters, Drain Snaking)</option>
              <option value="Electrical">Electrical (Breakers, 200A Panels, GFCI, Conduit)</option>
              <option value="Inspection">Property Inspection (Foundation, Moisture, Code)</option>
              <option value="General Contracting">General Contracting & Remodeling</option>
            </select>
          </div>

          {/* Record Button Card */}
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center flex flex-col items-center justify-center">
            {isRecording ? (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto animate-pulse">
                  <Square className="w-6 h-6 text-rose-500 fill-rose-500" />
                </div>
                <div className="font-mono text-2xl font-bold text-rose-400">
                  {formatSeconds(recordingDuration)}
                </div>
                <p className="text-xs text-slate-400">Speaking into microphone... Tap to finish</p>
                <button
                  onClick={stopBrowserRecording}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition"
                >
                  Stop Recording
                </button>
              </div>
            ) : selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI extraction
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove & Re-record
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={startBrowserRecording}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition"
                >
                  <Mic className="w-7 h-7" />
                </button>
                <p className="text-sm font-semibold text-slate-200">Tap to start speaking</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="h-px w-12 bg-slate-800" />
                  <span className="text-xs text-slate-500 uppercase">or upload file</span>
                  <span className="h-px w-12 bg-slate-800" />
                </div>
                <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer border border-slate-700 transition">
                  <Upload className="w-3.5 h-3.5" />
                  Choose Audio File (.m4a, .mp3, .wav)
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Progress / Status Bar */}
          {isProcessing && (
            <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {statusMessage}
                </span>
                <span className="font-mono text-slate-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadAndProcess}
            disabled={!selectedFile || isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
