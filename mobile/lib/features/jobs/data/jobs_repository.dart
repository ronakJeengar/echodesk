import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../domain/models/job_model.dart';

class JobsRepository {
  final ApiClient _apiClient;

  JobsRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<ApiResponse<List<JobModel>>> listJobs({
    String? status,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    return await _apiClient.get(
      ApiEndpoints.jobs,
      queryParameters: {
        if (status != null) 'status': status,
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
        'limit': limit,
      },
      fromJson: (json) {
        final jobsList = json['jobs'] as List<dynamic>? ?? [];
        return jobsList.map((j) => JobModel.fromJson(j as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<ApiResponse<List<TaskModel>>> listTasks({
    String? status,
  }) async {
    return await _apiClient.get(
      ApiEndpoints.tasks,
      queryParameters: {
        if (status != null) 'status': status,
      },
      fromJson: (json) {
        final tasksList = json as List<dynamic>? ?? [];
        return tasksList.map((t) => TaskModel.fromJson(t as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<ApiResponse<TaskModel>> toggleTaskStatus(String taskId) async {
    return await _apiClient.patch(
      '${ApiEndpoints.tasks}/$taskId/toggle',
      fromJson: (json) => TaskModel.fromJson(json as Map<String, dynamic>),
    );
  }
}
