import React, { useState } from 'react';
import { Calculator, X, Flame, Zap, Wrench, Copy, CheckCircle2, ArrowRight } from 'lucide-react';

interface TradeCalculatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertNote?: (text: string) => void;
}

export const TradeCalculatorsModal: React.FC<TradeCalculatorsModalProps> = ({
  isOpen,
  onClose,
  onInsertNote,
}) => {
  const [activeTab, setActiveTab] = useState<'HVAC' | 'ELECTRICAL' | 'PLUMBING'>('HVAC');
  const [copied, setCopied] = useState(false);

  // HVAC Calculator State
  const [refrigerant, setRefrigerant] = useState<'R410A' | 'R22'>('R410A');
  const [suctionPressure, setSuctionPressure] = useState<number>(118);
  const [suctionLineTemp, setSuctionLineTemp] = useState<number>(54);
  const [liquidPressure, setLiquidPressure] = useState<number>(335);
  const [liquidLineTemp, setLiquidLineTemp] = useState<number>(92);

  // Electrical Calculator State
  const [voltage, setVoltage] = useState<number>(240);
  const [currentAmps, setCurrentAmps] = useState<number>(40);
  const [oneWayDistanceFeet, setOneWayDistanceFeet] = useState<number>(75);
  const [conductor, setConductor] = useState<'COPPER' | 'ALUMINUM'>('COPPER');

  // Plumbing Calculator State
  const [pipeDiameterInches, setPipeDiameterInches] = useState<number>(0.75);
  const [waterPressurePsi, setWaterPressurePsi] = useState<number>(65);

  if (!isOpen) return null;

  // HVAC Calculations
  // R410A Saturation Temp approximation: T_sat = (P + 14.7)^0.37 * 14.8 - 45
  const getSatTemp = (p: number, ref: 'R410A' | 'R22') => {
    if (ref === 'R410A') {
      return (p - 118) * 0.35 + 40; // ~40°F at 118 PSIG
    } else {
      return (p - 68) * 0.5 + 40; // ~40°F at 68.5 PSIG
    }
  };

  const getLiquidSatTemp = (p: number, ref: 'R410A' | 'R22') => {
    if (ref === 'R410A') {
      return (p - 335) * 0.18 + 104; // ~104°F at 335 PSIG
    } else {
      return (p - 196) * 0.25 + 100;
    }
  };

  const evapSatTemp = getSatTemp(suctionPressure, refrigerant);
  const calculatedSuperheat = Math.max(0, suctionLineTemp - evapSatTemp);

  const condSatTemp = getLiquidSatTemp(liquidPressure, refrigerant);
  const calculatedSubcooling = Math.max(0, condSatTemp - liquidLineTemp);

  // Electrical Calculations (NEC 3% branch circuit drop rule)
  // Voltage Drop = (2 * K * I * L) / Circular Mils, K_copper=12.9, K_alum=21.2
  const K = conductor === 'COPPER' ? 12.9 : 21.2;
  const targetCircularMils = (2 * K * currentAmps * oneWayDistanceFeet) / (voltage * 0.03);

  const getRecommendedAWG = (cm: number) => {
    if (cm <= 4110) return '14 AWG';
    if (cm <= 6530) return '12 AWG';
    if (cm <= 10380) return '10 AWG';
    if (cm <= 16510) return '8 AWG';
    if (cm <= 26240) return '6 AWG';
    if (cm <= 41740) return '4 AWG';
    if (cm <= 52620) return '3 AWG';
    if (cm <= 66360) return '2 AWG';
    return '1/0 AWG or larger';
  };

  const recommendedWire = getRecommendedAWG(targetCircularMils);
  const actualDropVolts = (2 * K * currentAmps * oneWayDistanceFeet) / 26240; // base on 6 AWG
  const dropPercentage = (actualDropVolts / voltage) * 100;

  // Plumbing Calculations
  // GPM = 29.84 * d^2 * C * sqrt(P)
  const calculatedGpm = Math.round(
    29.84 * Math.pow(pipeDiameterInches, 2) * 0.62 * Math.sqrt(Math.max(10, waterPressurePsi))
  );

  const handleCopySummary = () => {
    let summary = '';
    if (activeTab === 'HVAC') {
      summary = `HVAC Diagnostic Readings (${refrigerant}): Suction ${suctionPressure} PSIG / ${suctionLineTemp}°F (Superheat: ${calculatedSuperheat.toFixed(1)}°F), Liquid ${liquidPressure} PSIG / ${liquidLineTemp}°F (Subcooling: ${calculatedSubcooling.toFixed(1)}°F).`;
    } else if (activeTab === 'ELECTRICAL') {
      summary = `Electrical Circuit Sizing: ${voltage}V, ${currentAmps}A load over ${oneWayDistanceFeet} ft (${conductor}). Voltage drop: ${dropPercentage.toFixed(2)}% (${actualDropVolts.toFixed(1)}V). Recommended Conductor: ${recommendedWire}.`;
    } else {
      summary = `Plumbing Hydraulics: ${pipeDiameterInches}" diameter pipe at ${waterPressurePsi} PSI supply. Estimated peak delivery flow rate: ${calculatedGpm} GPM.`;
    }

    navigator.clipboard.writeText(summary);
    onInsertNote?.(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Trade Field Diagnostic Calculators</h2>
              <p className="text-xs text-slate-400">On-site formulas for HVAC, Electrical & Plumbing sizing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('HVAC')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'HVAC'
                ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>HVAC Charge</span>
          </button>

          <button
            onClick={() => setActiveTab('ELECTRICAL')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'ELECTRICAL'
                ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Wire Sizer</span>
          </button>

          <button
            onClick={() => setActiveTab('PLUMBING')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'PLUMBING'
                ? 'bg-blue-500/15 border-blue-500 text-blue-400'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Plumbing GPM</span>
          </button>
        </div>

        {/* HVAC Content */}
        {activeTab === 'HVAC' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Refrigerant Type:</label>
              <div className="flex gap-1.5">
                {(['R410A', 'R22'] as const).map((ref) => (
                  <button
                    key={ref}
                    onClick={() => setRefrigerant(ref)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      refrigerant === ref
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-950 border border-slate-800 text-slate-400'
                    }`}
                  >
                    {ref}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Suction Pressure (PSIG)</span>
                <input
                  type="number"
                  value={suctionPressure}
                  onChange={(e) => setSuctionPressure(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Suction Line Temp (°F)</span>
                <input
                  type="number"
                  value={suctionLineTemp}
                  onChange={(e) => setSuctionLineTemp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Liquid Pressure (PSIG)</span>
                <input
                  type="number"
                  value={liquidPressure}
                  onChange={(e) => setLiquidPressure(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Liquid Line Temp (°F)</span>
                <input
                  type="number"
                  value={liquidLineTemp}
                  onChange={(e) => setLiquidLineTemp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-amber-500/30">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase">Calculated Superheat</span>
                <p className="text-2xl font-black text-white mt-0.5">{calculatedSuperheat.toFixed(1)}°F</p>
                <p className="text-[10px] text-slate-400">Target Range: 10°F – 15°F</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase">Calculated Subcooling</span>
                <p className="text-2xl font-black text-white mt-0.5">{calculatedSubcooling.toFixed(1)}°F</p>
                <p className="text-[10px] text-slate-400">Target Range: 8°F – 12°F</p>
              </div>
            </div>
          </div>
        )}

        {/* Electrical Content */}
        {activeTab === 'ELECTRICAL' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Circuit Voltage (V)</span>
                <select
                  value={voltage}
                  onChange={(e) => setVoltage(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value={120}>120V (Single Phase)</option>
                  <option value={240}>240V (Split Phase)</option>
                  <option value={480}>480V (Commercial 3-Phase)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Conductor Material</span>
                <div className="flex gap-1.5 mt-0.5">
                  <button
                    onClick={() => setConductor('COPPER')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                      conductor === 'COPPER' ? 'bg-cyan-400 text-black' : 'bg-slate-950 border border-slate-800 text-slate-400'
                    }`}
                  >
                    Copper
                  </button>
                  <button
                    onClick={() => setConductor('ALUMINUM')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                      conductor === 'ALUMINUM' ? 'bg-cyan-400 text-black' : 'bg-slate-950 border border-slate-800 text-slate-400'
                    }`}
                  >
                    Aluminum
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Load Current (Amps)</span>
                <input
                  type="number"
                  value={currentAmps}
                  onChange={(e) => setCurrentAmps(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">One-Way Run Length (Feet)</span>
                <input
                  type="number"
                  value={oneWayDistanceFeet}
                  onChange={(e) => setOneWayDistanceFeet(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-cyan-500/30">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase">Recommended Wire Size</span>
                <p className="text-xl font-black text-white mt-0.5">{recommendedWire}</p>
                <p className="text-[10px] text-slate-400">NEC 3% Max Drop Compliant</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase">Est. Voltage Drop</span>
                <p className="text-xl font-black text-white mt-0.5">{dropPercentage.toFixed(2)}%</p>
                <p className="text-[10px] text-slate-400">({actualDropVolts.toFixed(1)} Volts loss)</p>
              </div>
            </div>
          </div>
        )}

        {/* Plumbing Content */}
        {activeTab === 'PLUMBING' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Nominal Pipe Diameter (Inches)</span>
                <select
                  value={pipeDiameterInches}
                  onChange={(e) => setPipeDiameterInches(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value={0.5}>1/2" Pipe</option>
                  <option value={0.75}>3/4" Pipe</option>
                  <option value={1.0}>1.0" Pipe</option>
                  <option value={1.25}>1-1/4" Main Service</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Static Street Pressure (PSI)</span>
                <input
                  type="number"
                  value={waterPressurePsi}
                  onChange={(e) => setWaterPressurePsi(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30">
              <span className="text-[11px] font-bold text-blue-400 uppercase">Peak Hydraulic Delivery Flow</span>
              <p className="text-2xl font-black text-white mt-0.5">{calculatedGpm} GPM</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Recommended PRV setting: 55–65 PSI to protect plumbing fixtures against water hammer.
              </p>
            </div>
          </div>
        )}

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
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Diagnostic Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
