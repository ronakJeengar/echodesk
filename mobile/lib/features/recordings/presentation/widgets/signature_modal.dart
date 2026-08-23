import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class SignatureModal extends StatefulWidget {
  final String? initialSignerName;
  final Function(String signerName, String signerRole) onSigned;

  const SignatureModal({
    super.key,
    this.initialSignerName,
    required this.onSigned,
  });

  static Future<void> show(
    BuildContext context, {
    String? initialSignerName,
    required Function(String signerName, String signerRole) onSigned,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SignatureModal(
        initialSignerName: initialSignerName,
        onSigned: onSigned,
      ),
    );
  }

  @override
  State<SignatureModal> createState() => _SignatureModalState();
}

class _SignatureModalState extends State<SignatureModal> {
  final List<Offset?> _points = [];
  late TextEditingController _nameController;
  String _signerRole = 'CUSTOMER';

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialSignerName ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _clearSignature() {
    setState(() {
      _points.clear();
    });
  }

  void _handleConfirm() {
    final name = _nameController.text.trim().isNotEmpty
        ? _nameController.text.trim()
        : (_signerRole == 'CUSTOMER' ? 'Customer' : 'Field Technician');

    widget.onSigned(name, _signerRole);
    Navigator.pop(context);
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
                  const Icon(Icons.draw_rounded, color: AppColors.primary, size: 20),
                  const SizedBox(width: 8),
                  Text('Capture Digital Signature', style: AppTypography.h3),
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
            'Sign on screen below to authorize work order diagnostics and pricing.',
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 16),

          // Signer Role
          Row(
            children: [
              _buildRoleChoice('CUSTOMER', 'Customer Approval', Icons.person_outline_rounded),
              const SizedBox(width: 8),
              _buildRoleChoice('TECHNICIAN', 'Lead Technician', Icons.engineering_outlined),
            ],
          ),
          const SizedBox(height: 12),

          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Signer Full Name',
              hintText: 'e.g. Sarah Jenkins',
              prefixIcon: Icon(Icons.badge_outlined, size: 18),
            ),
          ),
          const SizedBox(height: 14),

          // Drawing Canvas Pad
          Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.surfaceElevated,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Stack(
                children: [
                  GestureDetector(
                    onPanUpdate: (details) {
                      final box = context.findRenderObject() as RenderBox?;
                      if (box != null) {
                        setState(() {
                          _points.add(details.localPosition);
                        });
                      }
                    },
                    onPanEnd: (_) => setState(() => _points.add(null)),
                    child: CustomPaint(
                      painter: _SignaturePainter(points: _points),
                      size: Size.infinite,
                    ),
                  ),
                  if (_points.isEmpty)
                    Center(
                      child: Text(
                        '✍️ Draw signature here with finger or stylus',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                    ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: TextButton.icon(
                      onPressed: _clearSignature,
                      icon: const Icon(Icons.refresh_rounded, size: 14, color: AppColors.textMuted),
                      label: Text('Clear', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _points.isEmpty ? null : _handleConfirm,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Icon(Icons.check_circle_rounded, size: 18, color: Colors.black),
              label: Text(
                'Accept Signature & Approve Order',
                style: AppTypography.button.copyWith(color: Colors.black),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleChoice(String role, String label, IconData icon) {
    final isSelected = _signerRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _signerRole = role),
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

class _SignaturePainter extends CustomPainter {
  final List<Offset?> points;

  _SignaturePainter({required this.points});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primaryLight
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 3.0;

    for (int i = 0; i < points.length - 1; i++) {
      if (points[i] != null && points[i + 1] != null) {
        canvas.drawLine(points[i]!, points[i + 1]!, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SignaturePainter oldDelegate) => true;
}
