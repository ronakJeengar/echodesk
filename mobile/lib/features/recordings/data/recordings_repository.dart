import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../domain/models/recording_model.dart';

class RecordingsRepository {
  final ApiClient _apiClient;

  RecordingsRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<ApiResponse<Map<String, dynamic>>> requestPresignedUrl({
    String? workspaceId,
    required double durationSec,
    required int fileSizeBytes,
    String audioFormat = 'm4a',
  }) async {
    return await _apiClient.post(
      ApiEndpoints.presignedUrl,
      data: {
        if (workspaceId != null) 'workspaceId': workspaceId,
        'durationSec': durationSec,
        'fileSizeBytes': fileSizeBytes,
        'audioFormat': audioFormat,
      },
    );
  }

  Future<bool> uploadAudio({
    required String uploadUrl,
    required String filePath,
    String mimeType = 'audio/mp4',
  }) async {
    return await _apiClient.uploadAudioFile(
      uploadUrl: uploadUrl,
      filePath: filePath,
      mimeType: mimeType,
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> triggerProcessing({
    required String recordingId,
    String? customerId,
    String? jobCategory,
  }) async {
    return await _apiClient.post(
      '${ApiEndpoints.processRecording}/$recordingId/process',
      data: {
        if (customerId != null) 'customerId': customerId,
        if (jobCategory != null) 'jobCategory': jobCategory,
      },
    );
  }

  Future<ApiResponse<RecordingModel>> getRecording(String recordingId) async {
    return await _apiClient.get(
      '${ApiEndpoints.recordingDetail}/$recordingId',
      fromJson: (json) => RecordingModel.fromJson(json as Map<String, dynamic>),
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> listRecordings({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    return await _apiClient.get(
      ApiEndpoints.recordingDetail,
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> reExtract({
    required String recordingId,
    required String promptAdjustment,
  }) async {
    return await _apiClient.post(
      '${ApiEndpoints.recordingDetail}/$recordingId/re-extract',
      data: {'promptAdjustment': promptAdjustment},
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> sendInvoice({
    required String recordingId,
    String? recipientEmail,
    String? recipientPhone,
    String deliveryMethod = 'EMAIL',
  }) async {
    return await _apiClient.post(
      '${ApiEndpoints.recordingDetail}/$recordingId/send-invoice',
      data: {
        if (recipientEmail != null) 'recipientEmail': recipientEmail,
        if (recipientPhone != null) 'recipientPhone': recipientPhone,
        'deliveryMethod': deliveryMethod,
      },
    );
  }
}
