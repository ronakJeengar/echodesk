import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_bottom_sheet.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../../core/widgets/metric_tile.dart';
import '../providers/auth_provider.dart';

class ProfileSheet extends ConsumerWidget {
  const ProfileSheet({super.key});

  static Future<void> show(BuildContext context) {
    return AppBottomSheet.show(
      context: context,
      title: 'Contractor Profile',
      subtitle: 'Account, Workspace & Vault Status',
      icon: Icons.person_rounded,
      iconColor: AppColors.primary,
      child: const ProfileSheet(),
    );
  }

  String _getInitials(String name) {
    if (name.isEmpty) return 'ED';
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, name.length >= 2 ? 2 : 1).toUpperCase();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final userName = authState.userName ?? 'Alex Miller';
    final userEmail = authState.userEmail ?? 'alex.miller@apexfield.com';
    final initials = _getInitials(userName);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // User Identity Card
        GlassCard(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.secondary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    initials,
                    style: AppTypography.h3.copyWith(
                      color: Colors.black,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            userName,
                            style: AppTypography.h3,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const StatusPill(label: 'PRO', color: AppColors.success),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      userEmail,
                      style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Workspace & Credentials Details
        Text('Workspace & Trade License', style: AppTypography.h3.copyWith(fontSize: 13)),
        const SizedBox(height: 8),
        GlassCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Column(
            children: [
              _buildInfoRow(
                icon: Icons.business_rounded,
                iconColor: AppColors.primary,
                label: 'Workspace',
                value: 'Apex Heating & Field CRM',
              ),
              const Divider(color: AppColors.border, height: 16),
              _buildInfoRow(
                icon: Icons.handyman_rounded,
                iconColor: AppColors.secondary,
                label: 'Specialization',
                value: 'Master HVAC & Refrigeration',
              ),
              const Divider(color: AppColors.border, height: 16),
              _buildInfoRow(
                icon: Icons.verified_user_rounded,
                iconColor: AppColors.success,
                label: 'EPA Certification',
                value: 'Universal Section 608 Verified',
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Security & Offline Vault Metrics
        Text('Security & Offline Storage', style: AppTypography.h3.copyWith(fontSize: 13)),
        const SizedBox(height: 8),
        const Row(
          children: [
            MetricTile(
              label: 'Offline Vault',
              value: 'AES-256',
              icon: Icons.lock_outline_rounded,
              color: AppColors.primary,
              trend: 'Encrypted',
            ),
            SizedBox(width: 10),
            MetricTile(
              label: 'Cloud Gateway',
              value: 'TLS 1.3',
              icon: Icons.cloud_done_outlined,
              color: AppColors.success,
              trend: 'Active',
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Sign Out Button
        ElevatedButton.icon(
          onPressed: () async {
            Navigator.of(context).pop();
            await ref.read(authNotifierProvider.notifier).logout();
            if (context.mounted) {
              context.go('/login');
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.danger.withValues(alpha: 0.15),
            foregroundColor: AppColors.danger,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: AppColors.danger.withValues(alpha: 0.4)),
            ),
            elevation: 0,
          ),
          icon: const Icon(Icons.logout_rounded, size: 18),
          label: Text('Sign Out of Workspace', style: AppTypography.button.copyWith(color: AppColors.danger)),
        ),
      ],
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 16),
        const SizedBox(width: 10),
        Text(label, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
        const Spacer(),
        Text(
          value,
          style: AppTypography.caption.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
