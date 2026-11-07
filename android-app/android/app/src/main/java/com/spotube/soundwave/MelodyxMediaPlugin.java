package com.spotube.soundwave;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;

import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(
    name = "MelodyxMedia",
    permissions = {
        @Permission(
            alias = "notifications",
            strings = { "android.permission.POST_NOTIFICATIONS" }
        )
    }
)
public class MelodyxMediaPlugin extends Plugin {

    @Override
    public void load() {
        super.load();

        MelodyxMediaService.setActionListener((action, data) -> {
            JSObject ret = new JSObject();
            ret.put("action", action);
            if (data != null) {
                if (data instanceof Double) {
                    ret.put("position", (Double) data);
                } else {
                    ret.put("data", data.toString());
                }
            }
            notifyListeners("mediaAction", ret);

            // Also call direct window handler in case listeners were initialized before bridge
            new Handler(Looper.getMainLooper()).post(() -> {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    String js;
                    if (MelodyxMediaService.ACTION_TOGGLE.equals(action)) {
                        js = "window.__melodyx_nativeToggle && window.__melodyx_nativeToggle();";
                    } else if (MelodyxMediaService.ACTION_PLAY.equals(action)) {
                        js = "window.__melodyx_nativePlay && window.__melodyx_nativePlay();";
                    } else if (MelodyxMediaService.ACTION_PAUSE.equals(action)) {
                        js = "window.__melodyx_nativePause && window.__melodyx_nativePause();";
                    } else if (MelodyxMediaService.ACTION_NEXT.equals(action)) {
                        js = "window.__melodyx_nativeNext && window.__melodyx_nativeNext();";
                    } else if (MelodyxMediaService.ACTION_PREV.equals(action)) {
                        js = "window.__melodyx_nativePrev && window.__melodyx_nativePrev();";
                    } else if (MelodyxMediaService.ACTION_SEEK.equals(action) && data instanceof Double) {
                        js = "window.__melodyx_nativeSeek && window.__melodyx_nativeSeek(" + data + ");";
                    } else {
                        js = null;
                    }
                    if (js != null) {
                        getBridge().getWebView().evaluateJavascript(js, null);
                    }
                }
            });
        });
    }

    @PluginMethod
    public void updateMetadata(PluginCall call) {
        String title = call.getString("title", "Melodyx");
        String artist = call.getString("artist", "Playing your music");
        String album = call.getString("album", "");
        String artwork = call.getString("artwork", "");
        long duration = call.getInt("duration", 0);
        long position = call.getInt("position", 0);
        boolean isPlaying = Boolean.TRUE.equals(call.getBoolean("isPlaying", false));

        Context context = getContext();
        Intent serviceIntent = new Intent(context, MelodyxMediaService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }

        MelodyxMediaService service = MelodyxMediaService.getInstance();
        if (service != null) {
            service.updateMetadata(title, artist, album, artwork, duration, position, isPlaying);
        }

        call.resolve();
    }

    @PluginMethod
    public void updatePlaybackState(PluginCall call) {
        boolean isPlaying = Boolean.TRUE.equals(call.getBoolean("isPlaying", false));
        long position = call.getInt("position", 0);
        long duration = call.getInt("duration", 0);

        MelodyxMediaService service = MelodyxMediaService.getInstance();
        if (service != null) {
            service.updatePlaybackStateOnly(isPlaying, position, duration);
        }

        call.resolve();
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        MelodyxMediaService service = MelodyxMediaService.getInstance();
        if (service != null) {
            service.stopMediaService();
        }
        call.resolve();
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33) {
            if (getPermissionState("notifications") != PermissionState.GRANTED) {
                requestPermissionForAlias("notifications", call, "notificationPermCallback");
                return;
            }
        }
        JSObject ret = new JSObject();
        ret.put("granted", true);
        call.resolve(ret);
    }

    @PermissionCallback
    private void notificationPermCallback(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", getPermissionState("notifications") == PermissionState.GRANTED);
        call.resolve(ret);
    }

    @PluginMethod
    public void getAppVersion(PluginCall call) {
        try {
            Context ctx = getContext();
            PackageInfo pInfo = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
            long versionCode;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = pInfo.versionCode;
            }

            JSObject ret = new JSObject();
            ret.put("versionName", pInfo.versionName);
            ret.put("versionCode", versionCode);
            ret.put("packageName", ctx.getPackageName());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to get version: " + e.getMessage());
        }
    }

    @PluginMethod
    public void downloadAndInstallApk(PluginCall call) {
        String downloadUrl = call.getString("downloadUrl");
        if (downloadUrl == null || downloadUrl.isEmpty()) {
            call.reject("downloadUrl is required");
            return;
        }

        new Thread(() -> {
            try {
                Context context = getContext();
                File cacheDir = context.getExternalCacheDir() != null ? context.getExternalCacheDir() : context.getCacheDir();
                File destinationFile = new File(cacheDir, "Melodyx-update.apk");

                if (destinationFile.exists()) {
                    destinationFile.delete();
                }

                URL url = new URL(downloadUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(30000);
                connection.setRequestProperty("User-Agent", "Melodyx-Android-Updater");
                connection.connect();

                int responseCode = connection.getResponseCode();
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    call.reject("Server returned HTTP " + responseCode);
                    return;
                }

                int fileLength = connection.getContentLength();
                InputStream input = connection.getInputStream();
                FileOutputStream output = new FileOutputStream(destinationFile);

                byte[] data = new byte[8192];
                long total = 0;
                int count;
                long lastReportTime = 0;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    long now = System.currentTimeMillis();
                    if (fileLength > 0 && (now - lastReportTime > 250 || total == fileLength)) {
                        lastReportTime = now;
                        int percent = (int) ((total * 100) / fileLength);
                        JSObject progressObj = new JSObject();
                        progressObj.put("percent", percent);
                        progressObj.put("bytesDownloaded", total);
                        progressObj.put("totalBytes", fileLength);
                        notifyListeners("downloadProgress", progressObj);
                    }
                }

                output.flush();
                output.close();
                input.close();

                // Launch package installer on main thread
                new Handler(Looper.getMainLooper()).post(() -> {
                    boolean launched = launchApkInstaller(context, destinationFile);
                    if (launched) {
                        JSObject res = new JSObject();
                        res.put("success", true);
                        res.put("filePath", destinationFile.getAbsolutePath());
                        call.resolve(res);
                    } else {
                        call.reject("Permission or package installer launch failed");
                    }
                });

            } catch (Exception e) {
                call.reject("Download failed: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        String filePath = call.getString("filePath");
        if (filePath == null) {
            call.reject("filePath is required");
            return;
        }

        File file = new File(filePath);
        if (!file.exists()) {
            call.reject("File does not exist: " + filePath);
            return;
        }

        boolean launched = launchApkInstaller(getContext(), file);
        if (launched) {
            call.resolve();
        } else {
            call.reject("Failed to launch package installer");
        }
    }

    private boolean launchApkInstaller(Context context, File apkFile) {
        try {
            // Android 8.0+ Check for unknown app install permission
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.getPackageManager().canRequestPackageInstalls()) {
                    Intent permIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                    permIntent.setData(Uri.parse("package:" + context.getPackageName()));
                    permIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(permIntent);
                    return true;
                }
            }

            Uri apkUri = FileProvider.getUriForFile(
                context,
                context.getPackageName() + ".fileprovider",
                apkFile
            );

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            installIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

            context.startActivity(installIntent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
