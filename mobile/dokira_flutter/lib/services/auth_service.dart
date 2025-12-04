import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/config/api.dart';  

class AuthService {
  Future login(String email, String password) async {
    final response = await http.post(
      Uri.parse("${APIConfig.baseUrl}/auth/login"),  
      body: {"email": email, "password": password},
    );
    return jsonDecode(response.body);
  }
}