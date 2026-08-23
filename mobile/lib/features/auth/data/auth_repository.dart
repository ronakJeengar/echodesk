import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../../../core/storage/secure_storage_service.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final SecureStorageService _storageService;

  AuthRepository({
    ApiClient? apiClient,
    SecureStorageService? storageService,
  })  : _apiClient = apiClient ?? ApiClient(),
        _storageService = storageService ?? SecureStorageService();

  Future<ApiResponse<Map<String, dynamic>>> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.login,
      data: {
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );

    if (response.success && response.data != null) {
      final data = response.data!;
      final user = data['user'] as Map<String, dynamic>;
      final workspace = data['workspace'] as Map<String, dynamic>?;
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String;

      await _storageService.saveAuthData(
        accessToken: accessToken,
        refreshToken: refreshToken,
        workspaceId: workspace?['id'] ?? '',
        userId: user['id'] as String,
        userFullName: user['fullName'] as String,
        userEmail: user['email'] as String,
      );
    }

    return response;
  }

  Future<ApiResponse<Map<String, dynamic>>> register({
    required String fullName,
    required String email,
    required String password,
    required String workspaceName,
    String? industry,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.register,
      data: {
        'fullName': fullName.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'workspaceName': workspaceName.trim(),
        'industry': industry ?? 'General Contractor',
      },
    );

    if (response.success && response.data != null) {
      final data = response.data!;
      final user = data['user'] as Map<String, dynamic>;
      final workspace = data['workspace'] as Map<String, dynamic>;
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String;

      await _storageService.saveAuthData(
        accessToken: accessToken,
        refreshToken: refreshToken,
        workspaceId: workspace['id'] as String,
        userId: user['id'] as String,
        userFullName: user['fullName'] as String,
        userEmail: user['email'] as String,
      );
    }

    return response;
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/auth/logout');
    } catch (_) {}
    await _storageService.clearAll();
  }

  Future<bool> isAuthenticated() async {
    return await _storageService.hasValidToken();
  }
}
