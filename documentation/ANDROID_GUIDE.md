# Android Mobile Application Guide & APK Build

Location: `/music-platform/android-app`

---

## 1. Overview
The Android mobile application is designed specifically for smartphones with a mobile-first Spotify user experience:
* **Fixed Bottom Navigation Bar:** Home, Search, Your Library.
* **Floating Mini-Player:** Appears immediately above the bottom navigation bar whenever music is playing.
* **Full-Screen Now Playing Sheet:** Dedicated slide-up modal with large artwork, scrubber timeline, play/pause/skip, like button, synchronized lyrics drawer, and queue.
* **Home Feed:** 2-column pill cards for recently played, and horizontal carousels for Telugu Hits, Hindi Hits, English Hits, Trending Albums, and Artists.
* **Android MediaSession Integration:** Directly integrates with Android's system audio services, enabling:
  * Lock-screen music player with artwork and scrubber.
  * Notification drawer playback controls.
  * Bluetooth headset and car dashboard controls.

---

## 2. Running in Development (Mobile Browser / Emulator)

```bash
cd music-platform/android-app
npm run dev
```
Open `http://localhost:3001` in your browser (press `F12` and switch to Mobile Device View, e.g., Pixel 7 / Galaxy S24).

---

## 3. Building the Android APK

The project is pre-configured with **Capacitor Android** and contains a native Gradle project in `android/`:

### Option A: Using Android Studio (Recommended)
1. Open Android Studio.
2. Select **Open an Existing Project** and navigate to:
   ```
   C:\Users\DELL\.gemini\antigravity\scratch\music-platform\android-app\android
   ```
3. Let Gradle sync.
4. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. The debug APK will be generated at:
   ```
   android-app/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Option B: Building via Command Line (with Android SDK installed)
```bash
cd music-platform/android-app
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```
The resulting `.apk` can be transferred and installed on any Android phone directly!

