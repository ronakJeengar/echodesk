import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class CustomersPage extends StatelessWidget {
  const CustomersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Customers', style: AppTypography.h3),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_outlined, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Search Input
          TextField(
            decoration: InputDecoration(
              hintText: 'Search customers by name, phone, or tag...',
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
              suffixIcon: const Icon(Icons.tune_rounded, color: AppColors.textMuted, size: 18),
            ),
          ),
          const SizedBox(height: 20),

          _buildCustomerTile(
            name: 'Sarah Jenkins',
            company: 'Apex Logistics LLC',
            phone: '(555) 019-2834',
            location: 'Austin, TX',
            voiceNotesCount: 4,
            jobsCount: 2,
          ),
          const SizedBox(height: 12),
          _buildCustomerTile(
            name: 'Marcus Vance',
            company: 'Oakwood Dental Clinic',
            phone: '(555) 392-8819',
            location: 'Round Rock, TX',
            voiceNotesCount: 2,
            jobsCount: 1,
          ),
          const SizedBox(height: 12),
          _buildCustomerTile(
            name: 'Elena Rostova',
            company: 'Skyline Architecture',
            phone: '(555) 902-1144',
            location: 'Downtown Austin',
            voiceNotesCount: 6,
            jobsCount: 3,
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerTile({
    required String name,
    required String company,
    required String phone,
    required String location,
    required int voiceNotesCount,
    required int jobsCount,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name, style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.mic_none_rounded, size: 12, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      '$voiceNotesCount notes',
                      style: AppTypography.caption.copyWith(color: AppColors.primary),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(company, style: AppTypography.bodyMedium),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.phone_outlined, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(phone, style: AppTypography.caption),
              const SizedBox(width: 16),
              const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(location, style: AppTypography.caption),
            ],
          ),
        ],
      ),
    );
  }
}
