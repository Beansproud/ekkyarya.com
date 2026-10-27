// Feature switches (B38), loaded right after js/data.js. One on/off switch per optional feature, so scope can be
// limited later without code changes. A switch that is off hides the feature completely: its buttons, tiles, tabs and
// deep links disappear (no greyed-out button, no lock). Core paths (the art, coloring a page, Hire Ekky) have no switch.
// In HTML, mark an entry point with data-feature="<name>"; js/site.js removes it when the switch is off.
const FEATURES = {
  starCatcher: true,     // Star Catcher arcade: start tile, map header button, result screen
  stickers: true,        // sticker tray in the coloring screen (Ekky's own doodles)
  doodleScene: true,     // "Start from scratch": a plain page for stickers and colors
  anyColor: true,        // "Any color" swatch (system color picker) next to Ekky's colors
  shareCards: true,      // share image (1080 x 1920) and the share sheet
  challengeLinks: true,  // Star Catcher challenge links (later ticket B22)
  holoCards: true,       // holo foil on tilt (later ticket B36)
  pwa: true,             // install and offline (later ticket B37)
  sound: true,           // sound effects and the sound toggle
};
const feature = name => FEATURES[name] === true;
