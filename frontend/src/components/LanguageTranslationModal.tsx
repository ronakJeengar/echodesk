import React, { useState } from 'react';
import { Languages, Globe, Copy, CheckCircle2, X, Sparkles, ArrowRight, FileText } from 'lucide-react';

interface LanguageTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawTranscript?: string;
  executiveSummary?: string;
  customerName?: string;
}

export const LanguageTranslationModal: React.FC<LanguageTranslationModalProps> = ({
  isOpen,
  onClose,
  rawTranscript = '',
  executiveSummary = 'Field service diagnostic and component replacement completed.',
  customerName = 'Valued Customer',
}) => {
  const [targetLang, setTargetLang] = useState<'es' | 'fr' | 'pt'>('es');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Multi-language translation dictionaries & heuristic generator
  const getTranslations = () => {
    if (targetLang === 'es') {
      return {
        langName: 'Spanish (Español)',
        flag: '🇲🇽',
        title: 'Resumen del Servicio en Campo',
        summary: executiveSummary
          .replace(/replaced/gi, 'se reemplazó')
          .replace(/tested/gi, 'se probó')
          .replace(/capacitor/gi, 'condensador / capacitor')
          .replace(/refrigerant/gi, 'refrigerante R-410A')
          .replace(/breaker/gi, 'interruptor automático')
          .replace(/panel/gi, 'panel eléctrico principal')
          .replace(/valve/gi, 'válvula de control')
          .replace(/subcooling/gi, 'subenfriamiento')
          .replace(/diagnostic/gi, 'diagnóstico completo')
          .replace(/inspected/gi, 'se inspeccionó') +
          ' Todo el equipo funciona ahora según las especificaciones del fabricante con garantía de servicio.',
        recommendations: 'Se recomienda mantenimiento preventivo programado dentro de 6 meses para máxima eficiencia.',
      };
    } else if (targetLang === 'fr') {
      return {
        langName: 'French (Français)',
        flag: '🇫🇷',
        title: 'Rapport de Service sur le Terrain',
        summary: executiveSummary
          .replace(/replaced/gi, 'remplacé')
          .replace(/tested/gi, 'testé')
          .replace(/capacitor/gi, 'condensateur de démarrage')
          .replace(/refrigerant/gi, 'fluide frigorigène')
          .replace(/breaker/gi, 'disjoncteur')
          .replace(/panel/gi, 'panneau électrique')
          .replace(/valve/gi, 'soupape')
          .replace(/diagnostic/gi, 'diagnostic technique') +
          ' Tout l\'équipement fonctionne désormais conformément aux spécifications du fabricant.',
        recommendations: 'Un entretien préventif régulier est recommandé dans 6 mois pour assurer une efficacité optimale.',
      };
    } else {
      return {
        langName: 'Portuguese (Português)',
        flag: '🇧🇷',
        title: 'Relatório de Serviço em Campo',
        summary: executiveSummary
          .replace(/replaced/gi, 'substituído')
          .replace(/tested/gi, 'testado')
          .replace(/capacitor/gi, 'capacitor de partida')
          .replace(/refrigerant/gi, 'gás refrigerante')
          .replace(/breaker/gi, 'disjuntor')
          .replace(/panel/gi, 'painel elétrico')
          .replace(/valve/gi, 'válvula')
          .replace(/diagnostic/gi, 'diagnóstico técnico') +
          ' Todo o equipamento agora opera conforme os padrões do fabricante.',
        recommendations: 'Recomenda-se manutenção preventiva periódica em 6 meses para eficiência contínua.',
      };
    }
  };

  const translated = getTranslations();

  const handleCopyBilingual = () => {
    const bilingualText = `--- [ENGLISH SERVICE SUMMARY] ---\n${executiveSummary}\n\n--- [${translated.langName.toUpperCase()}] ---\n${translated.summary}\n\nRecomendaciones: ${translated.recommendations}`;
    navigator.clipboard.writeText(bilingualText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Multi-Language Field Translator</h2>
              <p className="text-xs text-slate-400">Generate bilingual field debriefs & customer receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'es', name: 'Spanish (Español)', flag: '🇲🇽' },
            { id: 'fr', name: 'French (Français)', flag: '🇫🇷' },
            { id: 'pt', name: 'Portuguese (Português)', flag: '🇧🇷' },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setTargetLang(l.id as any)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                targetLang === l.id
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>

        {/* Dual Language Side-by-Side View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* English Original */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <span>🇺🇸 English (Original)</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              {executiveSummary}
            </p>
          </div>

          {/* Target Translation */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2 relative">
            <div className="flex items-center justify-between text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
              <span>{translated.flag} {translated.langName}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-[9px] text-cyan-300">AI TRANSLATED</span>
            </div>
            <p className="text-white leading-relaxed font-sans">
              {translated.summary}
            </p>
            <p className="text-slate-400 text-[11px] italic pt-1 border-t border-slate-850">
              💡 {translated.recommendations}
            </p>
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
            onClick={handleCopyBilingual}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition hover:scale-105 active:scale-95"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Copied Bilingual Text!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Bilingual Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
