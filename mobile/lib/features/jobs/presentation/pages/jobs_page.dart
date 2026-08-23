import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/jobs_provider.dart';

class JobsPage extends ConsumerWidget {
  const JobsPage({super.key});

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'DONE':
        return AppColors.success;
      case 'IN_PROGRESS':
        return AppColors.warning;
      case 'SCHEDULED':
      case 'TODO':
        return AppColors.primary;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsAsync = ref.watch(jobsListProvider);
    final tasksAsync = ref.watch(tasksListProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text('Field Jobs & Tasks', style: AppTypography.h3),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
              onPressed: () {
                ref.invalidate(jobsListProvider);
                ref.invalidate(tasksListProvider);
              },
            ),
          ],
          bottom: const TabBar(
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondary,
            tabs: [
              Tab(text: 'Field Jobs'),
              Tab(text: 'Action Tasks'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Tab 1: Jobs
            jobsAsync.when(
              data: (jobs) {
                if (jobs.isEmpty) {
                  return Center(child: Text('No active jobs', style: AppTypography.bodyMedium));
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(jobsListProvider),
                  color: AppColors.primary,
                  backgroundColor: AppColors.surface,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: jobs.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final job = jobs[index];
                      final customerDisplay = job.customerCompany != null
                          ? '${job.customerName ?? 'Customer'} (${job.customerCompany})'
                          : job.customerName ?? 'Customer';
                      final quotedText = job.quotedAmount != null
                          ? '\$${job.quotedAmount!.toStringAsFixed(2)}'
                          : '--';

                      return _buildJobCard(
                        title: job.title,
                        customer: customerDisplay,
                        status: job.status,
                        statusColor: _getStatusColor(job.status),
                        date: job.scheduledAt != null ? 'Scheduled' : 'Logged from Voice',
                        quoted: quotedText,
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (err, _) => Center(
                child: Text('Error loading jobs: $err', style: AppTypography.bodyMedium),
              ),
            ),

            // Tab 2: Action Tasks
            tasksAsync.when(
              data: (tasks) {
                if (tasks.isEmpty) {
                  return Center(child: Text('No pending tasks', style: AppTypography.bodyMedium));
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(tasksListProvider),
                  color: AppColors.primary,
                  backgroundColor: AppColors.surface,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: tasks.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final task = tasks[index];
                      final isDone = task.status == 'DONE';

                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Checkbox(
                              value: isDone,
                              activeColor: AppColors.primary,
                              checkColor: Colors.black,
                              onChanged: (val) async {
                                await ref
                                    .read(jobsRepositoryProvider)
                                    .toggleTaskStatus(task.id);
                                ref.invalidate(tasksListProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    task.title,
                                    style: AppTypography.bodyLarge.copyWith(
                                      fontWeight: FontWeight.w600,
                                      decoration: isDone ? TextDecoration.lineThrough : null,
                                      color: isDone ? AppColors.textMuted : AppColors.textPrimary,
                                    ),
                                  ),
                                  if (task.description != null && task.description!.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      task.description!,
                                      style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary),
                                    ),
                                  ],
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: _getStatusColor(task.priority).withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          task.priority,
                                          style: AppTypography.caption.copyWith(
                                            color: _getStatusColor(task.priority),
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                      if (task.dueDate != null) ...[
                                        const SizedBox(width: 8),
                                        const Icon(Icons.calendar_today_outlined, size: 12, color: AppColors.textMuted),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Due soon',
                                          style: AppTypography.caption,
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (err, _) => Center(
                child: Text('Error loading tasks: $err', style: AppTypography.bodyMedium),
              ),
            ),
          ],
        ),
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
                  status.replaceAll('_', ' '),
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
