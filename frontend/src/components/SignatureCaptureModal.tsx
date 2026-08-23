import React, { useRef, useState, useEffect } from 'react';
import { PenTool, X, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';

interface SignatureCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSignerName?: string;
  onSigned: (signatureDataUrl: string, signerName: string, signerRole: string) => void;
}

export const SignatureCaptureModal: React.FC<SignatureCaptureModalProps> = ({
  isOpen,
  onClose,
  initialSignerName = '',
  onSigned,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(initialSignerName);
  const [signerRole, setSignerRole] = useState<'CUSTOMER' | 'TECHNICIAN'>('CUSTOMER');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#22d3ee'; // cyan-400
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSigned(dataUrl, signerName.trim() || 'Signer', signerRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Capture Digital Signature</h2>
              <p className="text-xs text-slate-400">Sign work order diagnostics and estimates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSignerRole('CUSTOMER')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
              signerRole === 'CUSTOMER'
                ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <span>Customer Approval</span>
          </button>
          <button
            type="button"
            onClick={() => setSignerRole('TECHNICIAN')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
              signerRole === 'TECHNICIAN'
                ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <span>Lead Technician</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Signer Full Name
          </label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Canvas Signature Pad */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Sign Below:</span>
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
          <div className="relative border border-slate-700 bg-slate-950 rounded-2xl overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={400}
              height={160}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-40 touch-none block"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-xs">
                ✍️ Draw signature with mouse, stylus, or touch
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Attach Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
};
