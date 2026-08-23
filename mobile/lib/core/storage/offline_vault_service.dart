import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;
import 'dart:io';

class OfflineRecordingItem {
  final String id;
  final String localFilePath;
  final double durationSec;
  final int fileSizeBytes;
  final String audioFormat;
  final String status; // PENDING, SYNCING, SYNCED, FAILED
  final String recordedAt;
  final String? errorMessage;
  final String? customerId;
  final String? jobCategory;

  OfflineRecordingItem({
    required this.id,
    required this.localFilePath,
    required this.durationSec,
    required this.fileSizeBytes,
    required this.audioFormat,
    this.status = 'PENDING',
    required this.recordedAt,
    this.errorMessage,
    this.customerId,
    this.jobCategory,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'local_file_path': localFilePath,
      'duration_sec': durationSec,
      'file_size_bytes': fileSizeBytes,
      'audio_format': audioFormat,
      'status': status,
      'recorded_at': recordedAt,
      'error_message': errorMessage,
      'customer_id': customerId,
      'job_category': jobCategory,
    };
  }

  factory OfflineRecordingItem.fromMap(Map<String, dynamic> map) {
    return OfflineRecordingItem(
      id: map['id'] as String,
      localFilePath: map['local_file_path'] as String,
      durationSec: (map['duration_sec'] as num).toDouble(),
      fileSizeBytes: map['file_size_bytes'] as int,
      audioFormat: map['audio_format'] as String,
      status: map['status'] as String,
      recordedAt: map['recorded_at'] as String,
      errorMessage: map['error_message'] as String?,
      customerId: map['customer_id'] as String?,
      jobCategory: map['job_category'] as String?,
    );
  }
}

class OfflineVaultService {
  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, 'echodesk_vault.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE offline_recordings (
            id TEXT PRIMARY KEY,
            local_file_path TEXT NOT NULL,
            duration_sec REAL NOT NULL,
            file_size_bytes INTEGER NOT NULL,
            audio_format TEXT NOT NULL,
            status TEXT NOT NULL,
            recorded_at TEXT NOT NULL,
            error_message TEXT,
            customer_id TEXT,
            job_category TEXT
          )
        ''');
      },
    );
  }

  Future<void> saveRecording(OfflineRecordingItem item) async {
    final db = await database;
    await db.insert(
      'offline_recordings',
      item.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<OfflineRecordingItem>> getPendingRecordings() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'offline_recordings',
      where: 'status IN (?, ?)',
      whereArgs: ['PENDING', 'FAILED'],
      orderBy: 'recorded_at ASC',
    );
    return maps.map((m) => OfflineRecordingItem.fromMap(m)).toList();
  }

  Future<List<OfflineRecordingItem>> getAllRecordings() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'offline_recordings',
      orderBy: 'recorded_at DESC',
    );
    return maps.map((m) => OfflineRecordingItem.fromMap(m)).toList();
  }

  Future<void> updateStatus(String id, String status, {String? errorMessage}) async {
    final db = await database;
    await db.update(
      'offline_recordings',
      {
        'status': status,
        'error_message': errorMessage,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> deleteRecording(String id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'offline_recordings',
      where: 'id = ?',
      whereArgs: [id],
    );
    if (maps.isNotEmpty) {
      final path = maps.first['local_file_path'] as String;
      final file = File(path);
      if (await file.exists()) {
        await file.delete().catchError((_) => file);
      }
    }
    await db.delete('offline_recordings', where: 'id = ?', whereArgs: [id]);
  }
}
