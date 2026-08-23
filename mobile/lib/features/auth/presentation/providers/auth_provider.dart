import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/auth_repository.dart';
import '../../../../core/storage/secure_storage_service.dart';

final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return AuthRepository(storageService: storage);
});

enum AuthStatus { initial, authenticated, unauthenticated, loading }

class AuthState {
  final AuthStatus status;
  final String? userId;
  final String? userName;
  final String? userEmail;
  final String? workspaceId;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.userId,
    this.userName,
    this.userEmail,
    this.workspaceId,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    String? userId,
    String? userName,
    String? userEmail,
    String? workspaceId,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userEmail: userEmail ?? this.userEmail,
      workspaceId: workspaceId ?? this.workspaceId,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final SecureStorageService _storage;

  AuthNotifier(this._repository, this._storage) : super(const AuthState()) {
    checkAuth();
  }

  Future<void> checkAuth() async {
    state = state.copyWith(status: AuthStatus.loading);
    final isAuth = await _repository.isAuthenticated();
    if (isAuth) {
      final userId = await _storage.getUserId();
      final userName = await _storage.getUserFullName();
      final userEmail = await _storage.getUserEmail();
      final workspaceId = await _storage.getWorkspaceId();

      state = state.copyWith(
        status: AuthStatus.authenticated,
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        workspaceId: workspaceId,
      );
    } else {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    final response = await _repository.login(email: email, password: password);
    if (response.success && response.data != null) {
      final user = response.data!['user'] as Map<String, dynamic>;
      final workspace = response.data!['workspace'] as Map<String, dynamic>?;

      state = state.copyWith(
        status: AuthStatus.authenticated,
        userId: user['id'] as String,
        userName: user['fullName'] as String,
        userEmail: user['email'] as String,
        workspaceId: workspace?['id'] as String?,
      );
      return true;
    } else {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: response.message,
      );
      return false;
    }
  }

  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    required String workspaceName,
    String? industry,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    final response = await _repository.register(
      fullName: fullName,
      email: email,
      password: password,
      workspaceName: workspaceName,
      industry: industry,
    );
    if (response.success && response.data != null) {
      final user = response.data!['user'] as Map<String, dynamic>;
      final workspace = response.data!['workspace'] as Map<String, dynamic>;

      state = state.copyWith(
        status: AuthStatus.authenticated,
        userId: user['id'] as String,
        userName: user['fullName'] as String,
        userEmail: user['email'] as String,
        workspaceId: workspace['id'] as String,
      );
      return true;
    } else {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: response.message,
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthNotifier(repository, storage);
});
