class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String? phone;
  final String? avatar;
  final String role;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    this.avatar,
    required this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
      role: json['role'] as String? ?? 'USER',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'phone': phone,
      'avatar': avatar,
      'role': role,
    };
  }
}

class WorkspaceModel {
  final String id;
  final String name;
  final String slug;
  final String? industry;
  final String role;

  WorkspaceModel({
    required this.id,
    required this.name,
    required this.slug,
    this.industry,
    required this.role,
  });

  factory WorkspaceModel.fromJson(Map<String, dynamic> json) {
    return WorkspaceModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      industry: json['industry'] as String?,
      role: json['role'] as String? ?? 'FIELD_TECH',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'industry': industry,
      'role': role,
    };
  }
}
