import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/models/customer_model.dart';
import '../providers/customers_provider.dart';

final customerDetailFutureProvider =
    FutureProvider.autoDispose.family<CustomerModel?, String>((ref, customerId) async {
  final repo = ref.watch(customersRepositoryProvider);
  final res = await repo.getCustomer(customerId);
  if (res.success && res.data != null) {
    return res.data;
  }
  return null;
});

class CustomerDetailPage extends ConsumerWidget {
  final String customerId;

  const CustomerDetailPage({super.key, required this.customerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customerAsync = ref.watch(customerDetailFutureProvider(customerId));
    final timelineAsync = ref.watch(customerTimelineProvider(customerId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Customer Profile', style: AppTypography.h3),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: customerAsync.when(
        data: (customer) {
          if (customer == null) {
            return const Center(child: Text('Customer not found'));
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // 1. Profile Header Card
              Container(
                padding: const EdgeInsets.all(20),
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
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(customer.name, style: AppTypography.h2),
                              if (customer.companyName != null)
                                Text(customer.companyName!,
                                    style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGlow,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
                          ),
                          child: Text(
                            'ACTIVE CLIENT',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Contact info rows
                    if (customer.phone != null) ...[
                      Row(
                        children: [
                          const Icon(Icons.phone_outlined, size: 16, color: AppColors.textMuted),
                          const SizedBox(width: 8),
                          Text(customer.phone!, style: AppTypography.bodyMedium),
                        ],
                      ),
                      const SizedBox(height: 8),
                    ],

                    if (customer.address != null) ...[
                      Row(
                        children: [
                          const Icon(Icons.location_on_outlined, size: 16, color: AppColors.textMuted),
                          const SizedBox(width: 8),
                          Expanded(child: Text(customer.address!, style: AppTypography.bodyMedium)),
                        ],
                      ),
                      const SizedBox(height: 8),
                    ],

                    if (customer.tags.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: customer.tags.map((t) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceElevated,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Text(t, style: AppTypography.caption),
                          );
                        }).toList(),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 2. Chronological Voice & Job Timeline
              Text('Activity & Voice Notes Timeline', style: AppTypography.h3),
              const SizedBox(height: 12),

              timelineAsync.when(
                data: (timelineData) {
                  final recordings = timelineData?['recordings'] as List<dynamic>? ?? [];
                  final jobs = timelineData?['jobs'] as List<dynamic>? ?? [];

                  if (recordings.isEmpty && jobs.isEmpty) {
                    return Container(
                      padding: const EdgeInsets.all(20),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text('No activity logged yet for this client.', style: AppTypography.bodyMedium),
                    );
                  }

                  return Column(
                    children: [
                      ...recordings.map((r) {
                        final recId = r['id'] as String;
                        final transcript = r['rawTranscript'] as String? ?? 'Voice note recorded';
                        final dur = (r['audioDurationSec'] as num?)?.toDouble() ?? 45.0;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: InkWell(
                            onTap: () => context.push('/recordings/$recId'),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.all(14),
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
                                      Row(
                                        children: [
                                          const Icon(Icons.mic_rounded, size: 16, color: AppColors.primary),
                                          const SizedBox(width: 6),
                                          Text('Voice Note', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                                        ],
                                      ),
                                      Text('${dur.toStringAsFixed(1)}s', style: AppTypography.caption),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(transcript, style: AppTypography.bodyMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                      ...jobs.map((j) {
                        final title = j['title'] as String;
                        final status = j['status'] as String? ?? 'SCHEDULED';
                        final amount = (j['quotedAmount'] as num?)?.toDouble();

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.build_outlined, size: 16, color: AppColors.secondary),
                                        const SizedBox(width: 6),
                                        Text(title, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text('Status: $status', style: AppTypography.caption),
                                  ],
                                ),
                                if (amount != null)
                                  Text(
                                    '\$${amount.toStringAsFixed(2)}',
                                    style: AppTypography.h3.copyWith(color: AppColors.success, fontSize: 16),
                                  ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  );
                },
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                ),
                error: (err, _) => Text('Error loading timeline: $err', style: AppTypography.caption),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (err, _) => Center(child: Text('Error loading customer: $err')),
      ),
    );
  }
}
