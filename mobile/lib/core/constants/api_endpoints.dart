import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiEndpoints {
  ApiEndpoints._();

  static String get baseUrl {
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:5001/api/v1';
    }
    return 'http://localhost:5001/api/v1';
  }

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String me = '/auth/me';

  // Recordings & AI
  static const String presignedUrl = '/recordings/presigned-url';
  static const String processRecording = '/recordings';
  static const String recordingDetail = '/recordings';

  // CRM
  static const String customers = '/customers';
  static const String jobs = '/jobs';
  static const String tasks = '/tasks';
  static const String stats = '/stats';
}
