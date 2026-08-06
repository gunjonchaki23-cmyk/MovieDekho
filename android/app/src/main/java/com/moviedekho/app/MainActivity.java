package com.moviedekho.app;

import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;
import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends BridgeActivity {

    // Known ad, popunder, and tracker domains to block at the native socket layer
    private static final List<String> AD_DOMAINS = Arrays.asList(
        "publishedelegance.com",
        "adsterra.com",
        "popads.net",
        "popcash.net",
        "bet365",
        "1xbet",
        "exoclick.com",
        "propellerads.com",
        "juicyads.com",
        "onclickads.net",
        "doubleclick.net",
        "googlesyndication.com"
    );

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            // Block pop-up and popunder windows natively
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    for (String domain : AD_DOMAINS) {
                        if (url.contains(domain)) {
                            return true; // Cancel loading the ad URL
                        }
                    }
                    
                    if (url.startsWith("http://localhost") || url.startsWith("https://localhost") || url.contains("moviedekho")) {
                        return false;
                    }
                    
                    return true;
                }

                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    
                    for (String domain : AD_DOMAINS) {
                        if (url.contains(domain)) {
                            return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream("".getBytes()));
                        }
                    }
                    return super.shouldInterceptRequest(view, request);
                }
            });
        }
    }
}
