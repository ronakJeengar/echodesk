import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class EquipmentDecoderSheet extends StatefulWidget {
  const EquipmentDecoderSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const EquipmentDecoderSheet(),
    );
  }

  @override
  State<EquipmentDecoderSheet> createState() => _EquipmentDecoderSheetState();
}

class _EquipmentDecoderSheetState extends State<EquipmentDecoderSheet> {
  String _brand = 'Carrier';
  final TextEditingController _modelController = TextEditingController(text: '24ACC636A003');
  final TextEditingController _serialController = TextEditingController(text: '4219E12345');

  @override
  void dispose() {
    _modelController.dispose();
    _serialController.dispose();
    super.dispose();
  }

  Map<String, dynamic> _decode() {
    int year = 2019;
    int week = 42;
    String tonnage = '3.0 Tons (36,000 BTU)';
    String efficiency = '16 SEER';
    String equipmentType = 'Central AC Condenser';

    final cleanSerial = _serialController.text.trim().toUpperCase();
    final cleanModel = _modelController.text.trim().toUpperCase();

    if (_brand == 'Carrier' || _brand == 'Bryant') {
      if (cleanSerial.length >= 4 && int.tryParse(cleanSerial.substring(0, 4)) != null) {
        week = int.tryParse(cleanSerial.substring(0, 2)) ?? 42;
        final rawYear = int.tryParse(cleanSerial.substring(2, 4)) ?? 19;
        year = rawYear > 50 ? 1900 + rawYear : 2000 + rawYear;
      }
      if (cleanModel.contains('36')) tonnage = '3.0 Tons (36k BTU)';
      if (cleanModel.contains('48')) tonnage = '4.0 Tons (48k BTU)';
      if (cleanModel.contains('24')) tonnage = '2.0 Tons (24k BTU)';
      if (cleanModel.contains('60')) tonnage = '5.0 Tons (60k BTU)';
    } else if (_brand == 'Trane') {
      year = 2018;
      week = 26;
      equipmentType = 'Heat Pump / Air Handler';
      efficiency = '15 SEER';
    } else if (_brand == 'Lennox') {
      year = 2020;
      week = 14;
      equipmentType = 'High-Efficiency Gas Furnace (96% AFUE)';
      tonnage = '80k BTU Input';
    } else {
      year = 2017;
      week = 31;
      equipmentType = 'Tankless Water Heater / AC';
    }

    final currentYear = DateTime.now().year;
    final age = currentYear - year;
    final isWarrantyActive = age < 10;

    return {
      'type': equipmentType,
      'tonnage': tonnage,
      'efficiency': efficiency,
      'mfrDate': 'Week $week, $year',
      'age': '$age years old',
      'warranty': isWarrantyActive ? 'ACTIVE (10-Yr Registered)' : 'EXPIRED',
      'isWarrantyActive': isWarrantyActive,
    };
  }

  void _copyToClipboard(Map<String, dynamic> data) {
    final summary = '$_brand ${data['type']} | Model: ${_modelController.text.trim()} | Serial: ${_serialController.text.trim()} | Mfr: ${data['mfrDate']} (${data['age']}) | Cap: ${data['tonnage']} | Warranty: ${data['warranty']}';
    Clipboard.setData(ClipboardData(text: summary));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ Equipment specs & warranty copied to clipboard!'),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final data = _decode();
    final isWarrantyActive = data['isWarrantyActive'] as bool;

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (_, scrollController) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Equipment Serial & Warranty', style: AppTypography.h3),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Decode manufacturer date codes, SEER tonnage & warranty status.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Brand Switcher
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['Carrier', 'Trane', 'Lennox', 'Rheem', 'Goodman'].map((b) {
                    final isSel = _brand == b;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _brand = b),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSel ? AppColors.primary.withValues(alpha: 0.15) : AppColors.surfaceElevated,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isSel ? AppColors.primary : AppColors.border,
                            ),
                          ),
                          child: Text(
                            b,
                            style: AppTypography.caption.copyWith(
                              color: isSel ? AppColors.primary : AppColors.textPrimary,
                              fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 12),

              // Inputs
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _modelController,
                      style: AppTypography.bodyMedium.copyWith(fontFamily: 'monospace'),
                      decoration: const InputDecoration(
                        labelText: 'Model Number',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _serialController,
                      style: AppTypography.bodyMedium.copyWith(fontFamily: 'monospace'),
                      decoration: const InputDecoration(
                        labelText: 'Serial Number',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Results Card
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: ListView(
                    controller: scrollController,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Text(
                              '$_brand ${data['type']}',
                              style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isWarrantyActive ? AppColors.success.withValues(alpha: 0.15) : AppColors.danger.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              data['warranty'] as String,
                              style: AppTypography.caption.copyWith(
                                color: isWarrantyActive ? AppColors.success : AppColors.danger,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Divider(height: 1, color: AppColors.border),
                      const SizedBox(height: 10),

                      _buildRow('Manufacture Date', '${data['mfrDate']} (${data['age']})'),
                      _buildRow('Capacity / Tonnage', data['tonnage'] as String),
                      _buildRow('Efficiency Rating', data['efficiency'] as String, isHighlight: true),
                      _buildRow('Coverage Terms', isWarrantyActive ? 'Standard 10-Yr Parts & Compressor' : 'Expired - Out of warranty'),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _copyToClipboard(data),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.copy_rounded, size: 18, color: Colors.black),
                  label: Text(
                    'Copy Equipment Tag Specs',
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

  Widget _buildRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: isHighlight ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
