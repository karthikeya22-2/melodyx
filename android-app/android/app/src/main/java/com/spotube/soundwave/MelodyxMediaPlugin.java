package com.spotube.soundwave;

import android.Manifest;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
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
    public void openUrlInBrowser(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("url is required");
            return;
        }

        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(browserIntent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to open browser: " + e.getMessage());
        }
    }

    @PluginMethod
    public void downloadViaDownloadManager(PluginCall call) {
        String downloadUrl = call.getString("downloadUrl");
        if (downloadUrl == null || downloadUrl.isEmpty()) {
            call.reject("downloadUrl is required");
            return;
        }

        try {
            Context context = getContext();
            DownloadManager dm = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(downloadUrl));
            request.setTitle("Melodyx Update");
            request.setDescription("Downloading latest Melodyx APK...");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "Melodyx.apk");
            request.setMimeType("application/vnd.android.package-archive");
            long id = dm.enqueue(request);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("downloadId", id);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("DownloadManager failed: " + e.getMessage());
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

                URL currentUrl = new URL(downloadUrl);
                HttpURLConnection connection = null;
                int redirectCount = 0;

                while (redirectCount < 5) {
                    connection = (HttpURLConnection) currentUrl.openConnection();
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(30000);
                    connection.setInstanceFollowRedirects(true);
                    connection.setRequestProperty("User-Agent", "Melodyx-Android-Updater");
                    connection.connect();

                    int responseCode = connection.getResponseCode();
                    if (responseCode == HttpURLConnection.HTTP_MOVED_PERM ||
                        responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                        responseCode == 307 || responseCode == 308) {
                        String newLocation = connection.getHeaderField("Location");
                        if (newLocation != null && !newLocation.isEmpty()) {
                            currentUrl = new URL(currentUrl, newLocation);
                            redirectCount++;
                            continue;
                        }
                    }

                    if (responseCode != HttpURLConnection.HTTP_OK) {
                        call.reject("Server returned HTTP " + responseCode);
                        return;
                    }
                    break;
                }

                if (connection == null) {
                    call.reject("Failed to connect to server");
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
                    if (fileLength > 0 && (now - lastReportTime > 200 || total == fileLength)) {
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
                    int status = launchApkInstaller(context, destinationFile);
                    JSObject res = new JSObject();
                    res.put("filePath", destinationFile.getAbsolutePath());
                    if (status == 1) {
                        res.put("success", true);
                        call.resolve(res);
                    } else if (status == 2) {
                        res.put("success", false);
                        res.put("needsPermission", true);
                        call.resolve(res);
                    } else {
                        call.reject("Failed to launch package installer");
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

        int status = launchApkInstaller(getContext(), file);
        if (status == 1) {
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } else if (status == 2) {
            JSObject res = new JSObject();
            res.put("success", false);
            res.put("needsPermission", true);
            call.resolve(res);
        } else {
            call.reject("Failed to launch package installer");
        }
    }

    // 1 = Launched installer, 2 = Prompted user for unknown sources permission, 0 = Failed
    private int launchApkInstaller(Context context, File apkFile) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.getPackageManager().canRequestPackageInstalls()) {
                    Intent permIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                    permIntent.setData(Uri.parse("package:" + context.getPackageName()));
                    permIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(permIntent);
                    return 2;
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
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }
}
