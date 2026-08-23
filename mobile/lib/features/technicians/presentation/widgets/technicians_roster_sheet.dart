import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class TechniciansRosterSheet extends StatelessWidget {
  const TechniciansRosterSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const TechniciansRosterSheet(),
    );
  }

  final List<Map<String, dynamic>> _technicians = const [
    {
      'name': 'Alex Miller',
      'role': 'Lead Field Tech',
      'specialty': 'HVAC / EPA Universal',
      'status': 'ON_SITE',
      'currentJob': 'Emergency AC Diagnostic',
      'activeJobs': 3,
    },
    {
      'name': 'Dave Wilson',
      'role': 'Master Electrician',
      'specialty': 'Electrical / 200A Panels',
      'status': 'AVAILABLE',
      'currentJob': 'Subpanel Inspection',
      'activeJobs': 2,
    },
    {
      'name': 'Elena Rodriguez',
      'role': 'Journeyman Plumber',
      'specialty': 'Plumbing / PRV Valves',
      'status': 'DISPATCHED',
      'currentJob': 'Water Heater Tankless',
      'activeJobs': 1,
    },
    {
      'name': 'Marcus Chen',
      'role': 'Senior Home Inspector',
      'specialty': 'Inspection / Moisture Audit',
      'status': 'AVAILABLE',
      'currentJob': 'None',
      'activeJobs': 0,
    },
  ];

  @override
  Widget build(BuildContext context) {
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
                      const Icon(Icons.people_alt_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Fleet & Field Operators', style: AppTypography.h3),
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
                'Live technician dispatch statuses, active job loads & trade certifications.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 16),

              Expanded(
                child: ListView.separated(
                  controller: scrollController,
                  itemCount: _technicians.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final tech = _technicians[index];
                    final name = tech['name'] as String;
                    final role = tech['role'] as String;
                    final specialty = tech['specialty'] as String;
                    final status = tech['status'] as String;
                    final currentJob = tech['currentJob'] as String;
                    final activeJobs = tech['activeJobs'] as int;

                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 16,
                                    backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                                    child: Text(
                                      name.split(' ').map((n) => n[0]).join(''),
                                      style: AppTypography.caption.copyWith(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(name, style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
                                      Text(role, style: AppTypography.caption),
                                    ],
                                  ),
                                ],
                              ),
                              _buildStatusBadge(status),
                            ],
                          ),
                          const SizedBox(height: 10),
                          const Divider(height: 1, color: AppColors.border),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(specialty, style: AppTypography.caption.copyWith(color: AppColors.secondary)),
                              Text('$activeJobs active jobs', style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          if (currentJob != 'None') ...[
                            const SizedBox(height: 4),
                            Text('Current: $currentJob', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                          ],
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg = AppColors.surface;
    Color fg = AppColors.textMuted;
    String label = status;

    if (status == 'ON_SITE') {
      bg = AppColors.warning.withValues(alpha: 0.15);
      fg = AppColors.warning;
      label = 'ON SITE';
    } else if (status == 'DISPATCHED') {
      bg = AppColors.secondary.withValues(alpha: 0.15);
      fg = AppColors.secondary;
      label = 'EN ROUTE';
    } else if (status == 'AVAILABLE') {
      bg = AppColors.success.withValues(alpha: 0.15);
      fg = AppColors.success;
      label = 'AVAILABLE';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: AppTypography.caption.copyWith(
          color: fg,
          fontWeight: FontWeight.bold,
          fontSize: 10,
        ),
      ),
    );
  }
}
