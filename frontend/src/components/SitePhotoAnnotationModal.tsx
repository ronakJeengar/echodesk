import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Tag, CheckCircle2, X, Plus, Trash2, Eye, ShieldCheck, Download } from 'lucide-react';

interface SitePhoto {
  id: string;
  url: string;
  caption: string;
  type: 'BEFORE' | 'DURING' | 'AFTER';
  tags: string[];
  timestamp: string;
}

interface SitePhotoAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  jobSummary?: string;
}

export const SitePhotoAnnotationModal: React.FC<SitePhotoAnnotationModalProps> = ({
  isOpen,
  onClose,
  customerName = 'Valued Customer',
  jobSummary = 'Field Service Visit',
}) => {
  const [photos, setPhotos] = useState<SitePhoto[]>([
    {
      id: 'p-1',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      caption: 'Outdoor Condenser: Burnt contactor switch & swollen capacitor terminals',
      type: 'BEFORE',
      tags: ['Damaged Capacitor', 'Burnt Contacts', 'Voltage Drop'],
      timestamp: 'Today, 10:14 AM',
    },
    {
      id: 'p-2',
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      caption: 'New 45/5 MFD Titan PRO capacitor & 30A contactor installed & secured',
      type: 'AFTER',
      tags: ['Installed New Part', 'Clean Wiring', 'Torque Verified'],
      timestamp: 'Today, 10:48 AM',
    },
  ]);

  const [selectedPhoto, setSelectedPhoto] = useState<SitePhoto>(photos[0]);
  const [newTagInput, setNewTagInput] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (photoId: string) => {
    if (!newTagInput.trim()) return;
    setPhotos(
      photos.map((p) =>
        p.id === photoId ? { ...p, tags: [...p.tags, newTagInput.trim()] } : p
      )
    );
    if (selectedPhoto.id === photoId) {
      setSelectedPhoto({
        ...selectedPhoto,
        tags: [...selectedPhoto.tags, newTagInput.trim()],
      });
    }
    setNewTagInput('');
  };

  const handleAddDemoPhoto = () => {
    const newP: SitePhoto = {
      id: Date.now().toString(),
      url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
      caption: 'Digital manifold gauge reading: 118 PSI suction pressure / 9.8°F subcooling',
      type: 'AFTER',
      tags: ['EPA Verified', 'Subcooling Normal', 'Closed Loop'],
      timestamp: 'Just now',
    };
    setPhotos([...photos, newP]);
    setSelectedPhoto(newP);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Job Site Photos & Visual AI Annotations</h2>
              <p className="text-xs text-slate-400">Before & after equipment condition, damage tags and evidence log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content: Big Preview & Thumbnails */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Big Photo View (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center group">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${
                    selectedPhoto.type === 'BEFORE'
                      ? 'bg-rose-500 text-black'
                      : selectedPhoto.type === 'AFTER'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-cyan-500 text-black'
                  }`}
                >
                  {selectedPhoto.type}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-slate-300 font-mono">
                {selectedPhoto.timestamp}
              </div>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
              {selectedPhoto.caption}
            </p>

            {/* Tags for Active Photo */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Visual Inspection Badges & Fault Tags
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedPhoto.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-mono flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-cyan-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add custom visual tag..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag(selectedPhoto.id)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 flex-1 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(selectedPhoto.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnails List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Site Evidence Gallery ({photos.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddDemoPhoto}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Attach Photo</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {photos.map((p) => {
                  const isSel = selectedPhoto.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPhoto(p)}
                      className={`p-2 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        isSel
                          ? 'border-cyan-500 bg-slate-950 shadow-lg shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.caption}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              p.type === 'BEFORE'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {p.type}
                          </span>
                          <span className="text-[10px] text-slate-500">{p.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-200 truncate mt-1">{p.caption}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Status */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Geotag & Time-Stamped Integrity</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Photos are embedded into customer work order PDFs and insurance claim packets.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition hover:scale-105 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Attach to Work Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
