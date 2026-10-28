# Android app (Capacitor): status and what an APK needs (G4)

Owner: Developer A. Nothing here is signed or published.

## Works today (checked 2026-10-27 21:2x UTC)

- `npm run build` writes `www/` (19 MB): every page, script, sprite, the village, the coloring pages and `js/patrol.js`.
  `www/` is git-ignored.
- `npx cap sync` copies `www/` into `android/app/src/main/assets/public` and finishes in under 0.1 s. That folder is
  git-ignored too.
- **App id and name:** `com.ekkyarya.app`, "Ekky Arya" (`capacitor.config.json`).
- **Android levels:** min SDK 24, target SDK 36, versionCode 1, versionName "1.0"
  (`android/variables.gradle`, `android/app/build.gradle`).
- **Icon and splash** are Ekky's face from `assets/icon-512.png`, no longer the Capacitor defaults
  (`python3 scripts/android-icons.py`):
  - an adaptive icon on its mint background, plus round and legacy icons for every density;
  - a splash in the game's night color for portrait and landscape.

## What an APK still needs

1. **A build machine with the Android SDK.** This container has Java 21 but no Android SDK. Install Android Studio
   (or the command-line tools with `platforms;android-36` and `build-tools`), then run
   `npm run cap:sync && cd android && ./gradlew assembleDebug`. The debug APK lands in
   `android/app/build/outputs/apk/debug/`.
2. **A release key, for Play or for sharing a release APK.** Create a keystore once
   (`keytool -genkey -v -keystore ekkyarya.jks -alias ekkyarya -keyalg RSA -keysize 2048 -validity 10000`).
   - Keep it out of git.
   - Put the passwords in `~/.gradle/gradle.properties`, never in the repo.
   - Add a `signingConfigs.release` block to `android/app/build.gradle`, then build with `./gradlew bundleRelease`
     (an AAB for Play) or `assembleRelease`.
   - Losing the key means the app can never be updated: back it up.
3. **Version numbers:** raise `versionCode` (an integer) and `versionName` for every upload.
4. **Play Store listing**, if Play is the goal:
   - a developer account (one-time fee);
   - a privacy policy URL (the site collects nothing; one page saying so is enough);
   - the content rating questionnaire and the data-safety form (no data collected);
   - a 512 x 512 icon (`assets/icon-512.png`), a 1024 x 500 feature graphic, and at least 2 phone screenshots
     (`node scripts/capture.cjs` makes them);
   - a short and a full description (UX copy).
5. **Decisions for the owner** (in `docs/owner-asks.md`):
   - Is the app id `com.ekkyarya.app` final? It can't change after the first Play upload.
   - Who holds the release key?
   - Play Store, or a direct APK download from the site?
6. **Checks on a real device before release:**
   - the Install button stays hidden (inside the app there is nothing to install);
   - Share and Download go through the system share sheet (WebView downloads differ from Chrome; the save dialog
     covers it);
   - landscape works for Paint Patrol;
   - the back button closes sheets before it leaves the app.

The last two checks may need small native settings:
- **Orientation:** the activity is unlocked today, so landscape works.
- **Back button:** a `@capacitor/app` listener. That is a new npm package, so it needs the owner's yes.
