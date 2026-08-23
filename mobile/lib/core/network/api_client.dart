import 'dart:io';
import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';
import '../storage/secure_storage_service.dart';
import 'api_response.dart';

class ApiClient {
  final Dio _dio;
  final SecureStorageService _storageService;

  ApiClient({
    Dio? dio,
    SecureStorageService? storageService,
  })  : _storageService = storageService ?? SecureStorageService(),
        _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: ApiEndpoints.baseUrl,
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 20),
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              ),
            ) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storageService.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          final workspaceId = await _storageService.getWorkspaceId();
          if (workspaceId != null && workspaceId.isNotEmpty) {
            options.headers['x-workspace-id'] = workspaceId;
          }

          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Attempt token refresh on 401
          if (error.response?.statusCode == 401 &&
              !error.requestOptions.path.contains('/auth/login') &&
              !error.requestOptions.path.contains('/auth/refresh')) {
            final refreshToken = await _storageService.getRefreshToken();
            if (refreshToken != null) {
              try {
                final refreshRes = await _dio.post(
                  ApiEndpoints.refresh,
                  data: {'refreshToken': refreshToken},
                );
                if (refreshRes.statusCode == 200) {
                  final newToken = refreshRes.data['data']['accessToken'] as String;
                  await _storageService.setAccessToken(newToken);

                  // Retry original request with new token
                  final opts = error.requestOptions;
                  opts.headers['Authorization'] = 'Bearer $newToken';
                  final cloneReq = await _dio.fetch(opts);
                  return handler.resolve(cloneReq);
                }
              } catch (_) {
                await _storageService.clearAll();
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic json)? fromJson,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      final rawData = response.data;
      final data = fromJson != null ? fromJson(rawData['data']) : rawData['data'] as T;
      return ApiResponse.success(
        data: data,
        message: rawData['message'] ?? 'Success',
        statusCode: response.statusCode ?? 200,
      );
    } on DioException catch (e) {
      return _handleDioError<T>(e);
    } catch (e) {
      return ApiResponse.failure(message: e.toString());
    }
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic json)? fromJson,
  }) async {
    try {
      final response = await _dio.post(path, data: data, queryParameters: queryParameters);
      final rawData = response.data;
      final responseData = fromJson != null ? fromJson(rawData['data']) : rawData['data'] as T;
      return ApiResponse.success(
        data: responseData,
        message: rawData['message'] ?? 'Success',
        statusCode: response.statusCode ?? 200,
      );
    } on DioException catch (e) {
      return _handleDioError<T>(e);
    } catch (e) {
      return ApiResponse.failure(message: e.toString());
    }
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    T Function(dynamic json)? fromJson,
  }) async {
    try {
      final response = await _dio.patch(path, data: data);
      final rawData = response.data;
      final responseData = fromJson != null ? fromJson(rawData['data']) : rawData['data'] as T;
      return ApiResponse.success(
        data: responseData,
        message: rawData['message'] ?? 'Success',
        statusCode: response.statusCode ?? 200,
      );
    } on DioException catch (e) {
      return _handleDioError<T>(e);
    } catch (e) {
      return ApiResponse.failure(message: e.toString());
    }
  }

  // S3 / Direct Audio Upload
  Future<bool> uploadAudioFile({
    required String uploadUrl,
    required String filePath,
    required String mimeType,
  }) async {
    try {
      final file = File(filePath);
      final bytes = await file.readAsBytes();

      final uploadDio = Dio(); // Clean instance without authorization headers for S3 presigned URL
      final response = await uploadDio.put(
        uploadUrl,
        data: bytes,
        options: Options(
          headers: {
            'Content-Type': mimeType,
            'Content-Length': bytes.length,
          },
        ),
      );

      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }

  ApiResponse<T> _handleDioError<T>(DioException e) {
    final errorMessage = e.response?.data?['error'] ??
        e.response?.data?['message'] ??
        e.message ??
        'Network error occurred';
    return ApiResponse.failure(
      message: errorMessage,
      statusCode: e.response?.statusCode,
      error: e.response?.data,
    );
  }
}
