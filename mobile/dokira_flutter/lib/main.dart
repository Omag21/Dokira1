import 'package:flutter/foundation.dart' show kIsWeb, defaultTargetPlatform, TargetPlatform;
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'screens/webview_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dokira Flutter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Dokira Flutter'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  Future<void> _openWebApp() async {
    // Vérifier la plateforme
    final isDesktopOrWeb = kIsWeb || 
                           defaultTargetPlatform == TargetPlatform.windows ||
                           defaultTargetPlatform == TargetPlatform.macOS ||
                           defaultTargetPlatform == TargetPlatform.linux;
    
    if (isDesktopOrWeb) {
      // Sur desktop/web : ouvrir dans le navigateur
      final Uri url = Uri.parse('http://localhost:5000');
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Impossible d\'ouvrir l\'URL. Assurez-vous que votre serveur Flask est lancé.'),
              duration: Duration(seconds: 3),
            ),
          );
        }
      }
    } else {
      // Sur mobile : utiliser WebView
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const WebViewScreen(
            url: 'http://10.0.2.2:5000', // Pour émulateur Android
            title: 'Dokira Web',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Icon(
              Icons.web,
              size: 80,
              color: Colors.deepPurple,
            ),
            const SizedBox(height: 20),
            const Text(
              'Bienvenue sur Dokira',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            const Text('You have pushed the button this many times:'),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: _openWebApp,
              icon: const Icon(Icons.launch),
              label: const Text('Ouvrir Dokira Web'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 30,
                  vertical: 15,
                ),
                textStyle: const TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              kIsWeb ? '(S\'ouvrira dans un nouvel onglet)' 
                    : defaultTargetPlatform == TargetPlatform.windows 
                        ? '(S\'ouvrira dans votre navigateur)'
                        : '(S\'ouvrira dans l\'app)',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}