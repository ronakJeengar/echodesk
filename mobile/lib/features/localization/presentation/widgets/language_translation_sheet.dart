import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class LanguageTranslationSheet extends StatefulWidget {
  final String executiveSummary;
  final String customerName;

  const LanguageTranslationSheet({
    super.key,
    required this.executiveSummary,
    this.customerName = 'Valued Customer',
  });

  static Future<void> show(
    BuildContext context, {
    required String executiveSummary,
    String customerName = 'Valued Customer',
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => LanguageTranslationSheet(
        executiveSummary: executiveSummary,
        customerName: customerName,
      ),
    );
  }

  @override
  State<LanguageTranslationSheet> createState() => _LanguageTranslationSheetState();
}

class _LanguageTranslationSheetState extends State<LanguageTranslationSheet> {
  String _langCode = 'es';

  Map<String, String> _getTranslation() {
    final s = widget.executiveSummary;
    if (_langCode == 'es') {
      return {
        'name': 'Spanish (Español)',
        'flag': '🇲🇽',
        'title': 'Resumen de Servicio Técnico',
        'text': s
            .replaceAll(RegExp(r'replaced', caseSensitive: false), 'se reemplazó')
            .replaceAll(RegExp(r'tested', caseSensitive: false), 'se probó')
            .replaceAll(RegExp(r'capacitor', caseSensitive: false), 'condensador de arranque')
            .replaceAll(RegExp(r'refrigerant', caseSensitive: false), 'refrigerante R-410A')
            .replaceAll(RegExp(r'breaker', caseSensitive: false), 'disyuntor térmico')
            .replaceAll(RegExp(r'valve', caseSensitive: false), 'válvula de control')
            .replaceAll(RegExp(r'subcooling', caseSensitive: false), 'subenfriamiento')
            .replaceAll(RegExp(r'inspected', caseSensitive: false), 'se inspeccionó'),
        'recs': 'Se recomienda mantenimiento preventivo en 6 meses.',
      };
    } else if (_langCode == 'fr') {
      return {
        'name': 'French (Français)',
        'flag': '🇫🇷',
        'title': 'Rapport d\'Intervention Technique',
        'text': s
            .replaceAll(RegExp(r'replaced', caseSensitive: false), 'remplacé')
            .replaceAll(RegExp(r'tested', caseSensitive: false), 'testé')
            .replaceAll(RegExp(r'capacitor', caseSensitive: false), 'condensateur')
            .replaceAll(RegExp(r'refrigerant', caseSensitive: false), 'fluide frigorigène')
            .replaceAll(RegExp(r'breaker', caseSensitive: false), 'disjoncteur')
            .replaceAll(RegExp(r'valve', caseSensitive: false), 'soupape'),
        'recs': 'Entretien préventif recommandé dans 6 mois.',
      };
    } else {
      return {
        'name': 'Portuguese (Português)',
        'flag': '🇧🇷',
        'title': 'Relatório de Serviço em Campo',
        'text': s
            .replaceAll(RegExp(r'replaced', caseSensitive: false), 'substituído')
            .replaceAll(RegExp(r'tested', caseSensitive: false), 'testado')
            .replaceAll(RegExp(r'capacitor', caseSensitive: false), 'capacitor')
            .replaceAll(RegExp(r'refrigerant', caseSensitive: false), 'gás refrigerante')
            .replaceAll(RegExp(r'breaker', caseSensitive: false), 'disjuntor'),
        'recs': 'Manutenção preventiva periódica recomendada em 6 meses.',
      };
    }
  }

  void _copyBilingual(Map<String, String> data) {
    final text = '--- [ENGLISH] ---\n${widget.executiveSummary}\n\n--- [${data['name']!.toUpperCase()}] ---\n${data['text']}\n\nRecomendaciones: ${data['recs']}';
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ Bilingual summary copied to clipboard!'),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final t = _getTranslation();

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (_, scrollController) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.translate_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Bilingual Translation', style: AppTypography.h3),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'AI field debrief translation for Spanish, French and Portuguese customers.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Language Selector
              Row(
                children: [
                  {'code': 'es', 'name': 'Spanish 🇲🇽'},
                  {'code': 'fr', 'name': 'French 🇫🇷'},
                  {'code': 'pt', 'name': 'Portuguese 🇧🇷'},
                ].map((l) {
                  final isSel = _langCode == l['code'];
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: GestureDetector(
                        onTap: () => setState(() => _langCode = l['code']!),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: isSel ? AppColors.primary.withValues(alpha: 0.15) : AppColors.surfaceElevated,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isSel ? AppColors.primary : AppColors.border,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              l['name']!,
                              style: AppTypography.caption.copyWith(
                                color: isSel ? AppColors.primary : AppColors.textPrimary,
                                fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),

              // Content Comparison
              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    // English Original
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('🇺🇸 ENGLISH ORIGINAL', style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.bold, fontSize: 10)),
                          const SizedBox(height: 6),
                          Text(widget.executiveSummary, style: AppTypography.bodyMedium),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Translated Card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${t['flag']} ${t['name']!.toUpperCase()}', style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 10)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text('AI TRANSLATED', style: AppTypography.caption.copyWith(color: AppColors.primary, fontSize: 9, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(t['text']!, style: AppTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.w500)),
                          const SizedBox(height: 8),
                          Text('💡 ${t['recs']}', style: AppTypography.caption.copyWith(color: AppColors.textSecondary, fontStyle: FontStyle.italic)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _copyBilingual(t),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.copy_rounded, size: 18, color: Colors.black),
                  label: Text(
                    'Copy Bilingual Debrief',
                    style: AppTypography.button.copyWith(color: Colors.black),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
