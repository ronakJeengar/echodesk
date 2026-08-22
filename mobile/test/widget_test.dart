import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:echodesk_mobile/main.dart';

void main() {
  testWidgets('EchoDeskApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: EchoDeskApp(),
      ),
    );

    // Verify app starts and renders EchoDesk title
    expect(find.text('EchoDesk'), findsOneWidget);
  });
}
