package com.spotube.soundwave;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.core.app.NotificationCompat;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MelodyxMediaService extends Service {
    public static final String CHANNEL_ID = "melodyx_music_playback";
    public static final int NOTIFICATION_ID = 1001;

    public static final String ACTION_PLAY = "com.spotube.soundwave.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.spotube.soundwave.ACTION_PAUSE";
    public static final String ACTION_TOGGLE = "com.spotube.soundwave.ACTION_TOGGLE";
    public static final String ACTION_NEXT = "com.spotube.soundwave.ACTION_NEXT";
    public static final String ACTION_PREV = "com.spotube.soundwave.ACTION_PREV";
    public static final String ACTION_STOP = "com.spotube.soundwave.ACTION_STOP";
    public static final String ACTION_SEEK = "com.spotube.soundwave.ACTION_SEEK";

    public interface MediaActionListener {
        void onMediaAction(String action, Object data);
    }

    private static MediaActionListener actionListener;
    private static MelodyxMediaService instance;

    private MediaSessionCompat mediaSession;
    private PowerManager.WakeLock wakeLock;
    private final ExecutorService imageExecutor = Executors.newSingleThreadExecutor();

    private String currentTitle = "Melodyx Music";
    private String currentArtist = "Playing your music";
    private String currentAlbum = "";
    private String currentArtworkUrl = "";
    private Bitmap currentArtworkBitmap = null;
    private long currentDurationSec = 0;
    private long currentPositionSec = 0;
    private boolean isPlaying = false;

    public static void setActionListener(MediaActionListener listener) {
        actionListener = listener;
    }

    public static MelodyxMediaService getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        createNotificationChannel();
        initMediaSession();

        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Melodyx:AudioPlaybackLock");
            wakeLock.setReferenceCounted(false);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Melodyx Music Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background music controls & lock screen media notification");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void initMediaSession() {
        mediaSession = new MediaSessionCompat(this, "MelodyxMediaSession");
        mediaSession.setFlags(
            MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS |
            MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
        );

        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                dispatchAction(ACTION_PLAY, null);
            }

            @Override
            public void onPause() {
                dispatchAction(ACTION_PAUSE, null);
            }

            @Override
            public void onSkipToNext() {
                dispatchAction(ACTION_NEXT, null);
            }

            @Override
            public void onSkipToPrevious() {
                dispatchAction(ACTION_PREV, null);
            }

            @Override
            public void onSeekTo(long posMs) {
                dispatchAction(ACTION_SEEK, (double) (posMs / 1000.0));
            }

            @Override
            public void onStop() {
                dispatchAction(ACTION_STOP, null);
            }
        });

        mediaSession.setActive(true);
    }

    private void dispatchAction(String action, Object data) {
        if (actionListener != null) {
            actionListener.onMediaAction(action, data);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if (ACTION_TOGGLE.equals(action)) {
                dispatchAction(ACTION_TOGGLE, null);
            } else if (ACTION_PLAY.equals(action)) {
                dispatchAction(ACTION_PLAY, null);
            } else if (ACTION_PAUSE.equals(action)) {
                dispatchAction(ACTION_PAUSE, null);
            } else if (ACTION_NEXT.equals(action)) {
                dispatchAction(ACTION_NEXT, null);
            } else if (ACTION_PREV.equals(action)) {
                dispatchAction(ACTION_PREV, null);
            } else if (ACTION_STOP.equals(action)) {
                stopForeground(true);
                stopSelf();
            }
        }
        return START_NOT_STICKY;
    }

    public void updateMetadata(String title, String artist, String album, String artworkUrl, long durationSec, long positionSec, boolean playing) {
        this.currentTitle = (title != null && !title.isEmpty()) ? title : "Melodyx";
        this.currentArtist = (artist != null && !artist.isEmpty()) ? artist : "Melodyx Stream";
        this.currentAlbum = (album != null) ? album : "";
        this.currentDurationSec = durationSec;
        this.currentPositionSec = positionSec;
        this.isPlaying = playing;

        updateWakeLock(playing);

        // Fetch artwork if URL changed
        if (artworkUrl != null && !artworkUrl.isEmpty() && !artworkUrl.equals(currentArtworkUrl)) {
            this.currentArtworkUrl = artworkUrl;
            imageExecutor.execute(() -> {
                Bitmap bmp = downloadBitmap(artworkUrl);
                if (bmp != null) {
                    currentArtworkBitmap = bmp;
                }
                updateMediaSessionState();
                showNotification();
            });
        } else {
            updateMediaSessionState();
            showNotification();
        }
    }

    public void updatePlaybackStateOnly(boolean playing, long positionSec, long durationSec) {
        this.isPlaying = playing;
        this.currentPositionSec = positionSec;
        if (durationSec > 0) this.currentDurationSec = durationSec;
        updateWakeLock(playing);
        updateMediaSessionState();
        showNotification();
    }

    private void updateWakeLock(boolean shouldHold) {
        if (wakeLock != null) {
            if (shouldHold && !wakeLock.isHeld()) {
                wakeLock.acquire(120 * 60 * 1000L); // 2 hours max safe timeout
            } else if (!shouldHold && wakeLock.isHeld()) {
                wakeLock.release();
            }
        }
    }

    private void updateMediaSessionState() {
        if (mediaSession == null) return;

        long playbackActions = PlaybackStateCompat.ACTION_PLAY |
            PlaybackStateCompat.ACTION_PAUSE |
            PlaybackStateCompat.ACTION_PLAY_PAUSE |
            PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
            PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
            PlaybackStateCompat.ACTION_SEEK_TO |
            PlaybackStateCompat.ACTION_STOP;

        int state = isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
            .setActions(playbackActions)
            .setState(state, currentPositionSec * 1000L, 1.0f);

        mediaSession.setPlaybackState(stateBuilder.build());

        MediaMetadataCompat.Builder metaBuilder = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, currentAlbum)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, currentDurationSec * 1000L);

        if (currentArtworkBitmap != null) {
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, currentArtworkBitmap);
        }

        mediaSession.setMetadata(metaBuilder.build());
    }

    private void showNotification() {
        Intent activityIntent = new Intent(this, MainActivity.class);
        activityIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            this,
            0,
            activityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        PendingIntent prevIntent = createServicePendingIntent(ACTION_PREV, 1);
        PendingIntent toggleIntent = createServicePendingIntent(ACTION_TOGGLE, 2);
        PendingIntent nextIntent = createServicePendingIntent(ACTION_NEXT, 3);
        PendingIntent stopIntent = createServicePendingIntent(ACTION_STOP, 4);

        int playPauseIcon = isPlaying ? R.drawable.ic_pause : R.drawable.ic_play_arrow;
        String playPauseTitle = isPlaying ? "Pause" : "Play";

        androidx.media.app.NotificationCompat.MediaStyle mediaStyle = new androidx.media.app.NotificationCompat.MediaStyle()
            .setMediaSession(mediaSession.getSessionToken())
            .setShowActionsInCompactView(0, 1, 2);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentTitle(currentTitle)
            .setContentText(currentArtist)
            .setSubText(currentAlbum.isEmpty() ? "Melodyx" : currentAlbum)
            .setContentIntent(contentIntent)
            .setDeleteIntent(stopIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOnlyAlertOnce(true)
            .setOngoing(isPlaying)
            .setStyle(mediaStyle)
            .addAction(R.drawable.ic_skip_previous, "Previous", prevIntent)
            .addAction(playPauseIcon, playPauseTitle, toggleIntent)
            .addAction(R.drawable.ic_skip_next, "Next", nextIntent);

        if (currentArtworkBitmap != null) {
            builder.setLargeIcon(currentArtworkBitmap);
        }

        Notification notification = builder.build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private PendingIntent createServicePendingIntent(String action, int requestCode) {
        Intent intent = new Intent(this, MelodyxMediaService.class);
        intent.setAction(action);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getService(this, requestCode, intent, flags);
    }

    private Bitmap downloadBitmap(String urlStr) {
        try {
            URL url = new URL(urlStr);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.setConnectTimeout(4000);
            connection.setReadTimeout(4000);
            connection.connect();
            InputStream input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (Exception e) {
            return null;
        }
    }

    public void stopMediaService() {
        updateWakeLock(false);
        if (mediaSession != null) {
            mediaSession.setActive(false);
        }
        stopForeground(true);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        updateWakeLock(false);
        if (mediaSession != null) {
            mediaSession.release();
        }
        imageExecutor.shutdown();
        instance = null;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
