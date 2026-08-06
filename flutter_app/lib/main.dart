import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  runApp(const MovieDekhoApp());
}

class MovieDekhoApp extends StatelessWidget {
  const MovieDekhoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MovieDekho',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF141414),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE50914),
          secondary: Color(0xFFE50914),
        ),
      ),
      home: const MovieHomeScreen(),
    );
  }
}

class MovieHomeScreen extends StatefulWidget {
  const MovieHomeScreen({super.key});

  @override
  State<MovieHomeScreen> createState() => _MovieHomeScreenState();
}

class _MovieHomeScreenState extends State<MovieHomeScreen> {
  InAppWebViewController? webViewController;
  double progress = 0;
  bool isLoading = true;

  // Known ad, tracker, and popup domains to block
  final List<String> adDomains = [
    'publishedelegance.com',
    'adsterra.com',
    'popads.net',
    'popcash.net',
    'exoclick.com',
    'propellerads.com',
    'juicyads.com',
    'onclickads.net',
    'doubleclick.net',
    'googlesyndication.com',
    'bet365',
    '1xbet',
  ];

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (didPop) return;
        if (webViewController != null && await webViewController!.canGoBack()) {
          webViewController!.goBack();
        } else {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              InAppWebView(
                initialUrlRequest: URLRequest(
                  url: WebUri('https://moviedekho.netlify.app'),
                ),
                initialSettings: InAppWebViewSettings(
                  useShouldOverrideUrlLoading: true,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  javaScriptCanOpenWindowsAutomatically: false,
                  supportMultipleWindows: false,
                  useWideViewPort: true,
                  loadWithOverviewMode: true,
                  transparentBackground: true,
                  domStorageEnabled: true,
                  databaseEnabled: true,
                ),
                onWebViewCreated: (controller) {
                  webViewController = controller;
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    isLoading = true;
                  });
                },
                onLoadStop: (controller, url) {
                  setState(() {
                    isLoading = false;
                  });
                },
                onProgressChanged: (controller, progress) {
                  setState(() {
                    this.progress = progress / 100;
                  });
                },
                shouldOverrideUrlLoading: (controller, navigationAction) async {
                  var uri = navigationAction.request.url;
                  if (uri == null) return NavigationActionPolicy.ALLOW;

                  String urlString = uri.toString().toLowerCase();

                  // Block ad domains & popups
                  for (String domain in adDomains) {
                    if (urlString.contains(domain)) {
                      return NavigationActionPolicy.CANCEL;
                    }
                  }

                  // Allow MovieDekho web app navigation & streaming APIs
                  if (urlString.contains('moviedekho') ||
                      urlString.contains('vidlink.pro') ||
                      urlString.contains('autoembed') ||
                      urlString.contains('vidsrc') ||
                      urlString.contains('tmdb') ||
                      urlString.contains('youtube.com')) {
                    return NavigationActionPolicy.ALLOW;
                  }

                  // Block external window popups/redirects
                  if (navigationAction.targetFrame == null || !navigationAction.targetFrame!.isMainFrame) {
                    return NavigationActionPolicy.CANCEL;
                  }

                  return NavigationActionPolicy.ALLOW;
                },
              ),
              if (progress < 1.0)
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.transparent,
                  color: const Color(0xFFE50914),
                  minHeight: 3,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
