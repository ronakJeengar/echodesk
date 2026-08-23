class WordTimestamp {
  final String word;
  final double start;
  final double end;
  final double confidence;

  WordTimestamp({
    required this.word,
    required this.start,
    required this.end,
    required this.confidence,
  });

  factory WordTimestamp.fromJson(Map<String, dynamic> json) {
    return WordTimestamp(
      word: json['word'] as String? ?? '',
      start: (json['start'] as num?)?.toDouble() ?? 0.0,
      end: (json['end'] as num?)?.toDouble() ?? 0.0,
      confidence: (json['confidence'] as num?)?.toDouble() ?? 1.0,
    );
  }
}

class ExtractedPart {
  final String name;
  final int quantity;
  final double unitCost;
  final double? totalCost;

  ExtractedPart({
    required this.name,
    required this.quantity,
    required this.unitCost,
    this.totalCost,
  });

  factory ExtractedPart.fromJson(Map<String, dynamic> json) {
    return ExtractedPart(
      name: json['name'] as String? ?? 'Part',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      unitCost: (json['unitCost'] as num?)?.toDouble() ?? 0.0,
      totalCost: (json['totalCost'] as num?)?.toDouble(),
    );
  }
}

class ExtractedFinancials {
  final double quotedAmount;
  final double? laborCost;
  final double? partsCost;
  final bool isPaid;
  final String paymentMethod;

  ExtractedFinancials({
    required this.quotedAmount,
    this.laborCost,
    this.partsCost,
    this.isPaid = false,
    this.paymentMethod = 'INVOICE_PENDING',
  });

  factory ExtractedFinancials.fromJson(Map<String, dynamic> json) {
    return ExtractedFinancials(
      quotedAmount: (json['quotedAmount'] as num?)?.toDouble() ?? 0.0,
      laborCost: (json['laborCost'] as num?)?.toDouble(),
      partsCost: (json['partsCost'] as num?)?.toDouble(),
      isPaid: json['isPaid'] as bool? ?? false,
      paymentMethod: json['paymentMethod'] as String? ?? 'INVOICE_PENDING',
    );
  }
}

class ExtractedActionItem {
  final String title;
  final String? description;
  final String? dueDate;
  final String priority;
  final String assigneeRole;

  ExtractedActionItem({
    required this.title,
    this.description,
    this.dueDate,
    this.priority = 'MEDIUM',
    this.assigneeRole = 'FIELD_TECH',
  });

  factory ExtractedActionItem.fromJson(Map<String, dynamic> json) {
    return ExtractedActionItem(
      title: json['title'] as String? ?? 'Action item',
      description: json['description'] as String?,
      dueDate: json['dueDate'] as String?,
      priority: json['priority'] as String? ?? 'MEDIUM',
      assigneeRole: json['assigneeRole'] as String? ?? 'FIELD_TECH',
    );
  }
}

class ExtractedDataModel {
  final String executiveSummary;
  final String sentiment;
  final double confidenceScore;
  final Map<String, dynamic>? customerInfo;
  final Map<String, dynamic>? jobDetails;
  final List<ExtractedPart> partsAndServices;
  final ExtractedFinancials? financials;
  final List<ExtractedActionItem> actionItems;

  ExtractedDataModel({
    required this.executiveSummary,
    this.sentiment = 'NEUTRAL',
    this.confidenceScore = 0.98,
    this.customerInfo,
    this.jobDetails,
    this.partsAndServices = const [],
    this.financials,
    this.actionItems = const [],
  });

  factory ExtractedDataModel.fromJson(Map<String, dynamic> json) {
    return ExtractedDataModel(
      executiveSummary: json['executiveSummary'] as String? ?? json['summary'] as String? ?? '',
      sentiment: json['sentiment'] as String? ?? 'NEUTRAL',
      confidenceScore: (json['confidenceScore'] as num?)?.toDouble() ?? 0.98,
      customerInfo: json['customerInfo'] as Map<String, dynamic>? ?? json['customer'] as Map<String, dynamic>?,
      jobDetails: json['jobDetails'] as Map<String, dynamic>? ?? json['job'] as Map<String, dynamic>?,
      partsAndServices: (json['partsAndServices'] as List<dynamic>? ?? json['partsUsed'] as List<dynamic>? ?? [])
          .map((p) => ExtractedPart.fromJson(p as Map<String, dynamic>))
          .toList(),
      financials: json['financials'] != null
          ? ExtractedFinancials.fromJson(json['financials'] as Map<String, dynamic>)
          : null,
      actionItems: (json['actionItems'] as List<dynamic>? ?? [])
          .map((a) => ExtractedActionItem.fromJson(a as Map<String, dynamic>))
          .toList(),
    );
  }
}

class RecordingModel {
  final String id;
  final String workspaceId;
  final String? customerId;
  final String? jobId;
  final String audioUrl;
  final double audioDurationSec;
  final String audioFormat;
  final String status;
  final String? rawTranscript;
  final List<WordTimestamp> wordTimestamps;
  final ExtractedDataModel? extractedData;
  final String recordedAt;

  RecordingModel({
    required this.id,
    required this.workspaceId,
    this.customerId,
    this.jobId,
    required this.audioUrl,
    required this.audioDurationSec,
    this.audioFormat = 'm4a',
    required this.status,
    this.rawTranscript,
    this.wordTimestamps = const [],
    this.extractedData,
    required this.recordedAt,
  });

  factory RecordingModel.fromJson(Map<String, dynamic> json) {
    return RecordingModel(
      id: json['id'] as String,
      workspaceId: json['workspaceId'] as String? ?? '',
      customerId: json['customerId'] as String?,
      jobId: json['jobId'] as String?,
      audioUrl: json['audioUrl'] as String? ?? '',
      audioDurationSec: (json['audioDurationSec'] as num?)?.toDouble() ?? 0.0,
      audioFormat: json['audioFormat'] as String? ?? 'm4a',
      status: json['status'] as String? ?? 'PENDING',
      rawTranscript: json['rawTranscript'] as String?,
      wordTimestamps: (json['wordTimestamps'] as List<dynamic>? ?? [])
          .map((w) => WordTimestamp.fromJson(w as Map<String, dynamic>))
          .toList(),
      extractedData: json['extractedData'] != null
          ? ExtractedDataModel.fromJson(json['extractedData'] as Map<String, dynamic>)
          : null,
      recordedAt: json['recordedAt'] as String? ?? DateTime.now().toIso8601String(),
    );
  }
}
