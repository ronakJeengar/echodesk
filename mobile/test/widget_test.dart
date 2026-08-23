import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:echodesk_mobile/main.dart';
import 'package:echodesk_mobile/features/dashboard/presentation/providers/dashboard_provider.dart';

void main() {
  setUp(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  testWidgets('EchoDeskApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          dashboardStatsProvider.overrideWith(
            (ref) => DashboardStatsModel(
              totalVoiceHours: 2.4,
              totalRecordings: 12,
              totalCustomers: 8,
              totalJobs: 6,
              completedJobs: 4,
              pendingTasks: 8,
            ),
          ),
        ],
        child: const EchoDeskApp(),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));

    // Verify app starts and renders EchoDesk title
    expect(find.text('EchoDesk'), findsOneWidget);
    expect(find.text('Record On-Site Notes'), findsOneWidget);
  });
}
