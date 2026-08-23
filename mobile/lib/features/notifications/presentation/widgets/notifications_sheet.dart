import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../data/notifications_repository.dart';

class NotificationsSheet extends ConsumerWidget {
  const NotificationsSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const NotificationsSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifsAsync = ref.watch(notificationsFutureProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (_, scrollController) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.notifications_active_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Dispatch & AI Alerts', style: AppTypography.h3),
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
                'Live notifications from field speech processing and CRM automations.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 16),

              Expanded(
                child: notifsAsync.when(
                  data: (data) {
                    final list = data['notifications'] as List<dynamic>? ?? [];
                    if (list.isEmpty) {
                      return Center(
                        child: Text('No active notifications', style: AppTypography.bodyMedium),
                      );
                    }

                    return ListView.separated(
                      controller: scrollController,
                      itemCount: list.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final notif = list[index];
                        final type = notif['type'] as String? ?? 'SYSTEM';
                        final title = notif['title'] as String? ?? 'Alert';
                        final msg = notif['message'] as String? ?? '';
                        final link = notif['link'] as String?;
                        final isRead = notif['read'] as bool? ?? false;

                        return InkWell(
                          onTap: () {
                            Navigator.pop(context);
                            if (link != null) {
                              if (link.startsWith('/studio?id=')) {
                                final id = link.replaceFirst('/studio?id=', '');
                                context.push('/recordings/$id');
                              } else if (link == '/kanban') {
                                context.push('/jobs');
                              }
                            }
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isRead ? AppColors.surfaceElevated : AppColors.surfaceElevated.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isRead ? AppColors.border : AppColors.primary.withValues(alpha: 0.4),
                                width: isRead ? 1 : 1.5,
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: _getIconBg(type),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Icon(_getIcon(type), size: 16, color: _getIconColor(type)),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        title,
                                        style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w700),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        msg,
                                        style: AppTypography.bodyMedium.copyWith(fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
                  loading: () => const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                  error: (err, _) => Center(
                    child: Text('Error loading alerts: $err', style: AppTypography.caption),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  IconData _getIcon(String type) {
    switch (type) {
      case 'AI_PROCESSED':
        return Icons.auto_awesome_rounded;
      case 'SIGNATURE_CAPTURED':
        return Icons.draw_rounded;
      case 'INVOICE_SENT':
        return Icons.send_rounded;
      case 'TASK_REMINDER':
        return Icons.alarm_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _getIconBg(String type) {
    switch (type) {
      case 'AI_PROCESSED':
        return AppColors.primary.withValues(alpha: 0.15);
      case 'SIGNATURE_CAPTURED':
        return Colors.cyan.withValues(alpha: 0.15);
      case 'INVOICE_SENT':
        return Colors.blue.withValues(alpha: 0.15);
      case 'TASK_REMINDER':
        return Colors.amber.withValues(alpha: 0.15);
      default:
        return AppColors.surface;
    }
  }

  Color _getIconColor(String type) {
    switch (type) {
      case 'AI_PROCESSED':
        return AppColors.primary;
      case 'SIGNATURE_CAPTURED':
        return Colors.cyanAccent;
      case 'INVOICE_SENT':
        return Colors.lightBlueAccent;
      case 'TASK_REMINDER':
        return Colors.amberAccent;
      default:
        return AppColors.textPrimary;
    }
  }
}
