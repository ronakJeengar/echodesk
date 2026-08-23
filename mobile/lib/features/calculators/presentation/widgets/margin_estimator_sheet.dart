import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class MarginEstimatorSheet extends StatefulWidget {
  const MarginEstimatorSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const MarginEstimatorSheet(),
    );
  }

  @override
  State<MarginEstimatorSheet> createState() => _MarginEstimatorSheetState();
}

class _MarginEstimatorSheetState extends State<MarginEstimatorSheet> {
  final List<Map<String, dynamic>> _parts = [
    {'name': '45/5 MFD Dual-Run Capacitor', 'qty': 1, 'cost': 35.0},
    {'name': 'R-410A Refrigerant (lbs)', 'qty': 2, 'cost': 45.0},
    {'name': '2-Pole 30A Contactor', 'qty': 1, 'cost': 28.0},
  ];

  double _laborHours = 2.0;
  final double _laborRate = 125.0;
  double _targetMargin = 45.0;
  final double _taxRate = 7.5;

  void _addPart() {
    setState(() {
      _parts.add({'name': 'Additional Part', 'qty': 1, 'cost': 25.0});
    });
  }

  void _removePart(int idx) {
    setState(() {
      _parts.removeAt(idx);
    });
  }

  @override
  Widget build(BuildContext context) {
    final totalPartsCost = _parts.fold<double>(
      0.0,
      (sum, item) => sum + ((item['qty'] as int) * (item['cost'] as double)),
    );
    final totalLaborCost = _laborHours * _laborRate;
    final directCost = totalPartsCost + totalLaborCost;

    final marginDecimal = _targetMargin / 100.0;
    final subtotalWithMargin = marginDecimal < 1.0 ? directCost / (1 - marginDecimal) : directCost * 1.5;
    final grossProfit = subtotalWithMargin - directCost;
    final tax = (subtotalWithMargin * _taxRate) / 100.0;
    final finalQuoteTotal = subtotalWithMargin + tax;

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
                      const Icon(Icons.trending_up_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Margin & Quote Estimator', style: AppTypography.h3),
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
                'Instant material markup, labor billing & gross margin pricing.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Parts List Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('PARTS & MATERIALS', style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                  InkWell(
                    onTap: _addPart,
                    child: Row(
                      children: [
                        const Icon(Icons.add_rounded, size: 14, color: AppColors.primary),
                        Text('Add Part', style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    ..._parts.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final p = entry.value;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceElevated,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(p['name'] as String, style: AppTypography.bodyMedium),
                            ),
                            Text('${p['qty']}x \$${(p['cost'] as double).toStringAsFixed(2)}', style: AppTypography.caption.copyWith(color: AppColors.textSecondary, fontFamily: 'monospace')),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: () => _removePart(idx),
                              child: const Icon(Icons.close_rounded, size: 16, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      );
                    }),
                    const SizedBox(height: 12),

                    // Sliders & Rates
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Target Gross Margin:', style: AppTypography.bodyMedium),
                        Text('${_targetMargin.toInt()}%', style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold, color: AppColors.primary)),
                      ],
                    ),
                    Slider(
                      value: _targetMargin,
                      min: 20,
                      max: 65,
                      divisions: 9,
                      activeColor: AppColors.primary,
                      onChanged: (v) => setState(() => _targetMargin = v),
                    ),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Labor Time: ${_laborHours.toStringAsFixed(1)} hrs', style: AppTypography.bodyMedium),
                        Text('Hourly Rate: \$${_laborRate.toInt()}/hr', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                      ],
                    ),
                    Slider(
                      value: _laborHours,
                      min: 0.5,
                      max: 8.0,
                      divisions: 15,
                      activeColor: AppColors.secondary,
                      onChanged: (v) => setState(() => _laborHours = v),
                    ),

                    const SizedBox(height: 12),

                    // Financial Profit Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
                      ),
                      child: Column(
                        children: [
                          _buildRow('Direct Job Cost (Parts + Labor)', '\$${directCost.toStringAsFixed(2)}'),
                          _buildRow('Gross Profit (${_targetMargin.toInt()}%)', '+\$${grossProfit.toStringAsFixed(2)}', color: AppColors.success),
                          _buildRow('Estimated Tax ($_taxRate%)', '\$${tax.toStringAsFixed(2)}'),
                          const Divider(height: 16, color: AppColors.border),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('FINAL QUOTED TOTAL', style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
                              Text('\$${finalQuoteTotal.toStringAsFixed(2)}', style: AppTypography.h2.copyWith(color: AppColors.primary)),
                            ],
                          ),
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
                  onPressed: () {
                    final summary = 'Estimate (${_targetMargin.toInt()}% Margin): Cost \$${directCost.toStringAsFixed(2)} | Profit \$${grossProfit.toStringAsFixed(2)} | Total \$${finalQuoteTotal.toStringAsFixed(2)}';
                    Clipboard.setData(ClipboardData(text: summary));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: AppColors.success,
                        content: Text('✓ Quote estimate copied to clipboard!'),
                      ),
                    );
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.copy_rounded, size: 18, color: Colors.black),
                  label: Text(
                    'Copy Quote Estimate',
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

  Widget _buildRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
          Text(
            value,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: color ?? AppColors.textPrimary,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }
}
