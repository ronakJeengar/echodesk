import 'package:flutter_test/flutter_test.dart';
import 'package:echodesk_mobile/features/recordings/domain/models/recording_model.dart';
import 'package:echodesk_mobile/features/customers/domain/models/customer_model.dart';
import 'package:echodesk_mobile/features/jobs/domain/models/job_model.dart';

void main() {
  group('Domain Models Serialization Tests', () {
    test('ExtractedDataModel parses complete HVAC JSON extraction', () {
      final json = {
        'executiveSummary': 'Replaced faulty dual run capacitor on outdoor condenser unit.',
        'sentiment': 'POSITIVE',
        'confidenceScore': 0.98,
        'customerInfo': {
          'name': 'Sarah Jenkins',
          'companyName': 'Apex Logistics',
          'phone': '555-0199',
        },
        'jobDetails': {
          'title': 'HVAC Diagnostic & Service',
          'category': 'HVAC',
          'laborHours': 1.5,
        },
        'partsAndServices': [
          {
            'name': '45/5 MFD Dual Round Run Capacitor',
            'quantity': 1,
            'unitCost': 42.0,
            'totalCost': 42.0,
          }
        ],
        'financials': {
          'quotedAmount': 285.0,
          'laborCost': 150.0,
          'partsCost': 42.0,
          'isPaid': false,
        },
        'actionItems': [
          {
            'title': 'Send invoice #4092',
            'priority': 'HIGH',
            'assigneeRole': 'ADMIN',
          }
        ],
      };

      final model = ExtractedDataModel.fromJson(json);

      expect(model.executiveSummary, contains('capacitor'));
      expect(model.customerInfo?['name'], 'Sarah Jenkins');
      expect(model.customerInfo?['companyName'], 'Apex Logistics');
      expect(model.financials?.quotedAmount, 285.0);
      expect(model.partsAndServices.length, 1);
      expect(model.partsAndServices.first.name, contains('45/5 MFD'));
      expect(model.actionItems.length, 1);
      expect(model.actionItems.first.title, contains('4092'));
    });

    test('CustomerModel parses CRM customer object', () {
      final json = {
        'id': 'cust-101',
        'workspaceId': 'w-501',
        'name': 'Mark Henderson',
        'companyName': null,
        'phone': '555-0288',
        'address': '742 Evergreen Terrace',
        'city': 'Austin',
        'state': 'TX',
        'tags': ['Residential', 'Plumbing'],
        '_count': {'jobs': 2, 'recordings': 3},
      };

      final customer = CustomerModel.fromJson(json);

      expect(customer.id, 'cust-101');
      expect(customer.name, 'Mark Henderson');
      expect(customer.tags, contains('Plumbing'));
      expect(customer.jobsCount, 2);
      expect(customer.voiceNotesCount, 3);
    });

    test('JobModel parses field operations job', () {
      final json = {
        'id': 'job-201',
        'workspaceId': 'w-501',
        'customerId': 'cust-101',
        'title': 'Water Heater Replacement',
        'status': 'COMPLETED',
        'priority': 'HIGH',
        'quotedAmount': 650.0,
        'customer': {
          'name': 'Mark Henderson',
        },
      };

      final job = JobModel.fromJson(json);

      expect(job.id, 'job-201');
      expect(job.title, 'Water Heater Replacement');
      expect(job.status, 'COMPLETED');
      expect(job.quotedAmount, 650.0);
      expect(job.customerName, 'Mark Henderson');
    });
  });
}
