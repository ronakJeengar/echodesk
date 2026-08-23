class CustomerModel {
  final String id;
  final String workspaceId;
  final String name;
  final String? companyName;
  final String? email;
  final String? phone;
  final String? address;
  final String? city;
  final String? state;
  final String? postalCode;
  final String? notes;
  final List<String> tags;
  final int? voiceNotesCount;
  final int? jobsCount;
  final String? updatedAt;

  CustomerModel({
    required this.id,
    required this.workspaceId,
    required this.name,
    this.companyName,
    this.email,
    this.phone,
    this.address,
    this.city,
    this.state,
    this.postalCode,
    this.notes,
    this.tags = const [],
    this.voiceNotesCount,
    this.jobsCount,
    this.updatedAt,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    final count = json['_count'] as Map<String, dynamic>?;
    return CustomerModel(
      id: json['id'] as String,
      workspaceId: json['workspaceId'] as String? ?? '',
      name: json['name'] as String,
      companyName: json['companyName'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      postalCode: json['postalCode'] as String?,
      notes: json['notes'] as String?,
      tags: (json['tags'] as List<dynamic>? ?? []).map((t) => t.toString()).toList(),
      voiceNotesCount: count?['recordings'] as int? ?? (json['recordings'] as List?)?.length,
      jobsCount: count?['jobs'] as int? ?? (json['jobs'] as List?)?.length,
      updatedAt: json['updatedAt'] as String?,
    );
  }
}

class TimelineItem {
  final String id;
  final String type; // RECORDING, JOB, TASK
  final String timestamp;
  final String title;
  final String? description;
  final Map<String, dynamic>? meta;

  TimelineItem({
    required this.id,
    required this.type,
    required this.timestamp,
    required this.title,
    this.description,
    this.meta,
  });

  factory TimelineItem.fromJson(Map<String, dynamic> json) {
    return TimelineItem(
      id: json['id'] as String,
      type: json['type'] as String,
      timestamp: json['timestamp'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      meta: json['meta'] as Map<String, dynamic>?,
    );
  }
}
