import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class SitePhotosSheet extends StatefulWidget {
  final String customerName;

  const SitePhotosSheet({
    super.key,
    this.customerName = 'Valued Customer',
  });

  static Future<void> show(
    BuildContext context, {
    String customerName = 'Valued Customer',
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SitePhotosSheet(customerName: customerName),
    );
  }

  @override
  State<SitePhotosSheet> createState() => _SitePhotosSheetState();
}

class _SitePhotosSheetState extends State<SitePhotosSheet> {
  final List<Map<String, dynamic>> _photos = [
    {
      'type': 'BEFORE',
      'caption': 'Swollen dual-run capacitor & burnt contactor switch',
      'tags': ['Damaged Part', 'Arc Burn', 'Low Voltage'],
      'time': '10:14 AM',
    },
    {
      'type': 'AFTER',
      'caption': 'New 45/5 MFD Titan Pro capacitor & 30A contactor installed',
      'tags': ['Installed Part', 'Torque Verified', 'Tested 240V'],
      'time': '10:48 AM',
    },
  ];

  void _addPhoto() {
    setState(() {
      _photos.add({
        'type': 'AFTER',
        'caption': 'Digital manifold gauge reading 118 PSI / 9.8°F subcooling',
        'tags': ['EPA Verified', 'Closed Loop'],
        'time': 'Just now',
      });
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ Diagnostic photo attached to job record!'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
                      const Icon(Icons.camera_alt_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Job Site Photos & Tags', style: AppTypography.h3),
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
                'Before & after equipment photos with AI damage tags.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Photo List
              Expanded(
                child: ListView.separated(
                  controller: scrollController,
                  itemCount: _photos.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = _photos[index];
                    final isBefore = item['type'] == 'BEFORE';

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: isBefore ? AppColors.danger.withValues(alpha: 0.2) : AppColors.success.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  item['type'] as String,
                                  style: AppTypography.caption.copyWith(
                                    color: isBefore ? AppColors.danger : AppColors.success,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                              Text(item['time'] as String, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                            ],
                          ),
                          const SizedBox(height: 8),

                          // Mock Photo Image Container
                          Container(
                            height: 120,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    isBefore ? Icons.broken_image_rounded : Icons.verified_rounded,
                                    size: 36,
                                    color: isBefore ? AppColors.danger : AppColors.primary,
                                  ),
                                  const SizedBox(height: 4),
                                  Text('Equipment Visual Evidence #${index + 1}', style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),

                          Text(item['caption'] as String, style: AppTypography.bodyMedium),
                          const SizedBox(height: 8),

                          // Badges
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            children: (item['tags'] as List<String>).map((t) {
                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.surface,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                                ),
                                child: Text('🏷️ $t', style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.primaryLight)),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 12),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _addPhoto,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.primary, width: 1.2),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.add_a_photo_rounded, size: 18, color: AppColors.primary),
                      label: Text('Take Photo', style: AppTypography.button.copyWith(color: AppColors.primary)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.check_circle_rounded, size: 18, color: Colors.black),
                      label: Text(
                        'Done',
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
