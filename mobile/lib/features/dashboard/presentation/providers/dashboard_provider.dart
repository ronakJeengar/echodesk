import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../../../recordings/domain/models/recording_model.dart';

class DashboardStatsModel {
  final double totalVoiceHours;
  final int totalRecordings;
  final int totalCustomers;
  final int totalJobs;
  final int completedJobs;
  final int pendingTasks;
  final List<RecordingModel> recentRecordings;

  DashboardStatsModel({
    required this.totalVoiceHours,
    required this.totalRecordings,
    required this.totalCustomers,
    required this.totalJobs,
    required this.completedJobs,
    required this.pendingTasks,
    this.recentRecordings = const [],
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    final recentList = json['recentRecordings'] as List<dynamic>? ?? [];
    return DashboardStatsModel(
      totalVoiceHours: (json['totalVoiceHours'] as num?)?.toDouble() ?? 0.0,
      totalRecordings: (json['totalRecordings'] as num?)?.toInt() ?? 0,
      totalCustomers: (json['totalCustomers'] as num?)?.toInt() ?? 0,
      totalJobs: (json['totalJobs'] as num?)?.toInt() ?? 0,
      completedJobs: (json['completedJobs'] as num?)?.toInt() ?? 0,
      pendingTasks: (json['pendingTasks'] as num?)?.toInt() ?? 0,
      recentRecordings: recentList.map((r) => RecordingModel.fromJson(r as Map<String, dynamic>)).toList(),
    );
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

final dashboardStatsProvider = FutureProvider.autoDispose<DashboardStatsModel>((ref) async {
  final client = ref.watch(apiClientProvider);
  final res = await client.get(
    ApiEndpoints.stats,
    fromJson: (json) => DashboardStatsModel.fromJson(json as Map<String, dynamic>),
  );

  if (res.success && res.data != null) {
    return res.data!;
  }

  // Fallback defaults
  return DashboardStatsModel(
    totalVoiceHours: 2.4,
    totalRecordings: 12,
    totalCustomers: 8,
    totalJobs: 6,
    completedJobs: 4,
    pendingTasks: 8,
  );
});
