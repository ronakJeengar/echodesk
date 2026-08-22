import 'dart:async';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

class AudioRecordingResult {
  final String path;
  final Duration duration;
  final int fileSizeBytes;

  AudioRecordingResult({
    required this.path,
    required this.duration,
    required this.fileSizeBytes,
  });
}

class AudioRecorderService {
  final AudioRecorder _audioRecorder = AudioRecorder();
  Timer? _timer;
  Timer? _amplitudeTimer;
  
  final StreamController<Duration> _durationController = StreamController<Duration>.broadcast();
  final StreamController<double> _amplitudeController = StreamController<double>.broadcast();

  Stream<Duration> get durationStream => _durationController.stream;
  Stream<double> get amplitudeStream => _amplitudeController.stream;

  DateTime? _startTime;
  String? _currentPath;

  Future<bool> hasPermission() async {
    return await _audioRecorder.hasPermission();
  }

  Future<void> startRecording() async {
    final hasPerm = await hasPermission();
    if (!hasPerm) {
      throw Exception('Microphone permission not granted');
    }

    final tempDir = await getTemporaryDirectory();
    final fileName = 'echodesk_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
    _currentPath = '${tempDir.path}/$fileName';

    await _audioRecorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 32000,
        sampleRate: 44100,
      ),
      path: _currentPath!,
    );

    _startTime = DateTime.now();

    // Duration ticker
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (_startTime != null) {
        final elapsed = DateTime.now().difference(_startTime!);
        _durationController.add(elapsed);
      }
    });

    // Amplitude ticker for live waveform visualizer
    _amplitudeTimer?.cancel();
    _amplitudeTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) async {
      final amp = await _audioRecorder.getAmplitude();
      // Normalize dBFS (-60dB to 0dB) to 0.0 -> 1.0 range
      final currentDb = amp.current;
      final normalized = ((currentDb + 60) / 60).clamp(0.05, 1.0);
      _amplitudeController.add(normalized);
    });
  }

  Future<AudioRecordingResult?> stopRecording() async {
    _timer?.cancel();
    _amplitudeTimer?.cancel();

    final path = await _audioRecorder.stop();
    if (path == null) return null;

    final duration = _startTime != null 
        ? DateTime.now().difference(_startTime!) 
        : Duration.zero;

    final file = File(path);
    final size = await file.length();

    return AudioRecordingResult(
      path: path,
      duration: duration,
      fileSizeBytes: size,
    );
  }

  Future<bool> isRecording() async {
    return await _audioRecorder.isRecording();
  }

  void dispose() {
    _timer?.cancel();
    _amplitudeTimer?.cancel();
    _durationController.close();
    _amplitudeController.close();
    _audioRecorder.dispose();
  }
}
