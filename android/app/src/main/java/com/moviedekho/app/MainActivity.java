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

    private static final List<String> AD_DOMAINS = Arrays.asList(
        "publishedelegance.com",
        "adsterra.com",
        "popads.net",
        "popcash.net",
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
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString().toLowerCase();
                    
                    if (url.startsWith("https://localhost") || url.startsWith("http://localhost") || url.startsWith("file://")) {
                        return false;
                    }
                    
                    for (String domain : AD_DOMAINS) {
                        if (url.contains(domain)) {
                            return true;
                        }
                    }
                    
                    return false;
                }

                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString().toLowerCase();
                    
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
