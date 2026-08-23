import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/audio/audio_recorder_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class RecordVoicePage extends StatefulWidget {
  const RecordVoicePage({super.key});

  @override
  State<RecordVoicePage> createState() => _RecordVoicePageState();
}

class _RecordVoicePageState extends State<RecordVoicePage> with SingleTickerProviderStateMixin {
  final AudioRecorderService _recorderService = AudioRecorderService();
  bool _isRecording = false;
  bool _isProcessing = false;
  Duration _duration = Duration.zero;
  final List<double> _amplitudeHistory = List.filled(30, 0.1);

  StreamSubscription<Duration>? _durationSub;
  StreamSubscription<double>? _amplitudeSub;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);

    _durationSub = _recorderService.durationStream.listen((d) {
      setState(() {
        _duration = d;
      });
    });

    _amplitudeSub = _recorderService.amplitudeStream.listen((amp) {
      setState(() {
        _amplitudeHistory.removeAt(0);
        _amplitudeHistory.add(amp);
      });
    });
  }

  @override
  void dispose() {
    _durationSub?.cancel();
    _amplitudeSub?.cancel();
    _pulseController.dispose();
    _recorderService.dispose();
    super.dispose();
  }

  Future<void> _toggleRecording() async {
    if (_isRecording) {
      setState(() {
        _isRecording = false;
        _isProcessing = true;
      });

      final result = await _recorderService.stopRecording();
      
      // Simulate AI Processing & Extraction for demo
      await Future.delayed(const Duration(seconds: 2));
      if (!mounted) return;

      setState(() {
        _isProcessing = false;
      });

      _showExtractionResultModal(result);
    } else {
      try {
        await _recorderService.startRecording();
        setState(() {
          _isRecording = true;
        });
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error starting recording: $e')),
        );
      }
    }
  }

  void _showExtractionResultModal(AudioRecordingResult? result) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 22),
                  const SizedBox(width: 8),
                  Text('AI Extraction Complete', style: AppTypography.h3),
                ],
              ),
              const SizedBox(height: 16),
              _buildExtractedItem(
                'Customer Identified',
                'Sarah Jenkins — Apex Logistics',
                Icons.person_outline_rounded,
                AppColors.primary,
              ),
              const SizedBox(height: 10),
              _buildExtractedItem(
                'Work Summary',
                'Replaced dual capacitor on outdoor condenser unit.',
                Icons.build_outlined,
                AppColors.secondary,
              ),
              const SizedBox(height: 10),
              _buildExtractedItem(
                'Financials & Quoted Amount',
                '\$285.00 (Labor: 1.5 hrs, Parts: \$42.00)',
                Icons.attach_money_rounded,
                AppColors.success,
              ),
              const SizedBox(height: 10),
              _buildExtractedItem(
                'Scheduled Action Item',
                'Send invoice #4092 by Friday, Aug 25',
                Icons.calendar_today_outlined,
                AppColors.warning,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.border),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text('Edit Fields', style: AppTypography.button),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        context.pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('CRM record & tasks saved successfully!')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text(
                        'Save to CRM',
                        style: AppTypography.button.copyWith(color: Colors.black),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildExtractedItem(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTypography.caption),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.toString().padLeft(2, '0');
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    final tenths = ((d.inMilliseconds % 1000) ~/ 100).toString();
    return '$minutes:$seconds.$tenths';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Record Voice Note', style: AppTypography.h3),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(),

            // Status Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: _isRecording
                    ? AppColors.recordingRed.withValues(alpha: 0.2)
                    : AppColors.surfaceElevated,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _isRecording ? AppColors.recordingRed : AppColors.border,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _isRecording ? AppColors.recordingRed : AppColors.textMuted,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _isRecording
                        ? 'LISTENING & RECORDING'
                        : _isProcessing
                            ? 'AI EXTRACTING ENTITIES...'
                            : 'TAP TO RECORD',
                    style: AppTypography.caption.copyWith(
                      color: _isRecording ? AppColors.recordingRed : AppColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Timer Display
            Text(
              _formatDuration(_duration),
              style: AppTypography.h1.copyWith(
                fontSize: 48,
                letterSpacing: 1.5,
                fontFeatures: [const FontFeature.tabularFigures()],
              ),
            ),
            const SizedBox(height: 32),

            // Live Waveform Visualizer
            Container(
              height: 80,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: _amplitudeHistory.map((amp) {
                  final height = _isRecording ? (amp * 70).clamp(4.0, 70.0) : 4.0;
                  return Container(
                    width: 4,
                    height: height,
                    margin: const EdgeInsets.symmetric(horizontal: 2.5),
                    decoration: BoxDecoration(
                      color: _isRecording ? AppColors.primary : AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  );
                }).toList(),
              ),
            ),

            const Spacer(),

            // Record / Stop Button
            Center(
              child: GestureDetector(
                onTap: _isProcessing ? null : _toggleRecording,
                child: AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    final scale = _isRecording ? 1.0 + (_pulseController.value * 0.08) : 1.0;
                    return Transform.scale(
                      scale: scale,
                      child: Container(
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isRecording ? AppColors.recordingRed : AppColors.primary,
                          boxShadow: [
                            BoxShadow(
                              color: _isRecording
                                  ? AppColors.recordingRed.withValues(alpha: 0.4)
                                  : AppColors.primaryGlow,
                              blurRadius: 28,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: Icon(
                          _isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                          size: 40,
                          color: Colors.black,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              _isRecording ? 'Tap to finish & extract' : 'Tap to start speaking',
              style: AppTypography.bodyMedium,
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
