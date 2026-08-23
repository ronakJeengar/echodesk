import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class FollowUpComposerSheet extends StatefulWidget {
  final String customerName;
  final String customerPhone;
  final String customerEmail;
  final String jobSummary;

  const FollowUpComposerSheet({
    super.key,
    required this.customerName,
    this.customerPhone = '(555) 234-5678',
    this.customerEmail = 'customer@example.com',
    this.jobSummary = 'Completed AC diagnostic, replaced 45/5 MFD dual-run capacitor, and verified 12°F subcooling.',
  });

  static Future<void> show(
    BuildContext context, {
    required String customerName,
    String? customerPhone,
    String? customerEmail,
    String? jobSummary,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => FollowUpComposerSheet(
        customerName: customerName,
        customerPhone: customerPhone ?? '(555) 234-5678',
        customerEmail: customerEmail ?? 'customer@example.com',
        jobSummary: jobSummary ?? 'Completed field inspection and service operations.',
      ),
    );
  }

  @override
  State<FollowUpComposerSheet> createState() => _FollowUpComposerSheetState();
}

class _FollowUpComposerSheetState extends State<FollowUpComposerSheet> {
  String _channel = 'SMS';
  String _tone = 'FRIENDLY';

  String _generateMessage() {
    if (_channel == 'SMS') {
      if (_tone == 'FRIENDLY') {
        return 'Hi ${widget.customerName}! 🌟 Alex from Apex Services here. Thank you for having us out! We ${widget.jobSummary.toLowerCase()} Everything is running smoothly. Leave us a quick review: https://g.page/r/apex';
      } else if (_tone == 'PROFESSIONAL') {
        return 'Hello ${widget.customerName}, your service visit is complete. Summary: ${widget.jobSummary} All parts carry our standard 1-year warranty. Direct support: (555) 019-2831.';
      } else {
        return 'Apex Services: Work complete for ${widget.customerName}. ${widget.jobSummary} Thank you for your business!';
      }
    } else {
      if (_tone == 'FRIENDLY') {
        return 'Dear ${widget.customerName},\n\nThank you for choosing Apex Services! We completed your service call today.\n\nSummary of Work:\n• ${widget.jobSummary}\n\nAll parts installed carry our 1-year warranty. Please let us know if you need anything else!\n\nWarm regards,\nAlex Miller\nApex Services';
      } else {
        return 'Attention: ${widget.customerName}\n\nThis email confirms completion of field operations.\n\nScope of Work:\n${widget.jobSummary}\n\nYour account statement and invoice have been updated.\n\nSincerely,\nApex Operations Team';
      }
    }
  }

  void _copyToClipboard() {
    final msg = _generateMessage();
    Clipboard.setData(ClipboardData(text: msg));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ Follow-up draft copied to clipboard!'),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final messageText = _generateMessage();

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
                      const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('AI Follow-Up Composer', style: AppTypography.h3),
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
                'Generate instant post-service SMS or Email for ${widget.customerName}.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Channel Toggle
              Row(
                children: [
                  Expanded(
                    child: _buildOptionTab(
                      'SMS',
                      'SMS Text',
                      Icons.chat_bubble_outline_rounded,
                      _channel == 'SMS',
                      () => setState(() => _channel = 'SMS'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildOptionTab(
                      'EMAIL',
                      'Email Draft',
                      Icons.mail_outline_rounded,
                      _channel == 'EMAIL',
                      () => setState(() => _channel = 'EMAIL'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Tone Selectors
              Row(
                children: [
                  _buildTonePill('FRIENDLY', '🌟 Friendly'),
                  const SizedBox(width: 6),
                  _buildTonePill('PROFESSIONAL', '💼 Professional'),
                  const SizedBox(width: 6),
                  _buildTonePill('CONCISE', '⚡ Concise'),
                ],
              ),
              const SizedBox(height: 14),

              // Message Preview Card
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: ListView(
                    controller: scrollController,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'To: ${_channel == 'SMS' ? widget.customerPhone : widget.customerEmail}',
                            style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                          ),
                          if (_channel == 'SMS')
                            Text(
                              '${messageText.length} chars',
                              style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Divider(height: 1, color: AppColors.border),
                      const SizedBox(height: 10),
                      SelectableText(
                        messageText,
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary, height: 1.5),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Copy & Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _copyToClipboard,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.send_rounded, size: 18, color: Colors.black),
                  label: Text(
                    'Copy Draft & Open ${_channel == 'SMS' ? 'Messenger' : 'Email'}',
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

  Widget _buildOptionTab(String key, String label, IconData icon, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.15) : AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: isSelected ? AppColors.primary : AppColors.textMuted),
            const SizedBox(width: 6),
            Text(
              label,
              style: AppTypography.caption.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTonePill(String key, String label) {
    final isSelected = _tone == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tone = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.surface : AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: AppTypography.caption.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 10,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
