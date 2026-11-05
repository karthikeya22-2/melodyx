package com.spotube.soundwave;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
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
