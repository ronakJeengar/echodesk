import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class CustomerPortalSheet extends StatefulWidget {
  final String customerName;
  final String customerPhone;
  final String address;
  final String jobSummary;
  final double quotedAmount;
  final String recordingId;

  const CustomerPortalSheet({
    super.key,
    this.customerName = 'Valued Customer',
    this.customerPhone = '(555) 234-5678',
    this.address = '742 Evergreen Terrace',
    this.jobSummary = 'Field Service Visit',
    this.quotedAmount = 385.0,
    this.recordingId = 'rec-1',
  });

  static Future<void> show(
    BuildContext context, {
    String customerName = 'Valued Customer',
    String customerPhone = '(555) 234-5678',
    String address = '742 Evergreen Terrace',
    String jobSummary = 'Field Service Visit',
    double quotedAmount = 385.0,
    String recordingId = 'rec-1',
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => CustomerPortalSheet(
        customerName: customerName,
        customerPhone: customerPhone,
        address: address,
        jobSummary: jobSummary,
        quotedAmount: quotedAmount,
        recordingId: recordingId,
      ),
    );
  }

  @override
  State<CustomerPortalSheet> createState() => _CustomerPortalSheetState();
}

class _CustomerPortalSheetState extends State<CustomerPortalSheet> {
  String _status = 'EN_ROUTE';

  String get _portalUrl => 'https://echodesk.app/portal/job-${widget.recordingId.substring(0, widget.recordingId.length > 8 ? 8 : widget.recordingId.length)}';

  void _copyPortalLink() {
    Clipboard.setData(ClipboardData(text: _portalUrl));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ Live customer portal tracking link copied!'),
      ),
    );
  }

  void _dispatchEtaSms() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ "On My Way" ETA SMS sent to ${widget.customerPhone}!'),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
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
                      const Icon(Icons.language_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Customer Live Portal & ETA', style: AppTypography.h3),
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
                'Send live GPS tracking, technician profile, and instant online pay link.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Status Selector
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    _buildStatusTab('EN_ROUTE', '🚗 En Route (12m)'),
                    _buildStatusTab('ON_SITE', '🔧 On-Site'),
                    _buildStatusTab('COMPLETED', '✓ Completed'),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Portal Preview Card
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                  ),
                  child: ListView(
                    controller: scrollController,
                    children: [
                      // Technician Bio
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(
                              child: Text('AM', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text('Alex Miller', style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
                                    const SizedBox(width: 6),
                                    const Icon(Icons.verified_rounded, color: AppColors.primary, size: 14),
                                  ],
                                ),
                                Text('Lead Field Technician · Lic #HVAC-94821', style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      const Divider(height: 1, color: AppColors.border),
                      const SizedBox(height: 14),

                      // Job Info
                      _buildInfoRow('Customer', widget.customerName),
                      _buildInfoRow('Location', widget.address),
                      _buildInfoRow('Service Scope', widget.jobSummary),
                      _buildInfoRow('Total Amount Due', '\$${widget.quotedAmount.toStringAsFixed(2)}', isHighlight: true),
                      const SizedBox(height: 10),

                      // Security Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.shield_rounded, color: AppColors.success, size: 16),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'EchoDesk Verified · Encrypted Online Pay Ready',
                                style: AppTypography.caption.copyWith(color: AppColors.success, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _copyPortalLink,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.border),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.copy_rounded, size: 18),
                      label: Text('Copy Link', style: AppTypography.button),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _dispatchEtaSms,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.send_rounded, size: 18, color: Colors.black),
                      label: Text(
                        'Send ETA SMS',
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

  Widget _buildStatusTab(String statusKey, String label) {
    final isSel = _status == statusKey;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _status = statusKey),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSel ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Text(
              label,
              style: AppTypography.caption.copyWith(
                color: isSel ? Colors.black : AppColors.textSecondary,
                fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                fontSize: 10,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: isHighlight ? AppColors.primaryLight : AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
