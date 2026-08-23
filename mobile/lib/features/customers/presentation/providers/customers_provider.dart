import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/customers_repository.dart';
import '../../domain/models/customer_model.dart';

final customersRepositoryProvider = Provider<CustomersRepository>((ref) {
  return CustomersRepository();
});

final customersSearchQueryProvider = StateProvider<String>((ref) => '');

final customersListProvider = FutureProvider.autoDispose<List<CustomerModel>>((ref) async {
  final repo = ref.watch(customersRepositoryProvider);
  final query = ref.watch(customersSearchQueryProvider);

  final res = await repo.listCustomers(search: query);
  if (res.success && res.data != null) {
    return res.data!;
  }
  return [];
});

final customerTimelineProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>?, String>((ref, customerId) async {
  final repo = ref.watch(customersRepositoryProvider);
  final res = await repo.getCustomerTimeline(customerId);
  if (res.success && res.data != null) {
    return res.data;
  }
  return null;
});
