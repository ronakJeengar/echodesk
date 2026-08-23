import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/audio/audio_recorder_service.dart';
import '../../../../core/socket/socket_service.dart';
import '../../../../core/storage/offline_vault_service.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../data/recordings_repository.dart';
import '../../domain/models/recording_model.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

final recordingsRepositoryProvider = Provider<RecordingsRepository>((ref) {
  return RecordingsRepository();
});

final socketServiceProvider = Provider<SocketService>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return SocketService(storageService: storage);
});

final offlineVaultProvider = Provider<OfflineVaultService>((ref) {
  return OfflineVaultService();
});

class VoiceRecordingState {
  final bool isRecording;
  final bool isProcessing;
  final int processingProgress;
  final String processingStatus;
  final String? processingMessage;
  final Duration duration;
  final List<double> amplitudeHistory;
  final RecordingModel? currentRecording;
  final ExtractedDataModel? lastExtractedData;
  final String? errorMessage;
  final bool isOffline;

  const VoiceRecordingState({
    this.isRecording = false,
    this.isProcessing = false,
    this.processingProgress = 0,
    this.processingStatus = 'IDLE',
    this.processingMessage,
    this.duration = Duration.zero,
    this.amplitudeHistory = const [],
    this.currentRecording,
    this.lastExtractedData,
    this.errorMessage,
    this.isOffline = false,
  });

  VoiceRecordingState copyWith({
    bool? isRecording,
    bool? isProcessing,
    int? processingProgress,
    String? processingStatus,
    String? processingMessage,
    Duration? duration,
    List<double>? amplitudeHistory,
    RecordingModel? currentRecording,
    ExtractedDataModel? lastExtractedData,
    String? errorMessage,
    bool? isOffline,
  }) {
    return VoiceRecordingState(
      isRecording: isRecording ?? this.isRecording,
      isProcessing: isProcessing ?? this.isProcessing,
      processingProgress: processingProgress ?? this.processingProgress,
      processingStatus: processingStatus ?? this.processingStatus,
      processingMessage: processingMessage ?? this.processingMessage,
      duration: duration ?? this.duration,
      amplitudeHistory: amplitudeHistory ?? this.amplitudeHistory,
      currentRecording: currentRecording ?? this.currentRecording,
      lastExtractedData: lastExtractedData ?? this.lastExtractedData,
      errorMessage: errorMessage,
      isOffline: isOffline ?? this.isOffline,
    );
  }
}

class VoiceRecordingNotifier extends StateNotifier<VoiceRecordingState> {
  final AudioRecorderService _recorderService;
  final RecordingsRepository _recordingsRepo;
  final SocketService _socketService;
  final OfflineVaultService _offlineVault;
  final SecureStorageService _storage;

  StreamSubscription<Duration>? _durationSub;
  StreamSubscription<double>? _amplitudeSub;
  StreamSubscription<RecordingStatusEvent>? _socketStatusSub;
  StreamSubscription<Map<String, dynamic>>? _socketCompletedSub;
  StreamSubscription<Map<String, dynamic>>? _socketErrorSub;

  VoiceRecordingNotifier({
    required AudioRecorderService recorderService,
    required RecordingsRepository recordingsRepo,
    required SocketService socketService,
    required OfflineVaultService offlineVault,
    required SecureStorageService storage,
  })  : _recorderService = recorderService,
        _recordingsRepo = recordingsRepo,
        _socketService = socketService,
        _offlineVault = offlineVault,
        _storage = storage,
        super(VoiceRecordingState(amplitudeHistory: List.filled(30, 0.1))) {
    _initStreams();
  }

  void _initStreams() {
    _durationSub = _recorderService.durationStream.listen((d) {
      state = state.copyWith(duration: d);
    });

    _amplitudeSub = _recorderService.amplitudeStream.listen((amp) {
      final updatedHistory = List<double>.from(state.amplitudeHistory);
      if (updatedHistory.isNotEmpty) {
        updatedHistory.removeAt(0);
      }
      updatedHistory.add(amp);
      state = state.copyWith(amplitudeHistory: updatedHistory);
    });

    // Socket.IO real-time progress events
    _socketStatusSub = _socketService.statusStream.listen((event) {
      if (state.currentRecording?.id == event.recordingId || state.isProcessing) {
        state = state.copyWith(
          processingStatus: event.status,
          processingProgress: event.progressPercent,
          processingMessage: event.message ?? 'Processing audio with AI...',
        );
      }
    });

    _socketCompletedSub = _socketService.completedStream.listen((payload) {
      final recordingData = payload['data'] as Map<String, dynamic>?;
      if (recordingData != null) {
        final recording = RecordingModel.fromJson(recordingData);
        state = state.copyWith(
          isProcessing: false,
          processingProgress: 100,
          processingStatus: 'COMPLETED',
          currentRecording: recording,
          lastExtractedData: recording.extractedData,
        );
      }
    });

    _socketErrorSub = _socketService.errorStream.listen((payload) {
      state = state.copyWith(
        isProcessing: false,
        processingStatus: 'FAILED',
        errorMessage: payload['errorMessage'] as String? ?? 'Processing error',
      );
    });
  }

  Future<void> startRecording() async {
    try {
      await _socketService.connect();
      await _recorderService.startRecording();
      state = state.copyWith(
        isRecording: true,
        isProcessing: false,
        duration: Duration.zero,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        isRecording: false,
        errorMessage: 'Failed to start recording: $e',
      );
    }
  }

