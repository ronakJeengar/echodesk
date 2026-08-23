import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../../core/widgets/metric_tile.dart';
import '../providers/customers_provider.dart';
import '../widgets/add_customer_sheet.dart';

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
            icon: const Icon(Icons.person_add_rounded, color: AppColors.primary),
            tooltip: 'Add Client',
            onPressed: () => AddCustomerSheet.show(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary),
            onPressed: () => ref.invalidate(customersListProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Action Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: (val) {
                      ref.read(customersSearchQueryProvider.notifier).state = val;
                    },
                    decoration: const InputDecoration(
                      hintText: 'Search customers by name, phone, or tag...',
                      prefixIcon: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton.icon(
                  onPressed: () => AddCustomerSheet.show(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: Text('Add', style: AppTypography.button.copyWith(color: Colors.black, fontSize: 13)),
                ),
              ],
            ),
          ),

          Expanded(
            child: customersAsync.when(
              data: (customers) {
                if (customers.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.people_outline_rounded, size: 48, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        Text('No customers found', style: AppTypography.h3),
                        const SizedBox(height: 4),
                        Text(
                          'Tap "+ Add" above to register your first client.',
                          style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(customersListProvider),
                  color: AppColors.primary,
                  backgroundColor: AppColors.surface,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: customers.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final customer = customers[index];
                      return InkWell(
                        onTap: () => context.push('/customers/${customer.id}'),
                        borderRadius: BorderRadius.circular(14),
                        child: _buildCustomerTile(
                          name: customer.name,
                          company: customer.companyName ?? 'Independent Client',
                          phone: customer.phone ?? 'No phone listed',
                          location: customer.city != null
                              ? '${customer.city}, ${customer.state ?? ''}'
                              : customer.address ?? 'On-site service',
                          voiceNotesCount: customer.voiceNotesCount ?? 0,
                          jobsCount: customer.jobsCount ?? 0,
                        ),
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
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  name,
                  style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              StatusPill(
                label: '$voiceNotesCount notes',
                color: AppColors.primary,
                icon: Icons.mic_none_rounded,
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(company, style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.phone_outlined, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(phone, style: AppTypography.caption),
              const SizedBox(width: 16),
              const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  location,
                  style: AppTypography.caption,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
