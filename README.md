# ekkyarya.com

Portfolio site of Ekky Arya, illustrator and graphic designer. One static page with no build step: open `index.html` in a browser, or serve the folder with any static host (GitHub Pages, Netlify, Vercel).

## Editing

- **Contact details and social links:** the `CONFIG` object at the top of the script in `index.html`.
- **Portfolio projects:** the `PROJECTS` list just below it. Set `img` to a file in `assets/work/`.
- **Artwork:** see `assets/README.md`. `hero.png` and `logo.png` are currently cropped from a screenshot of the old site; replace them with the original files when available.

## Mobile app (Capacitor)

The same page ships as an Android app. Inside the app it always opens in game mode.

```bash
npm install
npm run android      # builds www/, syncs it into android/ and opens Android Studio
```

In Android Studio, press Run to install the app on a phone or emulator, or use Build → Generate Signed App Bundle to create a release for the Play Store. The app ID is `com.ekkyarya.app` (`capacitor.config.ts`).

For iOS, run `npm install @capacitor/ios && npx cap add ios && npx cap open ios` on a Mac with Xcode.
