import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) {
  return NotificationsRepository(apiClient: ApiClient());
});

final notificationsFutureProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final repo = ref.watch(notificationsRepositoryProvider);
  return repo.fetchNotifications();
});

class NotificationsRepository {
  final ApiClient _apiClient;

  NotificationsRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, dynamic>> fetchNotifications() async {
    try {
      final res = await _apiClient.get('/stats/notifications');
      if (res.success && res.data != null) {
        return res.data as Map<String, dynamic>;
      }
      return {'notifications': [], 'unreadCount': 0};
    } catch (_) {
      return {'notifications': [], 'unreadCount': 0};
    }
  }
}
