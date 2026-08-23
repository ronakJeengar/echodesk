import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/recording_provider.dart';

class SendInvoiceModal extends ConsumerStatefulWidget {
  final String recordingId;
  final String? initialEmail;
  final String? initialPhone;
  final String? clientName;

  const SendInvoiceModal({
    super.key,
    required this.recordingId,
    this.initialEmail,
    this.initialPhone,
    this.clientName,
  });

  static Future<void> show(
    BuildContext context, {
    required String recordingId,
    String? initialEmail,
    String? initialPhone,
    String? clientName,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SendInvoiceModal(
        recordingId: recordingId,
        initialEmail: initialEmail,
        initialPhone: initialPhone,
        clientName: clientName,
      ),
    );
  }

  @override
  ConsumerState<SendInvoiceModal> createState() => _SendInvoiceModalState();
}

class _SendInvoiceModalState extends ConsumerState<SendInvoiceModal> {
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  String _deliveryMethod = 'EMAIL'; // EMAIL, SMS, BOTH
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.initialEmail ?? '');
    _phoneController = TextEditingController(text: widget.initialPhone ?? '');
  }

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleSend() async {
    setState(() => _isLoading = true);

    try {
      final repo = ref.read(recordingsRepositoryProvider);
      final res = await repo.sendInvoice(
        recordingId: widget.recordingId,
        recipientEmail: _emailController.text.trim().isNotEmpty ? _emailController.text.trim() : null,
        recipientPhone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null,
        deliveryMethod: _deliveryMethod,
      );

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.success,
            content: Text(res.message),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.danger,
            content: Text('Failed to send invoice: $e'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.send_rounded, color: AppColors.primary, size: 20),
                  const SizedBox(width: 8),
                  Text('Send Invoice to Customer', style: AppTypography.h3),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            widget.clientName != null
                ? 'Dispatch work order & invoice report directly to ${widget.clientName}.'
                : 'Dispatch work order & invoice report directly to customer.',
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 16),

          // Method Selector
          Row(
            children: [
              _buildMethodChoice('EMAIL', 'Email PDF', Icons.email_outlined),
              const SizedBox(width: 8),
              _buildMethodChoice('SMS', 'Text SMS', Icons.sms_outlined),
              const SizedBox(width: 8),
              _buildMethodChoice('BOTH', 'Both', Icons.all_inclusive_rounded),
            ],
          ),
          const SizedBox(height: 16),

          if (_deliveryMethod == 'EMAIL' || _deliveryMethod == 'BOTH') ...[
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Customer Email',
                hintText: 'e.g. sarah.jenkins@apex.com',
                prefixIcon: Icon(Icons.mail_outline_rounded, size: 18),
              ),
            ),
            const SizedBox(height: 12),
          ],

          if (_deliveryMethod == 'SMS' || _deliveryMethod == 'BOTH') ...[
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Customer Mobile (SMS)',
                hintText: 'e.g. (555) 019-2834',
                prefixIcon: Icon(Icons.phone_iphone_rounded, size: 18),
              ),
            ),
            const SizedBox(height: 12),
          ],

          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _handleSend,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: _isLoading
                  ? const SizedBox.shrink()
                  : const Icon(Icons.send_rounded, size: 18, color: Colors.black),
              label: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                    )
                  : Text('Dispatch Invoice',
                      style: AppTypography.button.copyWith(color: Colors.black)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMethodChoice(String method, String label, IconData icon) {
    final isSelected = _deliveryMethod == method;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _deliveryMethod = method),
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
      ),
    );
  }
}
