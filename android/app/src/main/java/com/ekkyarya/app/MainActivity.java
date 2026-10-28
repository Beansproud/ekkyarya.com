package com.ekkyarya.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

// The app shell around the website. The site itself is unchanged; this only makes it behave like an app:
// - the splash (Ekky's face) stays up until the start page has rendered, at most SPLASH_MAX_MS;
// - the hardware back button follows the site's own history (js/game.js gives every screen and every open
//   sheet, lightbox or overlay its own history entry), and leaves the app on the start page.
// Status bar colour and safe areas come from capacitor.config.json (SystemBars) and res/values/styles.xml.
// External links (Instagram, mailto:, the APK) already open outside the WebView: Capacitor's Bridge.launchIntent
// hands every URL that is not the app's own origin to the system.
public class MainActivity extends BridgeActivity {

    private static final long SPLASH_MAX_MS = 3000;
    private static final long SPLASH_POLL_MS = 120;

    // "exit" on the start page with nothing open, "closed" when it closed a dialog the history doesn't track,
    // "back" otherwise. Kept in sync with js/game.js: #game.at-start is the start screen, history.state.l an open layer.
    private static final String BACK_JS =
        "(function(){try{var b=document.body,g=document.getElementById('game'),s=history.state||{};" +
        "if(s.l)return 'back';" +
        "var d=document.querySelector('dialog[open]');if(d){d.close();return 'closed'}" +
        "if(b.classList.contains('game-mode')&&g&&g.classList.contains('at-start'))return 'exit';" +
        "return 'back'}catch(e){return 'back'}})()";

    // The start screen has rendered once the page has loaded and the game (or the classic page) is showing.
    private static final String READY_JS =
        "(function(){try{return document.readyState==='complete'&&!document.documentElement.classList.contains('pre-game')}" +
        "catch(e){return true}})()";

    private volatile boolean splashDone = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        splash.setKeepOnScreenCondition(() -> !splashDone);
        super.onCreate(savedInstanceState);
        pollReady(SystemClock.uptimeMillis() + SPLASH_MAX_MS);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView web = getBridge() != null ? getBridge().getWebView() : null;
                if (web == null) {
                    exit();
                    return;
                }
                web.evaluateJavascript(BACK_JS, res -> {
                    if ("\"closed\"".equals(res)) return;
                    if (!"\"exit\"".equals(res) && web.canGoBack()) web.goBack();
                    else exit();
                });
            }
        });
    }

    private void exit() {
        // Like any launcher app on Android 12+: send the task to the background instead of killing it
        if (!moveTaskToBack(true)) finish();
    }

    private void pollReady(long deadline) {
        Handler h = new Handler(Looper.getMainLooper());
        h.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (splashDone) return;
                WebView web = getBridge() != null ? getBridge().getWebView() : null;
                if (SystemClock.uptimeMillis() >= deadline) {
                    splashDone = true;
                    return;
                }
                if (web == null) {
                    h.postDelayed(this, SPLASH_POLL_MS);
                    return;
                }
                web.evaluateJavascript(READY_JS, res -> {
                    if ("true".equals(res)) splashDone = true;
                    else h.postDelayed(this, SPLASH_POLL_MS);
                });
            }
        }, SPLASH_POLL_MS);
    }
}
