import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/models/recording_model.dart';
import '../providers/recording_provider.dart';

class RecordVoicePage extends ConsumerStatefulWidget {
  const RecordVoicePage({super.key});

  @override
  ConsumerState<RecordVoicePage> createState() => _RecordVoicePageState();
}

class _RecordVoicePageState extends ConsumerState<RecordVoicePage>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  final TextEditingController _correctionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _correctionController.dispose();
    super.dispose();
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.toString().padLeft(2, '0');
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    final tenths = ((d.inMilliseconds % 1000) ~/ 100).toString();
    return '$minutes:$seconds.$tenths';
  }

  Future<void> _handleToggleRecording() async {
    final recordingState = ref.read(voiceRecordingProvider);
    final notifier = ref.read(voiceRecordingProvider.notifier);

    if (recordingState.isRecording) {
      final extractedData = await notifier.stopAndProcessRecording();
      if (!mounted) return;

      if (extractedData != null) {
        _showExtractionResultModal(extractedData);
      } else if (ref.read(voiceRecordingProvider).isOffline) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppColors.warning,
            content: Text('Offline mode: Voice note stored in Offline Audio Vault. Will sync automatically.'),
          ),
        );
      }
    } else {
      await notifier.startRecording();
    }
  }

  void _showExtractionResultModal(ExtractedDataModel data) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (_, scrollController) {
            final custName = data.customerInfo?['name'] ?? 'Unknown';
            final compName = data.customerInfo?['companyName'];
            final displayName = compName != null ? '$custName — $compName' : '$custName';

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: ListView(
                controller: scrollController,
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 22),
                          const SizedBox(width: 8),
                          Text('AI Extraction Complete', style: AppTypography.h3),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${((data.confidenceScore) * 100).toInt()}% CONFIDENCE',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.success,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Customer Card
                  if (data.customerInfo != null)
                    _buildExtractedItem(
                      'Customer Identified',
                      displayName,
                      Icons.person_outline_rounded,
                      AppColors.primary,
                      subText: data.customerInfo!['address'] as String?,
                    ),

                  const SizedBox(height: 10),

                  // Executive Summary
                  _buildExtractedItem(
                    'Work Summary & Diagnostic',
                    data.executiveSummary,
                    Icons.build_outlined,
                    AppColors.secondary,
                  ),

                  const SizedBox(height: 10),

                  // Parts and Services
                  if (data.partsAndServices.isNotEmpty)
                    _buildExtractedItem(
                      'Materials & Parts Used',
                      data.partsAndServices
                          .map((p) => '${p.quantity}x ${p.name} (\$${p.unitCost.toStringAsFixed(2)})')
                          .join('\n'),
                      Icons.inventory_2_outlined,
                      AppColors.primary,
                    ),

                  const SizedBox(height: 10),

                  // Financials
                  if (data.financials != null)
                    _buildExtractedItem(
                      'Financials & Quoted Total',
                      '\$${data.financials!.quotedAmount.toStringAsFixed(2)}${data.financials!.laborCost != null ? ' (Labor: \$${data.financials!.laborCost!.toStringAsFixed(2)})' : ''}',
                      Icons.attach_money_rounded,
                      AppColors.success,
                    ),

                  const SizedBox(height: 10),

                  // Action Items
                  if (data.actionItems.isNotEmpty)
                    _buildExtractedItem(
                      'Scheduled Action Items (${data.actionItems.length})',
                      data.actionItems.map((a) => '• ${a.title} [${a.priority}]').join('\n'),
                      Icons.calendar_today_outlined,
                      AppColors.warning,
                    ),

                  const SizedBox(height: 24),

                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            _showCorrectionPromptSheet();
                          },
                          icon: const Icon(Icons.edit_note_rounded, size: 18),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.border),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          label: Text('Adjust Prompt', style: AppTypography.button),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            context.pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                backgroundColor: AppColors.success,
                                content: Text('Saved to CRM & synced across web and mobile!'),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.check_circle_rounded, size: 18, color: Colors.black),
                          label: Text(
                            'Save to CRM',
                            style: AppTypography.button.copyWith(color: Colors.black),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showCorrectionPromptSheet() {
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
                'Tell the AI what to change (e.g. "The quoted amount was \$340, not \$285").',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _correctionController,
                autofocus: true,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Enter correction instruction...',
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final text = _correctionController.text.trim();
                    if (text.isNotEmpty) {
                      Navigator.pop(ctx);
                      await ref.read(voiceRecordingProvider.notifier).applyCorrectionPrompt(text);
                      final updatedData = ref.read(voiceRecordingProvider).lastExtractedData;
                      if (updatedData != null && mounted) {
                        _showExtractionResultModal(updatedData);
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text('Re-Extract with AI', style: AppTypography.button.copyWith(color: Colors.black)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildExtractedItem(
    String label,
    String value,
    IconData icon,
    Color color, {
    String? subText,
  }) {
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
                if (subText != null && subText.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(subText, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(voiceRecordingProvider);

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
                color: state.isRecording
                    ? AppColors.recordingRed.withValues(alpha: 0.2)
                    : state.isProcessing
                        ? AppColors.primaryGlow
                        : AppColors.surfaceElevated,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: state.isRecording
                      ? AppColors.recordingRed
                      : state.isProcessing
                          ? AppColors.primary
                          : AppColors.border,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: state.isRecording
                          ? AppColors.recordingRed
                          : state.isProcessing
                              ? AppColors.primary
                              : AppColors.textMuted,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    state.isRecording
                        ? 'LISTENING & RECORDING'
                        : state.isProcessing
                            ? (state.processingStatus.toUpperCase())
                            : 'TAP TO RECORD',
                    style: AppTypography.caption.copyWith(
                      color: state.isRecording
                          ? AppColors.recordingRed
                          : state.isProcessing
                              ? AppColors.primary
                              : AppColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Timer Display
            Text(
              _formatDuration(state.duration),
              style: AppTypography.h1.copyWith(
                fontSize: 48,
                letterSpacing: 1.5,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),

            if (state.isProcessing) ...[
              const SizedBox(height: 12),
              Text(
                state.processingMessage ?? 'Processing with AI...',
                style: AppTypography.bodyMedium.copyWith(color: AppColors.primary),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 48),
                child: LinearProgressIndicator(
                  value: state.processingProgress > 0 ? state.processingProgress / 100.0 : null,
                  backgroundColor: AppColors.surfaceElevated,
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],

            const SizedBox(height: 32),

            // Live Waveform Visualizer
            Container(
              height: 80,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: state.amplitudeHistory.map((amp) {
                  final height = state.isRecording ? (amp * 70).clamp(4.0, 70.0) : 4.0;
                  return Container(
                    width: 4,
                    height: height,
                    margin: const EdgeInsets.symmetric(horizontal: 2.5),
                    decoration: BoxDecoration(
                      color: state.isRecording ? AppColors.primary : AppColors.border,
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
                onTap: state.isProcessing ? null : _handleToggleRecording,
                child: AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    final scale =
                        state.isRecording ? 1.0 + (_pulseController.value * 0.08) : 1.0;
                    return Transform.scale(
                      scale: scale,
                      child: Container(
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: state.isRecording ? AppColors.recordingRed : AppColors.primary,
                          boxShadow: [
                            BoxShadow(
                              color: state.isRecording
                                  ? AppColors.recordingRed.withValues(alpha: 0.4)
                                  : AppColors.primaryGlow,
                              blurRadius: 28,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: Icon(
                          state.isRecording ? Icons.stop_rounded : Icons.mic_rounded,
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
              state.isRecording
                  ? 'Tap to finish & extract'
                  : state.isProcessing
                      ? 'AI pipeline running...'
                      : 'Tap to start speaking',
              style: AppTypography.bodyMedium,
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
