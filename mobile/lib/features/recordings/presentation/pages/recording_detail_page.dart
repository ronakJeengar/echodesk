import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/pdf/work_order_pdf_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/models/recording_model.dart';
import '../providers/recording_provider.dart';
import '../widgets/send_invoice_modal.dart';

final recordingDetailFutureProvider =
    FutureProvider.autoDispose.family<RecordingModel?, String>((ref, recordingId) async {
  final repo = ref.watch(recordingsRepositoryProvider);
  final res = await repo.getRecording(recordingId);
  if (res.success && res.data != null) {
    return res.data;
  }
  return null;
});

class RecordingDetailPage extends ConsumerStatefulWidget {
  final String recordingId;

  const RecordingDetailPage({super.key, required this.recordingId});

  @override
  ConsumerState<RecordingDetailPage> createState() => _RecordingDetailPageState();
}

class _RecordingDetailPageState extends ConsumerState<RecordingDetailPage> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  final TextEditingController _promptController = TextEditingController();

  PlayerState _playerState = PlayerState.stopped;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;
  double _playbackRate = 1.0;

  final List<double> _availableRates = const [0.75, 1.0, 1.25, 1.5, 2.0];

  @override
  void initState() {
    super.initState();
    _initAudioPlayer();
  }

  void _initAudioPlayer() {
    _audioPlayer.onPlayerStateChanged.listen((state) {
      if (mounted) setState(() => _playerState = state);
    });

    _audioPlayer.onPositionChanged.listen((pos) {
      if (mounted) setState(() => _position = pos);
    });

    _audioPlayer.onDurationChanged.listen((dur) {
      if (mounted) setState(() => _duration = dur);
    });
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    _promptController.dispose();
    super.dispose();
  }

  Future<void> _togglePlayPause(String audioUrl) async {
    if (_playerState == PlayerState.playing) {
      await _audioPlayer.pause();
    } else {
      if (audioUrl.startsWith('http')) {
        await _audioPlayer.play(UrlSource(audioUrl));
      } else {
        // Mock preview fallback
        await _audioPlayer.play(
          UrlSource('https://cdn.freesound.org/previews/518/518305_10825313-lq.mp3'),
        );
      }
    }
  }

  String _formatDuration(Duration d) {
    final mins = d.inMinutes.toString().padLeft(2, '0');
    final secs = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  void _showAdjustPromptSheet(RecordingModel recording) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
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
              Text('One-Click AI Correction', style: AppTypography.h3),
              const SizedBox(height: 8),
              Text(
                'Instruct the AI what to update in this recording\'s extracted CRM record.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _promptController,
                autofocus: true,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'e.g. "Customer is Sarah Jenkins at Apex Logistics. Total was \$285."',
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final text = _promptController.text.trim();
                    if (text.isNotEmpty) {
                      Navigator.pop(ctx);
                      await ref
                          .read(recordingsRepositoryProvider)
                          .reExtract(recordingId: recording.id, promptAdjustment: text);
                      ref.invalidate(recordingDetailFutureProvider(recording.id));
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    'Re-Extract with AI',
                    style: AppTypography.button.copyWith(color: Colors.black),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final recordingAsync = ref.watch(recordingDetailFutureProvider(widget.recordingId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Voice Note Details', style: AppTypography.h3),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
            onPressed: () => ref.invalidate(recordingDetailFutureProvider(widget.recordingId)),
          ),
        ],
      ),
      body: recordingAsync.when(
        data: (recording) {
          if (recording == null) {
            return const Center(child: Text('Recording not found'));
          }

          final data = recording.extractedData;
          final currentSec = _position.inMilliseconds / 1000.0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // 1. Audio Playback Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'AUDIO PLAYBACK',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '${_formatDuration(_position)} / ${_formatDuration(_duration.inSeconds > 0 ? _duration : Duration(seconds: recording.audioDurationSec.toInt()))}',
                          style: AppTypography.caption.copyWith(color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Playback Slider
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        activeTrackColor: AppColors.primary,
                        inactiveTrackColor: AppColors.surfaceElevated,
                        thumbColor: AppColors.primary,
                        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                        trackHeight: 4,
                      ),
                      child: Slider(
                        value: _position.inSeconds.toDouble().clamp(
                              0.0,
                              (_duration.inSeconds > 0
                                      ? _duration.inSeconds
                                      : recording.audioDurationSec)
                                  .toDouble(),
                            ),
                        max: (_duration.inSeconds > 0
                                ? _duration.inSeconds
                                : recording.audioDurationSec)
                            .toDouble(),
                        onChanged: (val) {
                          _audioPlayer.seek(Duration(seconds: val.toInt()));
                        },
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Playback Control Button
                    Center(
                      child: GestureDetector(
                        onTap: () => _togglePlayPause(recording.audioUrl),
                        child: Container(
                          width: 54,
                          height: 54,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primary,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryGlow,
                                blurRadius: 16,
                              ),
                            ],
                          ),
                          child: Icon(
                            _playerState == PlayerState.playing
                                ? Icons.pause_rounded
                                : Icons.play_arrow_rounded,
                            color: Colors.black,
                            size: 32,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Playback Speed Controller Pills
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: _availableRates.map((rate) {
                        final isSelected = _playbackRate == rate;
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: GestureDetector(
                            onTap: () async {
                              setState(() => _playbackRate = rate);
                              await _audioPlayer.setPlaybackRate(rate);
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primary.withValues(alpha: 0.2)
                                    : AppColors.surfaceElevated,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: isSelected ? AppColors.primary : AppColors.border,
                                ),
                              ),
                              child: Text(
                                '${rate}x',
                                style: AppTypography.caption.copyWith(
                                  color: isSelected ? AppColors.primary : AppColors.textSecondary,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // 2. Synchronized Word-Level Transcript Card
              if (recording.rawTranscript != null && recording.rawTranscript!.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.auto_awesome_rounded,
                                  size: 16, color: AppColors.primary),
                              const SizedBox(width: 6),
                              Text('Synchronized Transcript', style: AppTypography.h3),
                            ],
                          ),
                          Text('Tap word to seek', style: AppTypography.caption),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (recording.wordTimestamps.isNotEmpty)
                        Wrap(
                          spacing: 4,
                          runSpacing: 6,
                          children: recording.wordTimestamps.map((wt) {
                            final isActive = currentSec >= wt.start && currentSec <= wt.end;
                            return GestureDetector(
                              onTap: () {
                                _audioPlayer.seek(Duration(milliseconds: (wt.start * 1000).toInt()));
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isActive
                                      ? AppColors.primary.withValues(alpha: 0.25)
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(4),
                                  border: isActive
                                      ? Border.all(color: AppColors.primary, width: 1)
                                      : null,
                                ),
                                child: Text(
                                  wt.word,
                                  style: AppTypography.bodyMedium.copyWith(
                                    color: isActive ? AppColors.primary : AppColors.textPrimary,
                                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        )
                      else
                        Text(
                          recording.rawTranscript!,
                          style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary),
                        ),
                    ],
                  ),
                ),

              const SizedBox(height: 16),

              // 3. Structured Extracted Entities
              if (data != null) ...[
                // Customer Card
                if (data.customerInfo != null)
                  _buildSectionCard(
                    title: 'Customer Identified',
                    icon: Icons.person_outline_rounded,
                    color: AppColors.primary,
                    content: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${data.customerInfo!['name'] ?? 'Unknown'}${data.customerInfo!['companyName'] != null ? ' (${data.customerInfo!['companyName']})' : ''}',
                          style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w600),
                        ),
                        if (data.customerInfo!['phone'] != null)
                          Text('Phone: ${data.customerInfo!['phone']}',
                              style: AppTypography.caption),
                        if (data.customerInfo!['address'] != null)
                          Text('Address: ${data.customerInfo!['address']}',
                              style: AppTypography.caption),
                      ],
                    ),
                  ),

                const SizedBox(height: 12),

                // Diagnostic Summary
                _buildSectionCard(
                  title: 'Diagnostic & Work Summary',
                  icon: Icons.build_outlined,
                  color: AppColors.secondary,
                  content: Text(
                    data.executiveSummary,
                    style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary),
                  ),
                ),

                const SizedBox(height: 12),

                // Parts Used
                if (data.partsAndServices.isNotEmpty)
                  _buildSectionCard(
                    title: 'Materials & Parts (${data.partsAndServices.length})',
                    icon: Icons.inventory_2_outlined,
                    color: AppColors.primary,
                    content: Column(
                      children: data.partsAndServices.map((p) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 3),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${p.quantity}x ${p.name}', style: AppTypography.bodyMedium),
                              Text('\$${p.unitCost.toStringAsFixed(2)}',
                                  style: AppTypography.caption.copyWith(color: AppColors.textPrimary)),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                const SizedBox(height: 12),

                // Financials
                if (data.financials != null)
                  _buildSectionCard(
                    title: 'Quoted Financials',
                    icon: Icons.attach_money_rounded,
                    color: AppColors.success,
                    content: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total Amount Quoted:', style: AppTypography.bodyMedium),
                        Text(
                          '\$${data.financials!.quotedAmount.toStringAsFixed(2)}',
                          style: AppTypography.h3.copyWith(color: AppColors.success),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 20),

                // Primary Action: Dispatch to Customer via SMS/Email
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      SendInvoiceModal.show(
                        context,
                        recordingId: recording.id,
                        initialEmail: data.customerInfo?['email'] as String?,
                        initialPhone: data.customerInfo?['phone'] as String?,
                        clientName: data.customerInfo?['name'] as String?,
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.send_rounded, size: 18, color: Colors.black),
                    label: Text(
                      'Send Invoice to Customer (Email/SMS)',
                      style: AppTypography.button.copyWith(color: Colors.black),
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Secondary Actions: Generate PDF & Re-Extract
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _showAdjustPromptSheet(recording),
                        icon: const Icon(Icons.edit_note_rounded, size: 18),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.border),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        label: Text('AI Correction', style: AppTypography.button),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          await WorkOrderPdfService.previewAndPrint(
                            context: context,
                            recording: recording,
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.primary),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.picture_as_pdf_rounded, size: 18, color: AppColors.primary),
                        label: Text(
                          'Work Order PDF',
                          style: AppTypography.button.copyWith(color: AppColors.primary),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
              ],
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (err, _) => Center(child: Text('Error loading recording: $err')),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Color color,
    required Widget content,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 8),
              Text(title, style: AppTypography.h3.copyWith(fontSize: 14)),
            ],
          ),
          const SizedBox(height: 10),
          content,
        ],
      ),
    );
  }
}
