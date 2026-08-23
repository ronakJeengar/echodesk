import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primaryGlow,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.5)),
              ),
              child: const Icon(Icons.graphic_eq_rounded, color: AppColors.primary, size: 18),
            ),
            const SizedBox(width: 10),
            Text('EchoDesk', style: AppTypography.h3),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: AppColors.textSecondary),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Hero Voice Action Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF132238), Color(0xFF0C1424)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'AI VOICE AGENT ACTIVE',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text('Record On-Site Notes', style: AppTypography.h2),
                const SizedBox(height: 6),
                Text(
                  'Speak naturally after your job or client meeting. EchoDesk extracts tasks, costs, and updates your CRM automatically.',
                  style: AppTypography.bodyMedium,
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: () => context.push('/record'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.mic_rounded, size: 20),
                  label: Text('Start Voice Note', style: AppTypography.button.copyWith(color: Colors.black)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Daily Stats Row
          Row(
            children: [
              _buildStatCard('Voice Notes', '12', Icons.mic_none_rounded, AppColors.primary),
              const SizedBox(width: 12),
              _buildStatCard('Extracted Tasks', '28', Icons.check_circle_outline_rounded, AppColors.success),
              const SizedBox(width: 12),
              _buildStatCard('Time Saved', '2.4 hrs', Icons.timer_outlined, AppColors.secondary),
            ],
          ),
          const SizedBox(height: 24),

          // Recent Voice Extractions Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Recent Voice Notes', style: AppTypography.h3),
              TextButton(
                onPressed: () {},
                child: Text('View All', style: AppTypography.caption.copyWith(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          _buildRecentNoteTile(
            customerName: 'Sarah Jenkins (Apex Logistics)',
            summary: 'Replaced faulty AC capacitor, scheduled follow-up invoice.',
            timeAgo: '15 mins ago',
            status: 'COMPLETED',
            cost: '\$285.00',
          ),
          const SizedBox(height: 10),
          _buildRecentNoteTile(
            customerName: 'Marcus Vance (Oakwood Dental)',
            summary: 'Plumbing leak inspection in room 3, ordered replacement valve.',
            timeAgo: '2 hours ago',
            status: 'COMPLETED',
            cost: '\$450.00',
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 10),
            Text(value, style: AppTypography.h3.copyWith(fontSize: 18)),
            const SizedBox(height: 2),
            Text(title, style: AppTypography.caption),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentNoteTile({
    required String customerName,
    required String summary,
    required String timeAgo,
    required String status,
    required String cost,
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
              Expanded(
                child: Text(
                  customerName,
                  style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  cost,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.success,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(summary, style: AppTypography.bodyMedium),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(timeAgo, style: AppTypography.caption),
              const Spacer(),
              const Icon(Icons.auto_awesome_rounded, size: 14, color: AppColors.primary),
              const SizedBox(width: 4),
              Text(
                'AI Extracted',
                style: AppTypography.caption.copyWith(color: AppColors.primary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
