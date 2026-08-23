import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../features/recordings/domain/models/recording_model.dart';

class WorkOrderPdfService {
  static const PdfColor emeraldPrimary = PdfColor.fromInt(0xFF059669);
  static const PdfColor emeraldLight = PdfColor.fromInt(0xFFD1FAE5);
  static const PdfColor emeraldDark = PdfColor.fromInt(0xFF065F46);

  static Future<Uint8List> generateWorkOrderPdf({
    required RecordingModel recording,
    String companyName = 'Pro HVAC Solutions',
    String technicianName = 'Dave Miller',
  }) async {
    final pdf = pw.Document();
    final data = recording.extractedData;

    final customerName = data?.customerInfo?['name'] ?? 'Client';
    final customerCompany = data?.customerInfo?['companyName'];
    final customerPhone = data?.customerInfo?['phone'] ?? 'N/A';
    final customerAddress = data?.customerInfo?['address'] ?? 'N/A';

    final invoiceNumber = 'WO-${recording.id.replaceAll('rec-', '').toUpperCase()}';
    final dateStr = DateFormat('MMMM dd, yyyy').format(DateTime.now());

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.letter,
        margin: const pw.EdgeInsets.all(36),
        build: (pw.Context context) {
          return [
            // 1. Header & Branding
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      companyName,
                      style: pw.TextStyle(
                        fontSize: 20,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.blueGrey900,
                      ),
                    ),
                    pw.SizedBox(height: 2),
                    pw.Text(
                      'Field Operations & Diagnostic Work Order',
                      style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700),
                    ),
                    pw.Text(
                      'Generated via EchoDesk Voice AI',
                      style: const pw.TextStyle(fontSize: 9, color: emeraldDark),
                    ),
                  ],
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Text(
                      invoiceNumber,
                      style: pw.TextStyle(
                        fontSize: 14,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.blueGrey800,
                      ),
                    ),
                    pw.SizedBox(height: 2),
                    pw.Text('Date: $dateStr', style: const pw.TextStyle(fontSize: 10)),
                    pw.Text('Technician: $technicianName', style: const pw.TextStyle(fontSize: 10)),
                  ],
                ),
              ],
            ),

            pw.Divider(color: PdfColors.grey400, thickness: 1, height: 24),

            // 2. Customer Information Box
            pw.Container(
              padding: const pw.EdgeInsets.all(12),
              decoration: pw.BoxDecoration(
                color: PdfColors.grey100,
                borderRadius: pw.BorderRadius.circular(6),
                border: pw.Border.all(color: PdfColors.grey300),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        'CUSTOMER INFORMATION',
                        style: pw.TextStyle(
                          fontSize: 9,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.grey700,
                        ),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        customerCompany != null ? '$customerName ($customerCompany)' : customerName,
                        style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text('Location: $customerAddress', style: const pw.TextStyle(fontSize: 10)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        'CONTACT & STATUS',
                        style: pw.TextStyle(
                          fontSize: 9,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.grey700,
                        ),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text('Phone: $customerPhone', style: const pw.TextStyle(fontSize: 10)),
                      pw.SizedBox(height: 2),
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: pw.BoxDecoration(
                          color: emeraldLight,
                          borderRadius: pw.BorderRadius.circular(4),
                        ),
                        child: pw.Text(
                          'COMPLETED',
                          style: pw.TextStyle(
                            fontSize: 9,
                            fontWeight: pw.FontWeight.bold,
                            color: emeraldDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            pw.SizedBox(height: 16),

            // 3. Work Summary & Diagnostic Section
            pw.Text(
              'DIAGNOSTIC & SERVICE SUMMARY',
              style: pw.TextStyle(
                fontSize: 11,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.blueGrey800,
              ),
            ),
            pw.SizedBox(height: 6),
            pw.Container(
              padding: const pw.EdgeInsets.all(10),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: PdfColors.grey300),
                borderRadius: pw.BorderRadius.circular(6),
              ),
              child: pw.Text(
                data?.executiveSummary ?? recording.rawTranscript ?? 'Diagnostic debrief logged.',
                style: const pw.TextStyle(fontSize: 10, lineSpacing: 2),
              ),
            ),

            pw.SizedBox(height: 16),

            // 4. Materials & Parts Table
            if (data != null && data.partsAndServices.isNotEmpty) ...[
              pw.Text(
                'ITEMIZED PARTS & MATERIALS',
                style: pw.TextStyle(
                  fontSize: 11,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.blueGrey800,
                ),
              ),
              pw.SizedBox(height: 6),
              pw.Table(
                border: pw.TableBorder.all(color: PdfColors.grey300),
                columnWidths: {
                  0: const pw.FlexColumnWidth(4),
                  1: const pw.FlexColumnWidth(1),
                  2: const pw.FlexColumnWidth(2),
                  3: const pw.FlexColumnWidth(2),
                },
                children: [
                  pw.TableRow(
                    decoration: const pw.BoxDecoration(color: PdfColors.grey200),
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(6),
                        child: pw.Text('Item Description', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(6),
                        child: pw.Text('Qty', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold), textAlign: pw.TextAlign.center),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(6),
                        child: pw.Text('Unit Price', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold), textAlign: pw.TextAlign.right),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(6),
                        child: pw.Text('Total', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold), textAlign: pw.TextAlign.right),
                      ),
                    ],
                  ),
                  ...data.partsAndServices.map(
                    (part) => pw.TableRow(
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text(part.name, style: const pw.TextStyle(fontSize: 9)),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text('${part.quantity}', style: const pw.TextStyle(fontSize: 9), textAlign: pw.TextAlign.center),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text('\$${part.unitCost.toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 9), textAlign: pw.TextAlign.right),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text('\$${(part.totalCost ?? part.unitCost * part.quantity).toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 9), textAlign: pw.TextAlign.right),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              pw.SizedBox(height: 16),
            ],

            // 5. Financial Breakdown
            if (data?.financials != null) ...[
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.end,
                children: [
                  pw.Container(
                    width: 220,
                    child: pw.Column(
                      children: [
                        if (data!.financials!.laborCost != null)
                          pw.Row(
                            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                            children: [
                              pw.Text('Labor & Diagnostic:', style: const pw.TextStyle(fontSize: 10)),
                              pw.Text('\$${data.financials!.laborCost!.toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 10)),
                            ],
                          ),
                        if (data.financials!.partsCost != null)
                          pw.Row(
                            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                            children: [
                              pw.Text('Parts & Materials:', style: const pw.TextStyle(fontSize: 10)),
                              pw.Text('\$${data.financials!.partsCost!.toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 10)),
                            ],
                          ),
                        pw.Divider(color: PdfColors.grey400, thickness: 0.5, height: 8),
                        pw.Row(
                          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                          children: [
                            pw.Text(
                              'TOTAL DUE:',
                              style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900),
                            ),
                            pw.Text(
                              '\$${data.financials!.quotedAmount.toStringAsFixed(2)}',
                              style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: emeraldDark),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              pw.SizedBox(height: 16),
            ],

            // 6. Action Items & Follow-ups
            if (data != null && data.actionItems.isNotEmpty) ...[
              pw.Text(
                'SCHEDULED ACTION ITEMS & NEXT STEPS',
                style: pw.TextStyle(
                  fontSize: 11,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.blueGrey800,
                ),
              ),
              pw.SizedBox(height: 6),
              ...data.actionItems.map(
                (action) => pw.Container(
                  margin: const pw.EdgeInsets.only(bottom: 4),
                  padding: const pw.EdgeInsets.all(6),
                  decoration: pw.BoxDecoration(
                    color: PdfColors.grey50,
                    border: pw.Border.all(color: PdfColors.grey300),
                    borderRadius: pw.BorderRadius.circular(4),
                  ),
                  child: pw.Row(
                    children: [
                      pw.Container(
                        width: 8,
                        height: 8,
                        decoration: const pw.BoxDecoration(
                          color: PdfColors.amber700,
                          shape: pw.BoxShape.circle,
                        ),
                      ),
                      pw.SizedBox(width: 8),
                      pw.Expanded(
                        child: pw.Text(
                          '${action.title} [Priority: ${action.priority}]',
                          style: const pw.TextStyle(fontSize: 9),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              pw.SizedBox(height: 24),
            ],

            // 7. Signatures
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Container(width: 180, height: 1, color: PdfColors.grey600),
                    pw.SizedBox(height: 4),
                    pw.Text('Technician Signature ($technicianName)', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
                  ],
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Container(width: 180, height: 1, color: PdfColors.grey600),
                    pw.SizedBox(height: 4),
                    pw.Text('Customer Acceptance Signature', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
                  ],
                ),
              ],
            ),
          ];
        },
      ),
    );

    return pdf.save();
  }

  static Future<void> previewAndPrint({
    required BuildContext context,
    required RecordingModel recording,
    String companyName = 'Pro HVAC Solutions',
    String technicianName = 'Dave Miller',
  }) async {
    final pdfBytes = await generateWorkOrderPdf(
      recording: recording,
      companyName: companyName,
      technicianName: technicianName,
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfBytes,
      name: 'WorkOrder_${recording.id}.pdf',
    );
  }

  static Future<void> shareWorkOrderPdf({
    required RecordingModel recording,
    String companyName = 'Pro HVAC Solutions',
    String technicianName = 'Dave Miller',
  }) async {
    final pdfBytes = await generateWorkOrderPdf(
      recording: recording,
      companyName: companyName,
      technicianName: technicianName,
    );

    await Printing.sharePdf(
      bytes: pdfBytes,
      filename: 'WorkOrder_${recording.id}.pdf',
    );
  }

  static Future<Uint8List> generateCustomerStatementPdf({
    required String customerName,
    String? companyName,
    String? phone,
    String? address,
    required List<dynamic> jobs,
    required List<dynamic> recordings,
    String businessName = 'Apex Field Services',
  }) async {
    final pdf = pw.Document();
    final dateStr = DateFormat('MMMM dd, yyyy').format(DateTime.now());

    double totalBilled = 0.0;
    for (final j in jobs) {
      if (j['quotedAmount'] != null) {
        totalBilled += (j['quotedAmount'] as num).toDouble();
      }
    }

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.letter,
        margin: const pw.EdgeInsets.all(36),
        build: (pw.Context context) {
          return [
            // Header
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      businessName,
                      style: pw.TextStyle(
                        fontSize: 20,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.blueGrey900,
                      ),
                    ),
                    pw.SizedBox(height: 2),
                    pw.Text(
                      'Client Account Statement & Service Ledger',
                      style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700),
                    ),
                    pw.Text(
                      'Automated Field Operations Audit Trail',
                      style: const pw.TextStyle(fontSize: 9, color: emeraldDark),
                    ),
                  ],
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Container(
                      padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: const pw.BoxDecoration(
                        color: emeraldLight,
                        borderRadius: pw.BorderRadius.all(pw.Radius.circular(4)),
                      ),
                      child: pw.Text(
                        'STATEMENT',
                        style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: emeraldDark),
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text('Date: $dateStr', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey800)),
                  ],
                ),
              ],
            ),

            pw.SizedBox(height: 20),

            // Client Info & Financial Summary
            pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Expanded(
                  child: pw.Container(
                    padding: const pw.EdgeInsets.all(12),
                    decoration: const pw.BoxDecoration(
                      color: PdfColors.grey100,
                      borderRadius: pw.BorderRadius.all(pw.Radius.circular(6)),
                    ),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('CLIENT ACCOUNT:', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColors.grey700)),
                        pw.SizedBox(height: 4),
                        pw.Text(customerName, style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                        if (companyName != null)
                          pw.Text(companyName, style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey800)),
                        if (phone != null)
                          pw.Text('Phone: $phone', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
                        if (address != null)
                          pw.Text('Location: $address', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
                      ],
                    ),
                  ),
                ),
                pw.SizedBox(width: 16),
                pw.Expanded(
                  child: pw.Container(
                    padding: const pw.EdgeInsets.all(12),
                    decoration: pw.BoxDecoration(
                      color: emeraldLight,
                      borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
                      border: pw.Border.all(color: emeraldPrimary, width: 0.5),
                    ),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('LIFETIME SERVICE REVENUE', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: emeraldDark)),
                        pw.SizedBox(height: 4),
                        pw.Text('\$${totalBilled.toStringAsFixed(2)}', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: emeraldDark)),
                        pw.SizedBox(height: 2),
                        pw.Text('Total Jobs: ${jobs.length} • Audio Visits: ${recordings.length}', style: const pw.TextStyle(fontSize: 9, color: emeraldDark)),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            pw.SizedBox(height: 20),

            // Service History Table
            pw.Text('Service History & Work Orders', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
            pw.SizedBox(height: 8),

            pw.TableHelper.fromTextArray(
              headers: ['Type', 'Service / Diagnostic Description', 'Status', 'Quoted Amount'],
              data: [
                ...jobs.map((j) => [
                  'Work Order',
                  j['title'] ?? 'Field Service',
                  j['status'] ?? 'SCHEDULED',
                  j['quotedAmount'] != null ? '\$${(j['quotedAmount'] as num).toDouble().toStringAsFixed(2)}' : '-',
                ]),
                ...recordings.map((r) => [
                  'Voice Debrief',
                  (r['rawTranscript'] as String?)?.isNotEmpty == true ? (r['rawTranscript'] as String).substring(0, (r['rawTranscript'] as String).length.clamp(0, 70)) : 'Audio diagnostic debrief',
                  'LOGGED',
                  '-',
                ]),
              ],
              headerStyle: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColors.white),
              headerDecoration: const pw.BoxDecoration(color: emeraldPrimary),
              cellStyle: const pw.TextStyle(fontSize: 9),
              cellPadding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            ),

            pw.SizedBox(height: 30),

            // Footer Signoff
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Container(width: 150, height: 1, color: PdfColors.grey400),
                    pw.SizedBox(height: 4),
                    pw.Text('Client Authorization', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
                  ],
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Container(width: 150, height: 1, color: PdfColors.grey400),
                    pw.SizedBox(height: 4),
                    pw.Text('Service Provider Signature', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
                  ],
                ),
              ],
            ),
          ];
        },
      ),
    );

    return pdf.save();
  }

  static Future<void> previewAndPrintStatement({
    required BuildContext context,
    required String customerName,
    String? companyName,
    String? phone,
    String? address,
    required List<dynamic> jobs,
    required List<dynamic> recordings,
  }) async {
    final pdfBytes = await generateCustomerStatementPdf(
      customerName: customerName,
      companyName: companyName,
      phone: phone,
      address: address,
      jobs: jobs,
      recordings: recordings,
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfBytes,
      name: 'Statement_${customerName.replaceAll(' ', '_')}.pdf',
    );
  }
}
