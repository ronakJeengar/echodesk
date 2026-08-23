import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _keyAccessToken = 'echodesk_access_token';
  static const String _keyRefreshToken = 'echodesk_refresh_token';
  static const String _keyWorkspaceId = 'echodesk_workspace_id';
  static const String _keyUserId = 'echodesk_user_id';
  static const String _keyUserFullName = 'echodesk_user_full_name';
  static const String _keyUserEmail = 'echodesk_user_email';

  Future<void> saveAuthData({
    required String accessToken,
    required String refreshToken,
    required String workspaceId,
    required String userId,
    required String userFullName,
    required String userEmail,
  }) async {
    await _storage.write(key: _keyAccessToken, value: accessToken);
    await _storage.write(key: _keyRefreshToken, value: refreshToken);
    await _storage.write(key: _keyWorkspaceId, value: workspaceId);
    await _storage.write(key: _keyUserId, value: userId);
    await _storage.write(key: _keyUserFullName, value: userFullName);
    await _storage.write(key: _keyUserEmail, value: userEmail);
  }

  Future<String?> getAccessToken() async => _storage.read(key: _keyAccessToken);
  Future<String?> getRefreshToken() async => _storage.read(key: _keyRefreshToken);
  Future<String?> getWorkspaceId() async => _storage.read(key: _keyWorkspaceId);
  Future<String?> getUserId() async => _storage.read(key: _keyUserId);
  Future<String?> getUserFullName() async => _storage.read(key: _keyUserFullName);
  Future<String?> getUserEmail() async => _storage.read(key: _keyUserEmail);

  Future<void> setAccessToken(String token) async {
    await _storage.write(key: _keyAccessToken, value: token);
  }

  Future<void> setWorkspaceId(String workspaceId) async {
    await _storage.write(key: _keyWorkspaceId, value: workspaceId);
  }

  Future<bool> hasValidToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
