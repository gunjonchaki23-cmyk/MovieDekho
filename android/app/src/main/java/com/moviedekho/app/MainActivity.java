package com.moviedekho.app;

import android.os.Bundle;
import android.os.Message;
import android.webkit.WebChromeClient;
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
        "adsterra",
        "popads",
        "popcash",
        "exoclick",
        "propellerads",
        "juicyads",
        "onclickads",
        "doubleclick",
        "googlesyndication",
        "bet365",
        "1xbet",
        "casino",
        "gambling",
        "adservice",
        "popunder",
        "trafficjunky",
        "adtrue",
        "hilltopads",
        "monetag",
        "adsco.re",
        "clickadu",
        "a-ads",
        "adspy",
        "adserv",
        "redirect"
    );

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            
            // Block popup and popunder windows natively
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            settings.setSupportMultipleWindows(false);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            
            // Intercept and prevent new window popups seamlessly
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                    return false; // Suppress popup creation
                }
            });

            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString().toLowerCase();
                    for (String domain : AD_DOMAINS) {
                        if (url.contains(domain)) {
                            return true; // Block redirect
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
