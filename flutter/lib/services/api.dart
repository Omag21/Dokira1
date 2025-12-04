import 'dart:convert';
import 'package:http/http.dart' as http;

class Api {
  static const String baseUrl = "http://10.0.2.2:8000"; // Android emulator
  // Pour un smartphone réel ou production :
  // static const String baseUrl = "http://192.168.1.10:8000";

  static Future<dynamic> getData(String endpoint) async {
    final response = await http.get(Uri.parse("$baseUrl/$endpoint"));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Failed to load data: ${response.statusCode}");
    }
  }

  static Future<dynamic> postData(String endpoint, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse("$baseUrl/$endpoint"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Failed to post data: ${response.statusCode}");
    }
  }
}
