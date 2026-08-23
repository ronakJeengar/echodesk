import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class ReviewRequestSheet extends StatefulWidget {
  final String customerName;
  final String? customerPhone;
  final String? customerEmail;
  final String serviceDescription;

  const ReviewRequestSheet({
    super.key,
    this.customerName = 'Valued Customer',
    this.customerPhone,
    this.customerEmail,
    this.serviceDescription = 'Field Service Visit',
  });

  static Future<void> show(
    BuildContext context, {
    String customerName = 'Valued Customer',
    String? customerPhone,
    String? customerEmail,
    String serviceDescription = 'Field Service Visit',
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => ReviewRequestSheet(
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        serviceDescription: serviceDescription,
      ),
    );
  }

  @override
  State<ReviewRequestSheet> createState() => _ReviewRequestSheetState();
}

class _ReviewRequestSheetState extends State<ReviewRequestSheet> {
  String _platform = 'Google';

  String get _reviewUrl {
    if (_platform == 'Google') return 'https://g.page/r/echodesk-service/review';
    if (_platform == 'Yelp') return 'https://www.yelp.com/biz/echodesk-field-service';
    return 'https://www.trustpilot.com/evaluate/echodesk.com';
  }

  String get _message {
    return 'Hi ${widget.customerName}, thank you for choosing EchoDesk for your ${widget.serviceDescription}! If you were satisfied with our service today, could you take 30 seconds to leave us a 5-star review on $_platform? $_reviewUrl';
  }

  void _copy() {
    Clipboard.setData(ClipboardData(text: _message));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ 5-Star review link & message copied!'),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${Uri.encodeComponent(_reviewUrl)}&bgcolor=111726&color=10B981';

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
                      const Icon(Icons.star_rounded, color: Colors.amber, size: 24),
                      const SizedBox(width: 8),
                      Text('5-Star Review Request', style: AppTypography.h3),
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
                'Show on-screen QR code or text Google / Yelp review invitation.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Platform Selector
              Row(
                children: ['Google', 'Yelp', 'Trustpilot'].map((p) {
                  final isSel = _platform == p;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: GestureDetector(
                        onTap: () => setState(() => _platform = p),
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
                              '$p ★',
                              style: AppTypography.caption.copyWith(
                                color: isSel ? AppColors.primary : AppColors.textPrimary,
                                fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
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

              // QR Code and Info Section
              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                            ),
                            child: Image.network(
                              qrUrl,
                              width: 140,
                              height: 140,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => Container(
                                width: 140,
                                height: 140,
                                color: AppColors.surface,
                                child: const Icon(Icons.qr_code_rounded, size: 80, color: AppColors.primary),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text('Hold camera up to scan & review', style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 12),
                          Text(
                            _message,
                            style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _copy,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.border),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.copy_rounded, size: 18),
                      label: Text('Copy Text', style: AppTypography.button),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.success,
                            content: Text('✓ Review SMS invitation prepared for ${widget.customerName}!'),
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
                      icon: const Icon(Icons.send_rounded, size: 18, color: Colors.black),
                      label: Text(
                        'Send SMS',
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
