import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../data/analytics_repository.dart';

final analyticsRepositoryProvider = Provider<AnalyticsRepository>((ref) {
  return AnalyticsRepository();
});

final analyticsFutureProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final repo = ref.watch(analyticsRepositoryProvider);
  final res = await repo.getAnalytics();
  if (res.success && res.data != null) {
    return res.data!;
  }
  throw Exception(res.message);
});

class AnalyticsPage extends ConsumerWidget {
  const AnalyticsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analyticsAsync = ref.watch(analyticsFutureProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Financial & Trade Insights', style: AppTypography.h3),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.refresh(analyticsFutureProvider),
          ),
        ],
      ),
      body: analyticsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (err, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline_rounded, color: AppColors.danger, size: 48),
                const SizedBox(height: 12),
                Text('Failed to load analytics', style: AppTypography.h3),
                const SizedBox(height: 8),
                Text('$err', style: AppTypography.caption, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.refresh(analyticsFutureProvider),
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                  child: const Text('Retry', style: TextStyle(color: Colors.black)),
                ),
              ],
            ),
          ),
        ),
        data: (data) {
          final kpis = data['kpis'] as Map<String, dynamic>? ?? {};
          final tradeBreakdown = (data['tradeBreakdown'] as List<dynamic>?) ?? [];
          final topParts = (data['topParts'] as List<dynamic>?) ?? [];
          final revenueTrends = (data['revenueTrends'] as List<dynamic>?) ?? [];

          final totalRevenue = (kpis['totalQuotedRevenue'] as num?)?.toDouble() ?? 0.0;
          final avgJobVal = (kpis['averageJobValue'] as num?)?.toDouble() ?? 0.0;
          final avgLabor = (kpis['averageLaborHours'] as num?)?.toDouble() ?? 0.0;
          final completionRate = (kpis['taskCompletionRate'] as num?)?.toInt() ?? 100;

          return RefreshIndicator(
            onRefresh: () async => ref.refresh(analyticsFutureProvider),
            color: AppColors.primary,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // KPI Grid
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.4,
                  children: [
                    _buildKpiCard(
                      'Quoted Revenue',
                      '\$${totalRevenue.toStringAsFixed(0)}',
                      Icons.attach_money_rounded,
                      AppColors.success,
                    ),
                    _buildKpiCard(
                      'Avg Job Value',
                      '\$${avgJobVal.toStringAsFixed(0)}',
                      Icons.trending_up_rounded,
                      AppColors.primary,
                    ),
                    _buildKpiCard(
                      'Avg Labor Hours',
                      '${avgLabor.toStringAsFixed(1)} hrs',
                      Icons.access_time_rounded,
                      AppColors.secondary,
                    ),
                    _buildKpiCard(
                      'Task Completion',
                      '$completionRate%',
                      Icons.task_alt_rounded,
                      AppColors.warning,
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Weekly Revenue Pulse
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.bar_chart_rounded, color: AppColors.primary, size: 20),
                          const SizedBox(width: 8),
                          Text('Weekly Revenue Velocity', style: AppTypography.h3),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: revenueTrends.map((trend) {
                          final rev = (trend['revenue'] as num?)?.toDouble() ?? 0.0;
                          final period = trend['period'] as String? ?? '';
                          final heightFactor = totalRevenue > 0 ? (rev / (totalRevenue * 0.4)).clamp(0.15, 1.0) : 0.2;

                          return Column(
                            children: [
                              Text(
                                '\$${rev.toInt()}',
                                style: AppTypography.caption.copyWith(
                                  fontSize: 10,
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                width: 28,
                                height: 90 * heightFactor,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [AppColors.primaryLight, AppColors.primaryDark],
                                  ),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(period, style: AppTypography.caption),
                            ],
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Trade Breakdown
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.pie_chart_outline_rounded, color: AppColors.secondary, size: 20),
                          const SizedBox(width: 8),
                          Text('Volume by Trade', style: AppTypography.h3),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ...tradeBreakdown.map((item) {
                        final name = item['name'] as String? ?? '';
                        final count = (item['count'] as num?)?.toInt() ?? 0;
                        final pct = (item['percentage'] as num?)?.toInt() ?? 0;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(name, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                                  Text('$count jobs ($pct%)', style: AppTypography.caption),
                                ],
                              ),
                              const SizedBox(height: 6),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: pct / 100.0,
                                  backgroundColor: AppColors.surfaceElevated,
                                  valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                                  minHeight: 6,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Top Parts Inventory Usage
                if (topParts.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.inventory_2_outlined, color: AppColors.warning, size: 20),
                            const SizedBox(width: 8),
                            Text('Top Extracted Materials & Parts', style: AppTypography.h3),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ...topParts.map((part) {
                          final name = part['name'] as String? ?? 'Part';
                          final qty = (part['quantity'] as num?)?.toInt() ?? 0;
                          final totalCost = (part['totalCost'] as num?)?.toDouble() ?? 0.0;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceElevated,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                                      ),
                                      const SizedBox(height: 2),
                                      Text('$qty units deployed', style: AppTypography.caption),
                                    ],
                                  ),
                                ),
                                Text(
                                  '\$${totalCost.toStringAsFixed(2)}',
                                  style: AppTypography.bodyMedium.copyWith(
                                    color: AppColors.success,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildKpiCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: AppTypography.caption),
              Icon(icon, size: 18, color: color),
            ],
          ),
          Text(
            value,
            style: AppTypography.h2.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
