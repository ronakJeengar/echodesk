import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';

class AnalyticsRepository {
  final ApiClient _apiClient;

  AnalyticsRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<ApiResponse<Map<String, dynamic>>> getAnalytics() async {
    return await _apiClient.get('/stats/analytics');
  }
}
