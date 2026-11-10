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
                        final WebView popupView = new WebView(MainActivity.this);
                        WebSettings popupSettings = popupView.getSettings();
                        popupSettings.setJavaScriptEnabled(true);
                        popupSettings.setUserAgentString(cleanUa);
                        popupSettings.setDomStorageEnabled(true);
                        popupSettings.setDatabaseEnabled(true);
                        popupSettings.setJavaScriptCanOpenWindowsAutomatically(true);
                        popupSettings.setSupportMultipleWindows(true);

                        CookieManager.getInstance().setAcceptThirdPartyCookies(popupView, true);

                        // Inject Javascript Interface into popup to capture any postMessage or token
                        popupView.addJavascriptInterface(new Object() {
                            @android.webkit.JavascriptInterface
                            public void onTokenReceived(String tokenData) {
                                if (tokenData != null && !tokenData.isEmpty()) {
                                    dispatchTokenToMainWebView(tokenData);
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            if (oauthDialog != null && oauthDialog.isShowing()) {
                                                oauthDialog.dismiss();
                                            }
                                        }
                                    });
                                }
                            }
                        }, "MelodyxOAuthBridge");

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
                                if (request != null && request.getUrl() != null) {
                                    String urlStr = request.getUrl().toString();
                                    if (checkAndDispatchAuthUrl(urlStr)) return true;
                                }
                                return false;
                            }

                            @Override
                            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                                if (checkAndDispatchAuthUrl(url)) return true;
                                return false;
                            }

                            @Override
                            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                                super.onPageStarted(view, url, favicon);
                                checkAndDispatchAuthUrl(url);
                            }

                            @Override
                            public void onPageFinished(WebView view, String url) {
                                super.onPageFinished(view, url);
                                checkAndDispatchAuthUrl(url);
                                injectPostMessageBridge(view);
                            }

                            @Override
                            public void doUpdateVisitedHistory(WebView view, String url, boolean isReload) {
                                super.doUpdateVisitedHistory(view, url, isReload);
                                checkAndDispatchAuthUrl(url);
                            }

                            @Override
                            public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                                super.onReceivedError(view, request, error);
                                if (request != null && request.getUrl() != null) {
                                    checkAndDispatchAuthUrl(request.getUrl().toString());
                                }
                            }

                            @Override
                            public void onLoadResource(WebView view, String url) {
                                super.onLoadResource(view, url);
                                if (url != null && (url.contains("access_token=") || url.contains("id_token=") || url.contains("credential="))) {
                                    checkAndDispatchAuthUrl(url);
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

    private boolean checkAndDispatchAuthUrl(String url) {
        if (url == null) return false;
        if (url.contains("access_token=") || url.contains("id_token=") || url.contains("credential=") || url.contains("code=")) {
            dispatchTokenToMainWebView(url);
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (oauthDialog != null && oauthDialog.isShowing()) {
                        oauthDialog.dismiss();
                    }
                }
            });
            return true;
        }
        if (url.startsWith("https://localhost") || url.startsWith("http://localhost")) {
            dispatchTokenToMainWebView(url);
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (oauthDialog != null && oauthDialog.isShowing()) {
                        oauthDialog.dismiss();
                    }
                }
            });
            return true;
        }
        return false;
    }

    private void injectPostMessageBridge(WebView view) {
        try {
            String js = "(function() {" +
                "  function notify(d) {" +
                "    try {" +
                "      var str = (typeof d === 'string') ? d : JSON.stringify(d);" +
                "      if (window.MelodyxOAuthBridge) { window.MelodyxOAuthBridge.onTokenReceived(str); }" +
                "    } catch(e){}" +
                "  }" +
                "  window.addEventListener('message', function(e) { if (e && e.data) { notify(e.data); } });" +
                "  if (window.opener) {" +
                "    try {" +
                "      var origPost = window.opener.postMessage;" +
                "      window.opener.postMessage = function(msg) {" +
                "        notify(msg);" +
                "        try { return origPost.apply(window.opener, arguments); } catch(err){}" +
                "      };" +
                "    } catch(err){}" +
                "  }" +
                "})();";
            view.evaluateJavascript(js, null);
        } catch (Exception e) {}
    }

    private void dispatchTokenToMainWebView(final String url) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    String safeUrl = url.replace("\\", "\\\\").replace("'", "\\'");
                    String js = "window.__handleGoogleRedirectUrl && window.__handleGoogleRedirectUrl('" + safeUrl + "');";
                    getBridge().getWebView().evaluateJavascript(js, null);
                }
            }
        });
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
