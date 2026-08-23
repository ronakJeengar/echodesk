import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class MaintenanceAgreementSheet extends StatefulWidget {
  final String customerName;
  final String equipmentSummary;

  const MaintenanceAgreementSheet({
    super.key,
    this.customerName = 'Valued Customer',
    this.equipmentSummary = 'Central HVAC System',
  });

  static Future<void> show(
    BuildContext context, {
    String customerName = 'Valued Customer',
    String equipmentSummary = 'Central HVAC System',
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => MaintenanceAgreementSheet(
        customerName: customerName,
        equipmentSummary: equipmentSummary,
      ),
    );
  }

  @override
  State<MaintenanceAgreementSheet> createState() => _MaintenanceAgreementSheetState();
}

class _MaintenanceAgreementSheetState extends State<MaintenanceAgreementSheet> {
  String _selectedTier = 'gold';
  bool _isAnnual = true;

  final Map<String, Map<String, dynamic>> _tiers = {
    'silver': {
      'name': 'Silver Seasonal Care',
      'monthly': 19,
      'annual': 199,
      'badge': 'Essential',
      'benefits': [
        '2 Seasonal precision tune-ups / yr',
        '21-Point safety check & coil flush',
        '5% Discount on replacement parts',
      ],
    },
    'gold': {
      'name': 'Gold Priority Club',
      'monthly': 29,
      'annual': 299,
      'badge': 'Most Popular ★',
      'benefits': [
        '2 Seasonal tune-ups with coil wash',
        '15% Discount on all repairs & parts',
        'Guaranteed same-day dispatch priority',
        'No weekend or overtime surcharges',
      ],
    },
    'platinum': {
      'name': 'Platinum Total Shield',
      'monthly': 49,
      'annual': 499,
      'badge': 'VIP Total Care',
      'benefits': [
        'Unlimited seasonal tune-ups & filter swaps',
        '20% Discount on all repairs + \$500 accrual',
        'Zero diagnostic dispatch fees',
        '24/7 VIP emergency dispatch line',
      ],
    },
  };

  void _copyProposal() {
    final t = _tiers[_selectedTier]!;
    final price = _isAnnual ? '\$${t['annual']}/yr' : '\$${t['monthly']}/mo';
    final text = 'EchoDesk Maintenance Agreement: ${widget.customerName} | Plan: ${t['name']} ($price) | Equipment: ${widget.equipmentSummary}';
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ PMA proposal copied to clipboard!'),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final currentTier = _tiers[_selectedTier]!;
    final price = _isAnnual ? '\$${currentTier['annual']} / year' : '\$${currentTier['monthly']} / month';

    return DraggableScrollableSheet(
      initialChildSize: 0.78,
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
                      const Icon(Icons.card_membership_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Maintenance Agreement', style: AppTypography.h3),
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
                'Pitch recurring service club memberships & VIP warranty plans.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Billing Toggle
              Center(
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GestureDetector(
                        onTap: () => setState(() => _isAnnual = false),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: !_isAnnual ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('Monthly', style: AppTypography.caption.copyWith(color: !_isAnnual ? Colors.black : AppColors.textSecondary, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => setState(() => _isAnnual = true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: _isAnnual ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('Annual (Save 15%)', style: AppTypography.caption.copyWith(color: _isAnnual ? Colors.black : AppColors.textSecondary, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Plan Cards
              Row(
                children: _tiers.entries.map((entry) {
                  final key = entry.key;
                  final t = entry.value;
                  final isSel = _selectedTier == key;
                  final p = _isAnnual ? '\$${t['annual']}/yr' : '\$${t['monthly']}/mo';

                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedTier = key),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSel ? AppColors.primary.withValues(alpha: 0.15) : AppColors.surfaceElevated,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSel ? AppColors.primary : AppColors.border,
                              width: isSel ? 1.5 : 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(t['badge'] as String, style: AppTypography.caption.copyWith(color: isSel ? AppColors.primary : AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(t['name'] as String, style: AppTypography.caption.copyWith(fontWeight: FontWeight.bold, fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 6),
                              Text(p, style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold, color: isSel ? AppColors.primaryLight : AppColors.textPrimary)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),

              // Benefits Details
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: ListView(
                    controller: scrollController,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(currentTier['name'] as String, style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
                          Text(price, style: AppTypography.bodyMedium.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Divider(height: 1, color: AppColors.border),
                      const SizedBox(height: 10),

                      ...((currentTier['benefits'] as List<String>).map((b) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 16),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(b, style: AppTypography.caption.copyWith(color: AppColors.textPrimary)),
                              ),
                            ],
                          ),
                        );
                      })),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Actions
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _copyProposal,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.border),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.copy_rounded, size: 18),
                      label: Text('Copy Proposal', style: AppTypography.button),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.success,
                            content: Text('✓ ${widget.customerName} enrolled in ${currentTier['name']}!'),
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
                      icon: const Icon(Icons.verified_rounded, size: 18, color: Colors.black),
                      label: Text(
                        'Enroll Customer',
                        style: AppTypography.button.copyWith(color: Colors.black),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
