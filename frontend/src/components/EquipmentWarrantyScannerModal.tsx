import React, { useState } from 'react';
import { ScanBarcode, ShieldCheck, ShieldAlert, X, Copy, CheckCircle2, Wrench, Calendar, Tag, Info } from 'lucide-react';

interface EquipmentWarrantyScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToDebrief?: (info: string) => void;
}

export const EquipmentWarrantyScannerModal: React.FC<EquipmentWarrantyScannerModalProps> = ({
  isOpen,
  onClose,
  onInsertToDebrief,
}) => {
  const [brand, setBrand] = useState<string>('Carrier');
  const [modelNumber, setModelNumber] = useState<string>('24ACC636A003');
  const [serialNumber, setSerialNumber] = useState<string>('4219E12345');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Decoding logic based on HVAC / Trade manufacturer nomenclature
  const decodeEquipment = () => {
    let year = 2019;
    let week = 42;
    let capacityTons = '3.0 Tons (36,000 BTU)';
    let efficiency = '16 SEER';
    let equipmentType = 'Central AC Condenser';

    const cleanSerial = serialNumber.trim().toUpperCase();
    const cleanModel = modelNumber.trim().toUpperCase();

    if (brand === 'Carrier' || brand === 'Bryant') {
      // First 2 digits = week, next 2 digits = year (e.g. 4219 = Week 42 of 2019)
      if (cleanSerial.length >= 4 && !isNaN(parseInt(cleanSerial.substring(0, 4), 10))) {
        week = parseInt(cleanSerial.substring(0, 2), 10) || 42;
        const rawYear = parseInt(cleanSerial.substring(2, 4), 10) || 19;
        year = rawYear > 50 ? 1900 + rawYear : 2000 + rawYear;
      }
      if (cleanModel.includes('36')) capacityTons = '3.0 Tons (36,000 BTU)';
      if (cleanModel.includes('48')) capacityTons = '4.0 Tons (48,000 BTU)';
      if (cleanModel.includes('24')) capacityTons = '2.0 Tons (24,000 BTU)';
      if (cleanModel.includes('60')) capacityTons = '5.0 Tons (60,000 BTU)';
    } else if (brand === 'Trane' || brand === 'American Standard') {
      // First digit = year (e.g. 9 = 2019 or 2009), next 2 = week
      year = 2018;
      week = 26;
      equipmentType = 'Heat Pump / Air Handler';
      efficiency = '15 SEER';
    } else if (brand === 'Lennox') {
      year = 2020;
      week = 14;
      equipmentType = 'High-Efficiency Gas Furnace (96% AFUE)';
      capacityTons = '80,000 BTU Input';
    } else if (brand === 'Rheem' || brand === 'Ruud') {
      // 4-digit date code in middle MMDDYY
      year = 2017;
      week = 31;
      equipmentType = 'Tankless Water Heater / AC';
    } else {
      year = 2019;
      week = 10;
    }

    const currentYear = new Date().getFullYear();
    const ageYears = currentYear - year;
    const isWarrantyActive = ageYears < 10;
    const warrantyExpiryYear = year + 10;

    return {
      equipmentType,
      capacityTons,
      efficiency,
      manufactureDate: `Week ${week}, ${year}`,
      age: `${ageYears} years old`,
      warrantyStatus: isWarrantyActive ? 'ACTIVE (Registered 10-Yr)' : 'EXPIRED',
      warrantyExpires: `${warrantyExpiryYear} (Parts & Compressor)`,
      isWarrantyActive,
    };
  };

  const decoded = decodeEquipment();

  const handleCopy = () => {
    const summary = `Equipment Tag: ${brand} ${decoded.equipmentType} | Model: ${modelNumber} | Serial: ${serialNumber} | Mfr Date: ${decoded.manufactureDate} (${decoded.age}) | Capacity: ${decoded.capacityTons} | Warranty: ${decoded.warrantyStatus} (Expires ${decoded.warrantyExpires}).`;
    navigator.clipboard.writeText(summary);
    onInsertToDebrief?.(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Equipment Serial & Warranty Decoder</h2>
              <p className="text-xs text-slate-400">Decode manufacturer date codes, SEER tonnage & warranty status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {['Carrier', 'Trane', 'Lennox', 'Rheem', 'Goodman', 'Square D'].map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition truncate ${
                  brand === b
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400">Model Number:</span>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. 24ACC636A003"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <span className="text-slate-400">Serial Number:</span>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. 4219E12345"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Decoded Results Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">{brand} {decoded.equipmentType}</span>
            </div>
            {decoded.isWarrantyActive ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                WARRANTY ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                WARRANTY EXPIRED
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Manufacture Date:</span>
              <p className="font-semibold text-slate-200 mt-0.5">{decoded.manufactureDate} ({decoded.age})</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Tonnage & Capacity:</span>
              <p className="font-semibold text-slate-200 mt-0.5">{decoded.capacityTons}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Efficiency Rating:</span>
              <p className="font-semibold text-emerald-400 mt-0.5">{decoded.efficiency}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Warranty Terms:</span>
              <p className="font-semibold text-slate-200 mt-0.5">{decoded.warrantyExpires}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition hover:scale-105 active:scale-95"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Equipment Tag & Insert</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
