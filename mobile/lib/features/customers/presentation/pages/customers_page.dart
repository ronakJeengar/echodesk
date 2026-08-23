import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/customers_provider.dart';

class CustomersPage extends ConsumerWidget {
  const CustomersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customersAsync = ref.watch(customersListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Customers', style: AppTypography.h3),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
            onPressed: () => ref.invalidate(customersListProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Input
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: (val) {
                ref.read(customersSearchQueryProvider.notifier).state = val;
              },
              decoration: const InputDecoration(
                hintText: 'Search customers by name, phone, or tag...',
                prefixIcon: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                suffixIcon: Icon(Icons.tune_rounded, color: AppColors.textMuted, size: 18),
              ),
            ),
          ),

          Expanded(
            child: customersAsync.when(
              data: (customers) {
                if (customers.isEmpty) {
                  return Center(
                    child: Text('No customers found', style: AppTypography.bodyMedium),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(customersListProvider),
                  color: AppColors.primary,
                  backgroundColor: AppColors.surface,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: customers.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final customer = customers[index];
                      return _buildCustomerTile(
                        name: customer.name,
                        company: customer.companyName ?? 'Independent Client',
                        phone: customer.phone ?? 'No phone listed',
                        location: customer.city != null
                            ? '${customer.city}, ${customer.state ?? ''}'
                            : customer.address ?? 'On-site service',
                        voiceNotesCount: customer.voiceNotesCount ?? 0,
                        jobsCount: customer.jobsCount ?? 0,
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (err, _) => Center(
                child: Text('Error loading customers: $err', style: AppTypography.bodyMedium),
              ),
            ),
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
