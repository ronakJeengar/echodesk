import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class SafetyAuditSheet extends StatefulWidget {
  final String industry;
  final String workSummary;

  const SafetyAuditSheet({
    super.key,
    this.industry = 'HVAC',
    this.workSummary = '',
  });

  static Future<void> show(
    BuildContext context, {
    String industry = 'HVAC',
    String workSummary = '',
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafetyAuditSheet(
        industry: industry,
        workSummary: workSummary,
      ),
    );
  }

  @override
  State<SafetyAuditSheet> createState() => _SafetyAuditSheetState();
}

class _SafetyAuditSheetState extends State<SafetyAuditSheet> {
  bool _certified = false;

  List<Map<String, String>> _getCheckpoints() {
    final summary = widget.workSummary.toLowerCase();
    final isElec = widget.industry.toLowerCase().contains('elect') || summary.contains('panel') || summary.contains('wire');
    final isPlumb = widget.industry.toLowerCase().contains('plumb') || summary.contains('valve') || summary.contains('pipe');

    if (isElec) {
      return [
        {
          'standard': 'NEC 110.26',
          'title': 'Working Space Clearances',
          'desc': '36" minimum clear depth in front of electrical service panels.',
          'status': 'PASSED',
        },
        {
          'standard': 'NEC 250.50',
          'title': 'Grounding & Bonding Integrity',
          'desc': 'Continuous grounding electrode conductor to ground rod verified.',
          'status': 'PASSED',
        },
        {
          'standard': 'NFPA 70E',
          'title': 'Arc Flash & PPE Verification',
          'desc': 'Insulated hand tools rated 1000V utilized for breaker installations.',
          'status': 'PASSED',
        },
      ];
    } else if (isPlumb) {
      return [
        {
          'standard': 'IPC 608.1',
          'title': 'Backflow Prevention Compliance',
          'desc': 'Dual check valve / vacuum breaker installed on potable supply line.',
          'status': 'PASSED',
        },
        {
          'standard': 'IPC 504.6',
          'title': 'T&P Relief Valve Discharge Line',
          'desc': 'Full-bore gravity drain tube terminating with air gap above floor drain.',
          'status': 'PASSED',
        },
        {
          'standard': 'OSHA 1926.651',
          'title': 'Crawlspace & Gas Ventilation',
          'desc': 'Gas leak sniff test completed on all gas flex connectors.',
          'status': 'PASSED',
        },
      ];
    } else {
      return [
        {
          'standard': 'EPA 608',
          'title': 'Refrigerant Containment',
          'desc': 'Certified zero-loss manifold gauges and recovery cylinder utilized.',
          'status': 'PASSED',
        },
        {
          'standard': 'NFPA 70E',
          'title': 'High-Voltage Lockout / Tagout',
          'desc': 'Service disconnect pulled and capacitor discharged before terminal inspection.',
          'status': 'PASSED',
        },
        {
          'standard': 'IMC 304.3',
          'title': 'Secondary Drain Overflow Switch',
          'desc': 'Float switch sensor tested to shut down cooling on drain clog.',
          'status': 'ADVISORY',
        },
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final checkpoints = _getCheckpoints();

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
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
                      const Icon(Icons.verified_user_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Safety & Code Compliance', style: AppTypography.h3),
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
                'AI trade compliance audit for OSHA, NEC, EPA 608 & Mechanical codes.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Compliance Banner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.success.withValues(alpha: 0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.shield_rounded, color: AppColors.success, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('100% SAFETY COMPLIANT', style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold, color: AppColors.success)),
                          Text('0 Violations · All trade safety checkpoints verified', style: AppTypography.caption),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Checkpoints List
              Expanded(
                child: ListView.separated(
                  controller: scrollController,
                  itemCount: checkpoints.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = checkpoints[index];
                    final isPassed = item['status'] == 'PASSED';

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      item['standard']!,
                                      style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 10),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(item['title']!, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
                                ],
                              ),
                              Icon(
                                isPassed ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                                color: isPassed ? AppColors.success : AppColors.warning,
                                size: 16,
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(item['desc']!, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
                        ],
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 12),

              // Sign-off Checkbox
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: _certified,
                activeColor: AppColors.primary,
                checkColor: Colors.black,
                title: Text(
                  'I certify that PPE, safety lockouts and code clearances were observed on this job.',
                  style: AppTypography.caption.copyWith(color: AppColors.textPrimary),
                ),
                onChanged: (val) => setState(() => _certified = val ?? false),
              ),

              const SizedBox(height: 12),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _certified
                      ? () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: AppColors.success,
                              content: Text('✓ Safety compliance audit certified & archived!'),
                            ),
                          );
                          Navigator.pop(context);
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    'Sign Off & Archive Safety Audit',
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
