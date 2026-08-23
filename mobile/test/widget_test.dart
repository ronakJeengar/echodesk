import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:echodesk_mobile/main.dart';
import 'package:echodesk_mobile/features/dashboard/presentation/providers/dashboard_provider.dart';
import 'package:echodesk_mobile/features/auth/presentation/providers/auth_provider.dart';

class TestAuthNotifier extends StateNotifier<AuthState> implements AuthNotifier {
  TestAuthNotifier() : super(const AuthState(status: AuthStatus.unauthenticated));

  @override
  Future<void> checkAuth() async {}

  @override
  Future<bool> login(String email, String password) async => true;

  @override
  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    required String workspaceName,
    String? industry,
  }) async => true;

  @override
  Future<void> logout() async {}
}

void main() {
  setUp(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  testWidgets('EchoDeskApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authNotifierProvider.overrideWith((ref) => TestAuthNotifier()),
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

    // Initial frame on splash screen
    await tester.pump();
    expect(find.text('EchoDesk'), findsOneWidget);
    expect(find.text('AI Voice Agent & Field Operations CRM'), findsOneWidget);

    // Fast-forward past splash delays
    await tester.pump(const Duration(milliseconds: 1400));
    await tester.pumpAndSettle();
  });
}
