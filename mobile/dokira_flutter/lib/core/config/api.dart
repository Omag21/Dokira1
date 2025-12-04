class APIConfig {
  // URL de base de votre API
  static const String baseUrl = "http://localhost:8000";
  
  // Endpoints
  static const String loginEndpoint = "/auth/login";
  static const String registerEndpoint = "/auth/register";
  
  // Timeout
  static const Duration timeout = Duration(seconds: 30);
}