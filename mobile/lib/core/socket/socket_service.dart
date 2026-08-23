import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../storage/secure_storage_service.dart';

class RecordingStatusEvent {
  final String recordingId;
  final String status;
  final int progressPercent;
  final String? message;
  final String timestamp;

  RecordingStatusEvent({
    required this.recordingId,
    required this.status,
    required this.progressPercent,
    this.message,
    required this.timestamp,
  });

  factory RecordingStatusEvent.fromMap(Map<String, dynamic> map) {
    return RecordingStatusEvent(
      recordingId: map['recordingId'] as String,
      status: map['status'] as String,
      progressPercent: (map['progressPercent'] as num?)?.toInt() ?? 0,
      message: map['message'] as String?,
      timestamp: map['timestamp'] as String? ?? DateTime.now().toIso8601String(),
    );
  }
}

class SocketService {
  io.Socket? _socket;
  final SecureStorageService _storageService;
  final String _serverUrl;

  final _statusStreamController = StreamController<RecordingStatusEvent>.broadcast();
  final _completedStreamController = StreamController<Map<String, dynamic>>.broadcast();
  final _errorStreamController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<RecordingStatusEvent> get statusStream => _statusStreamController.stream;
  Stream<Map<String, dynamic>> get completedStream => _completedStreamController.stream;
  Stream<Map<String, dynamic>> get errorStream => _errorStreamController.stream;

  SocketService({
    String serverUrl = 'http://localhost:5001',
    SecureStorageService? storageService,
  })  : _serverUrl = serverUrl,
        _storageService = storageService ?? SecureStorageService();

  Future<void> connect() async {
    if (_socket != null && _socket!.connected) return;

    final token = await _storageService.getAccessToken();
    final workspaceId = await _storageService.getWorkspaceId();

    _socket = io.io(
      _serverUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .setExtraHeaders(token != null ? {'Authorization': 'Bearer $token'} : {})
          .build(),
    );

    _socket!.onConnect((_) {
      if (workspaceId != null) {
        joinWorkspace(workspaceId);
      }
    });

    _socket!.on('recording:status_change', (data) {
      if (data is Map<String, dynamic>) {
        _statusStreamController.add(RecordingStatusEvent.fromMap(data));
      }
    });

    _socket!.on('recording:completed', (data) {
      if (data is Map<String, dynamic>) {
        _completedStreamController.add(data);
      }
    });

    _socket!.on('recording:error', (data) {
      if (data is Map<String, dynamic>) {
        _errorStreamController.add(data);
      }
    });

    _socket!.connect();
  }

  void joinWorkspace(String workspaceId) {
    _socket?.emit('join:workspace', workspaceId);
  }

  void joinRecording(String recordingId) {
    _socket?.emit('join:recording', recordingId);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _statusStreamController.close();
    _completedStreamController.close();
    _errorStreamController.close();
  }
}
