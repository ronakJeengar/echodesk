import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class JobsPage extends StatelessWidget {
  const JobsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Field Jobs & Tasks', style: AppTypography.h3),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildJobCard(
            title: 'Emergency AC Capacitor Replacement',
            customer: 'Sarah Jenkins (Apex Logistics)',
            status: 'COMPLETED',
            statusColor: AppColors.success,
            date: 'Today, 2:30 PM',
            quoted: '\$285.00',
          ),
          const SizedBox(height: 12),
          _buildJobCard(
            title: 'Quarterly Rooftop HVAC Inspection',
            customer: 'Westlake Tech Center',
            status: 'IN PROGRESS',
            statusColor: AppColors.warning,
            date: 'Today, 4:00 PM',
            quoted: '\$650.00',
          ),
          const SizedBox(height: 12),
          _buildJobCard(
            title: 'Thermostat Wiring Diagnostic',
            customer: 'Oakwood Dental Clinic',
            status: 'SCHEDULED',
            statusColor: AppColors.primary,
            date: 'Tomorrow, 9:00 AM',
            quoted: '\$150.00',
          ),
        ],
      ),
    );
  }

  Widget _buildJobCard({
    required String title,
    required String customer,
    required String status,
    required Color statusColor,
    required String date,
    required String quoted,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
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
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: AppTypography.caption.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                quoted,
                style: AppTypography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(title, style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(customer, style: AppTypography.bodyMedium),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.schedule_rounded, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(date, style: AppTypography.caption),
            ],
          ),
        ],
      ),
    );
  }
}
