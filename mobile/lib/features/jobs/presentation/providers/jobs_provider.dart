import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/jobs_repository.dart';
import '../../domain/models/job_model.dart';

final jobsRepositoryProvider = Provider<JobsRepository>((ref) {
  return JobsRepository();
});

final jobsFilterStatusProvider = StateProvider<String?>((ref) => null);

final jobsListProvider = FutureProvider.autoDispose<List<JobModel>>((ref) async {
  final repo = ref.watch(jobsRepositoryProvider);
  final status = ref.watch(jobsFilterStatusProvider);

  final res = await repo.listJobs(status: status);
  if (res.success && res.data != null) {
    return res.data!;
  }
  return [];
});

final tasksListProvider = FutureProvider.autoDispose<List<TaskModel>>((ref) async {
  final repo = ref.watch(jobsRepositoryProvider);
  final res = await repo.listTasks();
  if (res.success && res.data != null) {
    return res.data!;
  }
  return [];
});
