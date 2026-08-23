class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = 'http://localhost:5001/api/v1';

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
