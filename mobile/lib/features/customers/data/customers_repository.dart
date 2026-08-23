import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_response.dart';
import '../domain/models/customer_model.dart';

class CustomersRepository {
  final ApiClient _apiClient;

  CustomersRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<ApiResponse<List<CustomerModel>>> listCustomers({
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    return await _apiClient.get(
      ApiEndpoints.customers,
      queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
        'limit': limit,
      },
      fromJson: (json) {
        final customersList = json['customers'] as List<dynamic>? ?? [];
        return customersList.map((c) => CustomerModel.fromJson(c as Map<String, dynamic>)).toList();
      },
    );
  }

  Future<ApiResponse<CustomerModel>> getCustomer(String id) async {
    return await _apiClient.get(
      '${ApiEndpoints.customers}/$id',
      fromJson: (json) => CustomerModel.fromJson(json as Map<String, dynamic>),
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> getCustomerTimeline(String id) async {
    return await _apiClient.get('${ApiEndpoints.customers}/$id/timeline');
  }

  Future<ApiResponse<CustomerModel>> createCustomer({
    required String name,
    String? companyName,
    String? email,
    String? phone,
    String? address,
    String? notes,
  }) async {
    return await _apiClient.post(
      ApiEndpoints.customers,
      data: {
        'name': name,
        if (companyName != null) 'companyName': companyName,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (address != null) 'address': address,
        if (notes != null) 'notes': notes,
      },
      fromJson: (json) => CustomerModel.fromJson(json as Map<String, dynamic>),
    );
  }
}
