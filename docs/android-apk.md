# Android app (Capacitor): status and what an APK needs (G4)

Owner: Developer A. Nothing here is signed or published.

## Works today (checked 2026-10-27 21:2x UTC)

- `npm run build` writes `www/` (19 MB): every page, script, sprite, the village, the coloring pages and `js/patrol.js`.
  `www/` is git-ignored.
- `npx cap sync` copies `www/` into `android/app/src/main/assets/public` and finishes in under 0.1 s. That folder is
  git-ignored too.
- **App id and name:** `com.ekkyarya.app`, "Ekky Arya" (`capacitor.config.json`).
- **Android levels:** min SDK 24, target SDK 36, versionCode 2, versionName "1.1"
  (`android/variables.gradle`, `android/app/build.gradle`).
- **Icon and splash** are Ekky's face from `assets/icon-512.png`, no longer the Capacitor defaults
  (`python3 scripts/android-icons.py`):
  - an adaptive icon on its mint background, plus round and legacy icons for every density;
  - a splash in the game's night color for portrait and landscape.

## Native feel (versionCode 2, "1.1", 2026-10-28)

All of this is in the Android shell; the website in a browser is unchanged. No npm package was added.

- **Back button** (`MainActivity.java`): follows the site's own history. js/game.js gives every screen and every open
  sheet, lightbox, Color view or share overlay its own history entry, so Back closes what is on top, then goes to the
  previous screen, then to the start page. On the start page with nothing open, Back leaves the app (the task moves to
  the background, like other launcher apps). A `<dialog>` the history doesn't track is closed first.
- **Status bar and edges:** Capacitor 8's built-in SystemBars (`capacitor.config.json`: `style: "DARK"`,
  `insetsHandling: "css"`) pads the page clear of the status bar, the navigation bar, cutouts and the keyboard, and
  gives both bars light icons. Behind them the window is the game's night colour `#120A1F` (`res/values/colors.xml`,
  `styles.xml`); the WebView background is the same colour, so there is no white flash.
- **Splash:** Ekky's face on its mint circle over the night colour (androidx core-splashscreen, `styles.xml`).
  `MainActivity` keeps it up until the page has loaded and the game screen is showing (`pre-game` gone), at most 3 s.
- **External links:** Instagram, Dribbble, Behance, `mailto:` and any other address outside the app open in the
  system browser or mail app: Capacitor's `Bridge.launchIntent` hands every URL that isn't the app's own origin to
  Android. The APK chip is hidden inside the app.
- **Offline:** every page, script and image is bundled in the APK (`www/` → `assets/public`); only the Google Fonts
  need the network, and without it the system font is used. The service worker still registers and its requests
  are served from the bundle.

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
   - Back: sheet, then screen, then start page, then out of the app; Back from the hire form with the keyboard up;
   - the status bar and the gesture bar have light icons on the night colour, and nothing sits under them, also in
     landscape and on a phone with a notch;
   - the splash shows Ekky's face and disappears once the start page is up (cold start, airplane mode too);
   - Instagram opens the Instagram app or the browser, the email button opens the mail app;
   - whether the update installs over an earlier download. Each GitHub run signs with that runner's fresh debug key,
     so Android will most likely refuse the update and ask to uninstall first; a fixed key (step 2) ends that.

- **Orientation:** the activity is unlocked, so landscape works.
