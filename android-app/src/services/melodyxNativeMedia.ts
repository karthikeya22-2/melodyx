import { registerPlugin } from '@capacitor/core';

export interface MelodyxMediaPluginInterface {
  updateMetadata(options: {
    title: string;
    artist: string;
    album?: string;
    artwork?: string;
    duration: number;
    position: number;
    isPlaying: boolean;
  }): Promise<void>;

  updatePlaybackState(options: {
    isPlaying: boolean;
    position: number;
    duration?: number;
  }): Promise<void>;

  stopService(): Promise<void>;

  requestNotificationPermission(): Promise<{ granted: boolean }>;

  getAppVersion(): Promise<{ versionName: string; versionCode: number; packageName: string }>;

  downloadAndInstallApk(options: { downloadUrl: string }): Promise<{ success: boolean; filePath: string }>;

  installApk(options: { filePath: string }): Promise<void>;

  addListener(
    eventName: 'mediaAction',
    listenerFunc: (data: { action: string; position?: number }) => void
  ): Promise<any>;

  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (progress: { percent: number; bytesDownloaded: number; totalBytes: number }) => void
  ): Promise<any>;
}

export const MelodyxMedia = registerPlugin<MelodyxMediaPluginInterface>('MelodyxMedia', {
  web: {
    updateMetadata: async () => {},
    updatePlaybackState: async () => {},
    stopService: async () => {},
    requestNotificationPermission: async () => ({ granted: true }),
    getAppVersion: async () => ({ versionName: '2.1.0', versionCode: 2, packageName: 'com.spotube.soundwave' }),
    downloadAndInstallApk: async () => ({ success: false, filePath: '' }),
    installApk: async () => {},
    addListener: async () => ({ remove: async () => {} })
  }
});
