class JobModel {
  final String id;
  final String workspaceId;
  final String customerId;
  final String title;
  final String? description;
  final String? category;
  final String status;
  final String priority;
  final double? quotedAmount;
  final double? laborHours;
  final String? customerName;
  final String? customerCompany;
  final String? scheduledAt;
  final String? completedAt;

  JobModel({
    required this.id,
    required this.workspaceId,
    required this.customerId,
    required this.title,
    this.description,
    this.category,
    required this.status,
    required this.priority,
    this.quotedAmount,
    this.laborHours,
    this.customerName,
    this.customerCompany,
    this.scheduledAt,
    this.completedAt,
  });

  factory JobModel.fromJson(Map<String, dynamic> json) {
    final customer = json['customer'] as Map<String, dynamic>?;
    return JobModel(
      id: json['id'] as String,
      workspaceId: json['workspaceId'] as String? ?? '',
      customerId: json['customerId'] as String? ?? '',
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      status: json['status'] as String? ?? 'SCHEDULED',
      priority: json['priority'] as String? ?? 'MEDIUM',
      quotedAmount: (json['quotedAmount'] as num?)?.toDouble(),
      laborHours: (json['laborHours'] as num?)?.toDouble(),
      customerName: customer?['name'] as String?,
      customerCompany: customer?['companyName'] as String?,
      scheduledAt: json['scheduledAt'] as String?,
      completedAt: json['completedAt'] as String?,
    );
  }
}

class TaskModel {
  final String id;
  final String workspaceId;
  final String title;
  final String? description;
  final String status;
  final String priority;
  final String? dueDate;
  final String? customerName;
  final String? jobTitle;

  TaskModel({
    required this.id,
    required this.workspaceId,
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    this.dueDate,
    this.customerName,
    this.jobTitle,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    final customer = json['customer'] as Map<String, dynamic>?;
    final job = json['job'] as Map<String, dynamic>?;
    return TaskModel(
      id: json['id'] as String,
      workspaceId: json['workspaceId'] as String? ?? '',
      title: json['title'] as String,
      description: json['description'] as String?,
      status: json['status'] as String? ?? 'TODO',
      priority: json['priority'] as String? ?? 'MEDIUM',
      dueDate: json['dueDate'] as String?,
      customerName: customer?['name'] as String?,
      jobTitle: job?['title'] as String?,
    );
  }
}
