package com.spotube.soundwave;

import android.app.Dialog;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private Dialog oauthDialog;

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
                final String cleanUa;
                if (defaultUa != null && (defaultUa.contains("; wv") || defaultUa.contains("Version/4.0"))) {
                    cleanUa = defaultUa.replace("; wv", "").replaceAll("Version\\/\\d+\\.\\d+\\s*", "");
                    settings.setUserAgentString(cleanUa);
                } else {
                    cleanUa = defaultUa;
                }

                // 2. Enable third-party cookies required by Google Identity Services and OAuth
                CookieManager cookieManager = CookieManager.getInstance();
                cookieManager.setAcceptCookie(true);
                cookieManager.setAcceptThirdPartyCookies(webView, true);

                // 3. Enable DOM storage and popup support
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);
                settings.setSupportMultipleWindows(true);

                // 4. Handle Google OAuth popup window creation and callbacks
                webView.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                        if (oauthDialog != null && oauthDialog.isShowing()) {
                            oauthDialog.dismiss();
                        }

                        oauthDialog = new Dialog(MainActivity.this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
                        WebView popupView = new WebView(MainActivity.this);
                        WebSettings popupSettings = popupView.getSettings();
                        popupSettings.setJavaScriptEnabled(true);
                        popupSettings.setUserAgentString(cleanUa);
                        popupSettings.setDomStorageEnabled(true);
                        popupSettings.setDatabaseEnabled(true);
                        popupSettings.setJavaScriptCanOpenWindowsAutomatically(true);

                        CookieManager.getInstance().setAcceptThirdPartyCookies(popupView, true);

                        popupView.setWebChromeClient(new WebChromeClient() {
                            @Override
                            public void onCloseWindow(WebView window) {
                                if (oauthDialog != null && oauthDialog.isShowing()) {
                                    oauthDialog.dismiss();
                                }
                            }
                        });

                        popupView.setWebViewClient(new WebViewClient() {
                            @Override
                            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                                Uri uri = request.getUrl();
                                if (uri != null) {
                                    String urlStr = uri.toString();
                                    if (urlStr.contains("access_token=") || urlStr.contains("id_token=") || urlStr.contains("code=") || urlStr.contains("credential=")) {
                                        dispatchTokenToMainWebView(urlStr);
                                        if (oauthDialog != null && oauthDialog.isShowing()) {
                                            oauthDialog.dismiss();
                                        }
                                        return true;
                                    }
                                }
                                return false;
                            }

                            @Override
                            public void onPageFinished(WebView view, String url) {
                                super.onPageFinished(view, url);
                                if (url != null && (url.contains("access_token=") || url.contains("id_token=") || url.contains("code=") || url.contains("credential="))) {
                                    dispatchTokenToMainWebView(url);
                                    if (oauthDialog != null && oauthDialog.isShowing()) {
                                        oauthDialog.dismiss();
                                    }
                                }
                            }
                        });

                        oauthDialog.setContentView(popupView);
                        oauthDialog.show();

                        WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                        transport.setWebView(popupView);
                        resultMsg.sendToTarget();
                        return true;
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void dispatchTokenToMainWebView(String url) {
        if (getBridge() != null && getBridge().getWebView() != null) {
            String js = "window.__handleGoogleRedirectUrl && window.__handleGoogleRedirectUrl('" + url.replace("'", "\\'") + "');";
            getBridge().getWebView().evaluateJavascript(js, null);
        }
    }

    @Override
    public void onDestroy() {
        MelodyxMediaService service = MelodyxMediaService.getInstance();
        if (service != null && !service.isPlaying()) {
            service.stopMediaService();
        }
        super.onDestroy();
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
