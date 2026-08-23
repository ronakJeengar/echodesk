import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class TradeCalculatorsSheet extends StatefulWidget {
  const TradeCalculatorsSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const TradeCalculatorsSheet(),
    );
  }

  @override
  State<TradeCalculatorsSheet> createState() => _TradeCalculatorsSheetState();
}

class _TradeCalculatorsSheetState extends State<TradeCalculatorsSheet> {
  String _selectedTrade = 'HVAC';

  // HVAC State
  String _refrigerant = 'R410A';
  double _suctionPressure = 118.0;
  double _suctionLineTemp = 54.0;
  double _liquidPressure = 335.0;
  double _liquidLineTemp = 92.0;

  // Electrical State
  double _voltage = 240.0;
  double _currentAmps = 40.0;
  double _distanceFeet = 75.0;
  String _conductor = 'COPPER';

  // Plumbing State
  double _pipeDiameter = 0.75;
  double _waterPressurePsi = 65.0;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.75,
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
                      const Icon(Icons.calculate_rounded, color: AppColors.primary, size: 22),
                      const SizedBox(width: 8),
                      Text('Trade Diagnostic Calculators', style: AppTypography.h3),
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
                'Instant on-site formulas for HVAC, Electrical & Plumbing sizing.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: 14),

              // Trade Tabs
              Row(
                children: [
                  _buildTradeTab('HVAC', 'HVAC Charge', Icons.local_fire_department_rounded),
                  const SizedBox(width: 8),
                  _buildTradeTab('ELECTRICAL', 'Wire Sizer', Icons.bolt_rounded),
                  const SizedBox(width: 8),
                  _buildTradeTab('PLUMBING', 'Plumbing GPM', Icons.build_rounded),
                ],
              ),
              const SizedBox(height: 16),

