import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/dashboard_provider.dart';
import '../../../recordings/presentation/providers/offline_sync_provider.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);
    final pendingOfflineAsync = ref.watch(pendingRecordingsProvider);
    final isSyncing = ref.watch(offlineSyncProvider);

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
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary),
            onPressed: () {
              ref.invalidate(dashboardStatsProvider);
              ref.invalidate(pendingRecordingsProvider);
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dashboardStatsProvider);
          ref.invalidate(pendingRecordingsProvider);
        },
        color: AppColors.primary,
        backgroundColor: AppColors.surface,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Offline Vault Pending Sync Banner
            pendingOfflineAsync.when(
              data: (pendingList) {
                if (pendingList.isEmpty) return const SizedBox.shrink();

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.warning.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.cloud_off_rounded, color: AppColors.warning, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${pendingList.length} Offline Voice Note${pendingList.length > 1 ? 's' : ''} Cached',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.warning,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              'Recorded off-grid. Ready to sync with PostgreSQL CRM.',
                              style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: isSyncing
                            ? null
                            : () async {
                                final count = await ref
                                    .read(offlineSyncProvider.notifier)
                                    .syncPendingRecordings();
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      backgroundColor: AppColors.success,
                                      content: Text('Synced $count offline voice notes to CRM!'),
                                    ),
                                  );
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.warning,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          elevation: 0,
                        ),
                        child: isSyncing
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                              )
                            : Text('Sync Now',
                                style: AppTypography.caption.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black,
                                )),
                      ),
                    ],
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),

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
            statsAsync.when(
              data: (stats) => Row(
                children: [
                  _buildStatCard('Voice Hours', '${stats.totalVoiceHours}h', Icons.mic_none_rounded, AppColors.primary),
                  const SizedBox(width: 12),
                  _buildStatCard('Active Jobs', '${stats.totalJobs}', Icons.build_outlined, AppColors.secondary),
                  const SizedBox(width: 12),
                  _buildStatCard('Tasks To-Do', '${stats.pendingTasks}', Icons.check_circle_outline_rounded, AppColors.success),
                ],
              ),
              loading: () => Row(
                children: [
                  _buildStatCard('Voice Hours', '...', Icons.mic_none_rounded, AppColors.primary),
                  const SizedBox(width: 12),
                  _buildStatCard('Active Jobs', '...', Icons.build_outlined, AppColors.secondary),
                  const SizedBox(width: 12),
                  _buildStatCard('Tasks To-Do', '...', Icons.check_circle_outline_rounded, AppColors.success),
                ],
              ),
              error: (_, __) => Row(
                children: [
                  _buildStatCard('Voice Hours', '0.0h', Icons.mic_none_rounded, AppColors.primary),
                  const SizedBox(width: 12),
                  _buildStatCard('Active Jobs', '0', Icons.build_outlined, AppColors.secondary),
                  const SizedBox(width: 12),
                  _buildStatCard('Tasks To-Do', '0', Icons.check_circle_outline_rounded, AppColors.success),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Recent Voice Extractions Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Voice Notes', style: AppTypography.h3),
                TextButton(
                  onPressed: () => ref.invalidate(dashboardStatsProvider),
                  child: Text('Refresh', style: AppTypography.caption.copyWith(color: AppColors.primary)),
                ),
              ],
            ),
            const SizedBox(height: 12),

            statsAsync.when(
              data: (stats) {
                if (stats.recentRecordings.isEmpty) {
                  return Container(
                    padding: const EdgeInsets.all(24),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Text('No voice notes recorded yet. Tap "Start Voice Note" above!', style: AppTypography.bodyMedium),
                  );
                }

                return Column(
                  children: stats.recentRecordings.map((rec) {
                    final customerName = rec.extractedData?.customerInfo?['name'] ?? 'General Visit';
                    final companyName = rec.extractedData?.customerInfo?['companyName'];
                    final displayName = companyName != null ? '$customerName ($companyName)' : customerName;
                    final summary = rec.extractedData?.executiveSummary ?? rec.rawTranscript ?? 'Voice debrief recorded';
                    final cost = rec.extractedData?.financials != null
                        ? '\$${rec.extractedData!.financials!.quotedAmount.toStringAsFixed(2)}'
                        : '--';

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: InkWell(
                        onTap: () => context.push('/recordings/${rec.id}'),
                        borderRadius: BorderRadius.circular(12),
                        child: _buildRecentNoteTile(
                          customerName: displayName,
                          summary: summary,
                          durationSec: rec.audioDurationSec,
                          status: rec.status,
                          cost: cost,
                        ),
                      ),
                    );
                  }).toList(),
                );
              },
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              ),
              error: (err, _) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('Unable to load notes: $err', style: AppTypography.caption),
              ),
            ),
          ],
        ),
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
    required double durationSec,
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
          Text(summary, style: AppTypography.bodyMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.timer_outlined, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text('${durationSec.toStringAsFixed(1)}s audio', style: AppTypography.caption),
              const Spacer(),
              const Icon(Icons.auto_awesome_rounded, size: 14, color: AppColors.primary),
              const SizedBox(width: 4),
              Text(
                'AI Processed',
                style: AppTypography.caption.copyWith(color: AppColors.primary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