  Future<ExtractedDataModel?> stopAndProcessRecording({
    String? customerIdOverride,
    String? jobCategoryOverride,
  }) async {
    if (!state.isRecording) return null;

    state = state.copyWith(
      isRecording: false,
      isProcessing: true,
      processingProgress: 10,
      processingStatus: 'UPLOADING',
      processingMessage: 'Uploading audio securely...',
    );

    final recordResult = await _recorderService.stopRecording();
    if (recordResult == null) {
      state = state.copyWith(
        isProcessing: false,
        errorMessage: 'No audio captured',
      );
      return null;
    }

    final durationSec = recordResult.duration.inMilliseconds / 1000.0;
    final fileSizeBytes = recordResult.fileSizeBytes;
    final workspaceId = await _storage.getWorkspaceId();

    try {
      // 1. Request Presigned Upload URL from Backend
      final presignedRes = await _recordingsRepo.requestPresignedUrl(
        workspaceId: workspaceId,
        durationSec: durationSec,
        fileSizeBytes: fileSizeBytes,
        audioFormat: 'm4a',
      );

      if (!presignedRes.success || presignedRes.data == null) {
        throw Exception(presignedRes.message);
      }

      final presignedData = presignedRes.data!;
      final recordingId = presignedData['recordingId'] as String;
      final uploadUrl = presignedData['uploadUrl'] as String;

      // Join real-time socket room for this recording
      _socketService.joinRecording(recordingId);

      // 2. Upload Audio File directly
      state = state.copyWith(
        processingProgress: 30,
        processingStatus: 'UPLOADING',
        processingMessage: 'Uploading to EchoDesk storage...',
      );

      await _recordingsRepo.uploadAudio(
        uploadUrl: uploadUrl,
        filePath: recordResult.path,
        mimeType: 'audio/mp4',
      );

      // 3. Trigger Asynchronous AI Pipeline
      state = state.copyWith(
        processingProgress: 45,
        processingStatus: 'TRANSCRIBING',
        processingMessage: 'Transcribing speech & analyzing domain terms...',
      );

      final processRes = await _recordingsRepo.triggerProcessing(
        recordingId: recordingId,
        customerId: customerIdOverride,
        jobCategory: jobCategoryOverride,
      );

      if (!processRes.success) {
        throw Exception(processRes.message);
      }

      // 4. Poll / Wait for Socket or API completion
      for (int i = 0; i < 15; i++) {
        await Future.delayed(const Duration(milliseconds: 600));
        final recRes = await _recordingsRepo.getRecording(recordingId);
        if (recRes.success && recRes.data != null) {
          final recording = recRes.data!;
          if (recording.status == 'COMPLETED' && recording.extractedData != null) {
            state = state.copyWith(
              isProcessing: false,
              processingProgress: 100,
              processingStatus: 'COMPLETED',
              currentRecording: recording,
              lastExtractedData: recording.extractedData,
            );
            return recording.extractedData;
          }
        }
      }

      state = state.copyWith(isProcessing: false);
      return state.lastExtractedData;
    } catch (e) {
      // Save to Offline SQLite Vault for automatic background sync upon reconnection
      final offlineId = 'offline-${DateTime.now().millisecondsSinceEpoch}';
      await _offlineVault.saveRecording(
        OfflineRecordingItem(
          id: offlineId,
          localFilePath: recordResult.path,
          durationSec: durationSec,
          fileSizeBytes: fileSizeBytes,
          audioFormat: 'm4a',
          status: 'PENDING',
          recordedAt: DateTime.now().toIso8601String(),
          customerId: customerIdOverride,
          jobCategory: jobCategoryOverride,
        ),
      );

      state = state.copyWith(
        isProcessing: false,
        isOffline: true,
        errorMessage: 'Network offline. Saved securely to Offline Audio Vault.',
      );
      return null;
    }
  }

  Future<void> applyCorrectionPrompt(String correctionText) async {
    final recordingId = state.currentRecording?.id;
    if (recordingId == null) return;

    state = state.copyWith(
      isProcessing: true,
      processingMessage: 'Re-extracting with AI adjustments...',
    );

    final res = await _recordingsRepo.reExtract(
      recordingId: recordingId,
      promptAdjustment: correctionText,
    );

    if (res.success && res.data != null) {
      final recRes = await _recordingsRepo.getRecording(recordingId);
      if (recRes.success && recRes.data != null) {
        state = state.copyWith(
          isProcessing: false,
          currentRecording: recRes.data,
          lastExtractedData: recRes.data!.extractedData,
        );
      }
    } else {
      state = state.copyWith(
        isProcessing: false,
        errorMessage: res.message,
      );
    }
  }

  @override
  void dispose() {
    _durationSub?.cancel();
    _amplitudeSub?.cancel();
    _socketStatusSub?.cancel();
    _socketCompletedSub?.cancel();
    _socketErrorSub?.cancel();
    _recorderService.dispose();
    super.dispose();
  }
}

final voiceRecordingProvider =
    StateNotifierProvider.autoDispose<VoiceRecordingNotifier, VoiceRecordingState>((ref) {
  final recorderService = AudioRecorderService();
  final recordingsRepo = ref.watch(recordingsRepositoryProvider);
  final socketService = ref.watch(socketServiceProvider);
  final offlineVault = ref.watch(offlineVaultProvider);
  final storage = ref.watch(secureStorageProvider);

  return VoiceRecordingNotifier(
    recorderService: recorderService,
    recordingsRepo: recordingsRepo,
    socketService: socketService,
    offlineVault: offlineVault,
    storage: storage,
  );
});