              // Content Area
              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    if (_selectedTrade == 'HVAC') _buildHvacCalculator(),
                    if (_selectedTrade == 'ELECTRICAL') _buildElectricalCalculator(),
                    if (_selectedTrade == 'PLUMBING') _buildPlumbingCalculator(),
                    const SizedBox(height: 20),
                  ],
                ),
              ),

              // Bottom Copy Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _copyDiagnosticSummary,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.copy_rounded, size: 18, color: Colors.black),
                  label: Text(
                    'Copy Diagnostics to Clipboard',
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

  Widget _buildTradeTab(String key, String label, IconData icon) {
    final isSelected = _selectedTrade == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTrade = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withValues(alpha: 0.15) : AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: isSelected ? AppColors.primary : AppColors.textMuted),
              const SizedBox(width: 6),
              Text(
                label,
                style: AppTypography.caption.copyWith(
                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHvacCalculator() {
    final evapSatTemp = _refrigerant == 'R410A'
        ? (_suctionPressure - 118) * 0.35 + 40
        : (_suctionPressure - 68) * 0.5 + 40;
    final superheat = max(0.0, _suctionLineTemp - evapSatTemp);

    final condSatTemp = _refrigerant == 'R410A'
        ? (_liquidPressure - 335) * 0.18 + 104
        : (_liquidPressure - 196) * 0.25 + 100;
    final subcooling = max(0.0, condSatTemp - _liquidLineTemp);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Refrigerant:', style: AppTypography.bodyMedium),
            Row(
              children: ['R410A', 'R22'].map((ref) {
                final isSel = _refrigerant == ref;
                return GestureDetector(
                  onTap: () => setState(() => _refrigerant = ref),
                  child: Container(
                    margin: const EdgeInsets.only(left: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSel ? AppColors.primary : AppColors.surfaceElevated,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      ref,
                      style: AppTypography.caption.copyWith(
                        color: isSel ? Colors.black : AppColors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Inputs
        _buildNumberInput('Suction Pressure (PSIG)', _suctionPressure, (v) => setState(() => _suctionPressure = v)),
        _buildNumberInput('Suction Line Temp (°F)', _suctionLineTemp, (v) => setState(() => _suctionLineTemp = v)),
        _buildNumberInput('Liquid Pressure (PSIG)', _liquidPressure, (v) => setState(() => _liquidPressure = v)),
        _buildNumberInput('Liquid Line Temp (°F)', _liquidLineTemp, (v) => setState(() => _liquidLineTemp = v)),

        const SizedBox(height: 12),

        // Results Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Column(
                children: [
                  Text('SUPERHEAT', style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('${superheat.toStringAsFixed(1)}°F', style: AppTypography.h2),
                  Text('Target: 10°F–15°F', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                ],
              ),
              Container(width: 1, height: 40, color: AppColors.border),
              Column(
                children: [
                  Text('SUBCOOLING', style: AppTypography.caption.copyWith(color: AppColors.secondary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('${subcooling.toStringAsFixed(1)}°F', style: AppTypography.h2),
                  Text('Target: 8°F–12°F', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildElectricalCalculator() {
    final k = _conductor == 'COPPER' ? 12.9 : 21.2;
    final targetCm = (2 * k * _currentAmps * _distanceFeet) / (_voltage * 0.03);

    String recommendedWire = '14 AWG';
    if (targetCm > 66360) {
      recommendedWire = '1/0 AWG+';
    } else if (targetCm > 41740) {
      recommendedWire = '2 AWG';
    } else if (targetCm > 26240) {
      recommendedWire = '4 AWG';
    } else if (targetCm > 16510) {
      recommendedWire = '6 AWG';
    } else if (targetCm > 10380) {
      recommendedWire = '8 AWG';
    } else if (targetCm > 6530) {
      recommendedWire = '10 AWG';
    } else if (targetCm > 4110) {
      recommendedWire = '12 AWG';
    }

    final dropVolts = (2 * k * _currentAmps * _distanceFeet) / 26240;
    final dropPct = (dropVolts / _voltage) * 100;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Conductor Material:', style: AppTypography.bodyMedium),
            Row(
              children: ['COPPER', 'ALUMINUM'].map((mat) {
                final isSel = _conductor == mat;
                return GestureDetector(
                  onTap: () => setState(() => _conductor = mat),
                  child: Container(
                    margin: const EdgeInsets.only(left: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: isSel ? AppColors.secondary : AppColors.surfaceElevated,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      mat == 'COPPER' ? 'Copper' : 'Alum',
                      style: AppTypography.caption.copyWith(
                        color: isSel ? Colors.black : AppColors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        const SizedBox(height: 10),

        _buildNumberInput('Circuit Voltage (V)', _voltage, (v) => setState(() => _voltage = v)),
        _buildNumberInput('Load Current (Amps)', _currentAmps, (v) => setState(() => _currentAmps = v)),
        _buildNumberInput('One-Way Distance (Feet)', _distanceFeet, (v) => setState(() => _distanceFeet = v)),

        const SizedBox(height: 12),

        // Results Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.secondary.withValues(alpha: 0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Column(
                children: [
                  Text('RECOMMENDED WIRE', style: AppTypography.caption.copyWith(color: AppColors.secondary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(recommendedWire, style: AppTypography.h2),
                  Text('NEC 3% Max Drop', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                ],
              ),
              Container(width: 1, height: 40, color: AppColors.border),
              Column(
                children: [
                  Text('VOLTAGE DROP', style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('${dropPct.toStringAsFixed(2)}%', style: AppTypography.h2),
                  Text('(${dropVolts.toStringAsFixed(1)}V Loss)', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPlumbingCalculator() {
    final gpm = (29.84 * pow(_pipeDiameter, 2) * 0.62 * sqrt(max(10.0, _waterPressurePsi))).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildNumberInput('Nominal Pipe Diameter (Inches)', _pipeDiameter, (v) => setState(() => _pipeDiameter = v)),
        _buildNumberInput('Static Pressure (PSI)', _waterPressurePsi, (v) => setState(() => _waterPressurePsi = v)),

        const SizedBox(height: 12),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
          ),
          child: Column(
            children: [
              Text('PEAK FLOW RATE', style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('$gpm GPM', style: AppTypography.h1),
              const SizedBox(height: 4),
              Text('Recommended PRV Setting: 55–65 PSI', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNumberInput(String label, double value, Function(double) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(label, style: AppTypography.bodyMedium)),
          SizedBox(
            width: 90,
            height: 38,
            child: TextFormField(
              initialValue: value.toString(),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: AppTypography.bodyLarge.copyWith(fontFamily: 'monospace'),
              decoration: const InputDecoration(
                contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              ),
              onChanged: (val) {
                final d = double.tryParse(val);
                if (d != null) onChanged(d);
              },
            ),
          ),
        ],
      ),
    );
  }

  void _copyDiagnosticSummary() {
    String summary = '';
    if (_selectedTrade == 'HVAC') {
      summary = 'HVAC Diagnostic Readings ($_refrigerant): Suction ${_suctionPressure.toInt()} PSIG / ${_suctionLineTemp.toInt()}°F, Liquid ${_liquidPressure.toInt()} PSIG / ${_liquidLineTemp.toInt()}°F.';
    } else if (_selectedTrade == 'ELECTRICAL') {
      summary = 'Electrical Sizing: ${_voltage.toInt()}V, ${_currentAmps.toInt()}A load over ${_distanceFeet.toInt()} ft.';
    } else {
      summary = 'Plumbing Sizing: $_pipeDiameter" pipe at ${_waterPressurePsi.toInt()} PSI.';
    }

    Clipboard.setData(ClipboardData(text: summary));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✓ Copied to clipboard: "$summary"'),
      ),
    );
    Navigator.pop(context);
  }
}
