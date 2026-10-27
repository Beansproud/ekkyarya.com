"""Android launcher icons and splash screens from Ekky's own app icon (assets/icon-512.png, his face on mint).

Usage: python3 scripts/android-icons.py      writes android/app/src/main/res/{mipmap-*,drawable*}/... in place of
Capacitor's default icon and splash. Pillow only. Run again whenever assets/icon-512.png changes.
"""
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")
ICON = Image.open(os.path.join(ROOT, "assets", "icon-512.png")).convert("RGBA")
MINT = ICON.getpixel((8, 8))[:3]
NIGHT = (18, 10, 31)   # the game's background (#120a1f), so the app opens straight into the same night sky
DENS = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}


def rounded(im, r):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=r, fill=255)
    out = im.copy()
    out.putalpha(m)
    return out


def main():
    for d, k in DENS.items():
        folder = os.path.join(RES, "mipmap-" + d)
        n = round(48 * k)
        ICON.resize((n, n), Image.LANCZOS).save(os.path.join(folder, "ic_launcher.png"))
        circ = ICON.resize((n, n), Image.LANCZOS)
        m = Image.new("L", (n, n), 0)
        ImageDraw.Draw(m).ellipse((0, 0, n - 1, n - 1), fill=255)
        circ.putalpha(m)
        circ.save(os.path.join(folder, "ic_launcher_round.png"))
        # adaptive foreground: 108 dp canvas, the face inside the 72 dp safe zone, on the mint background color
        f = round(108 * k)
        fg = Image.new("RGBA", (f, f), MINT + (255,))
        face = ICON.resize((round(72 * k), round(72 * k)), Image.LANCZOS)
        fg.alpha_composite(face, ((f - face.width) // 2, (f - face.height) // 2))
        fg.save(os.path.join(folder, "ic_launcher_foreground.png"))
    with open(os.path.join(RES, "values", "ic_launcher_background.xml"), "w") as fh:
        fh.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#%02X%02X%02X</color>\n</resources>\n' % MINT)
    # splash: the night background with the rounded icon in the middle
    for folder in os.listdir(RES):
        p = os.path.join(RES, folder, "splash.png")
        if not os.path.exists(p):
            continue
        w, h = Image.open(p).size
        s = Image.new("RGBA", (w, h), NIGHT + (255,))
        n = round(min(w, h) * .32)
        s.alpha_composite(rounded(ICON.resize((n, n), Image.LANCZOS), n // 5), ((w - n) // 2, (h - n) // 2))
        s.convert("RGB").save(p, optimize=True)
    print("icons and splash written from assets/icon-512.png")


if __name__ == "__main__":
    main()
