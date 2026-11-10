package com.spotube.soundwave;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MelodyxMediaPlugin.class);
        super.onCreate(savedInstanceState);
        setupGoogleCompatibleWebView();
    }

    @Override
    public void onResume() {
        super.onResume();
        setupGoogleCompatibleWebView();
    }

    private void setupGoogleCompatibleWebView() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                WebSettings settings = webView.getSettings();

                // 1. Remove 'Version/4.0' and '; wv' so Google OAuth does not block with 'disallowed_useragent'
                String defaultUa = settings.getUserAgentString();
                if (defaultUa != null && (defaultUa.contains("; wv") || defaultUa.contains("Version/4.0"))) {
                    String cleanUa = defaultUa.replace("; wv", "").replaceAll("Version\\/\\d+\\.\\d+\\s*", "");
                    settings.setUserAgentString(cleanUa);
                }

                // 2. Enable third-party cookies required by Google Identity Services and OAuth
                CookieManager cookieManager = CookieManager.getInstance();
                cookieManager.setAcceptCookie(true);
                cookieManager.setAcceptThirdPartyCookies(webView, true);

                // 3. Enable DOM storage and popup support
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);
                settings.setSupportMultipleWindows(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onBackPressed() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript(
                "(function() { return (window.__handleHardwareBack && window.__handleHardwareBack()) ? 'handled' : 'not_handled'; })()",
                result -> {
                    if (result != null && result.contains("handled")) {
                        // Handled in webview (closed full-screen player, menu, or returned to Home screen)
                        return;
                    }
                    // Already at home with nothing open: move to background cleanly
                    moveTaskToBack(true);
                }
            );
            return;
        }
        super.onBackPressed();
    }
}
