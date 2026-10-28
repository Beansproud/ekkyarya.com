"""Morumelons stickers (sprint 3): the 12 picked characters cut from their posters, for Color's sticker tray and the village.

Usage: python3 scripts/morumelons-stickers.py [--sheet]   writes assets/projects/morumelons/sticker-NN.png (and a contact
sheet in the scratch path given after --sheet). Same tools as scripts/ui-assets.py ("outline" mode: everything reachable
from the picture's edge without crossing Ekky's dark outline is background). The posters are busts cut off at the bottom,
so the bottom edge counts as outline and the background is reached from the top and the sides only. Nothing is drawn.
"""
import importlib.util
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location("ui_assets", os.path.join(ROOT, "scripts", "ui-assets.py"))
ui = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ui)
DIR = os.path.join(ROOT, "assets", "projects", "morumelons")
SIZE = 128   # the sticker tray and the village scale it down; the other stickers are 96

# per character: dark = the outline's luminance limit, close = px to grow the outline, open = px of thin background
# lines to drop, bg = colour distance from the corner colours that still counts as background, seed = a point on the character (px of the poster at half size, 400 x 400)
# skip: no clean cut yet (Kaiju Costume's fire breath opens its face to the background, Dark Wizard's scarf and sky are
# one dark mass); they need a hand-drawn mask
SPEC = {
    1: dict(dark=40, open=3), 2: dict(dark=70, close=2, open=3), 3: dict(dark=70), 4: dict(dark=70),
    5: dict(dark=70, close=3, skip=1), 6: dict(dark=45, bg=30, open=2), 7: dict(dark=70), 8: dict(dark=70), 9: dict(dark=70),
    10: dict(dark=45, bg=30, open=2, seed=(240, 70), skip=1), 11: dict(dark=70), 12: dict(dark=45, bg=30, open=3),
}


def cut(n, s):
    a = np.array(Image.open(os.path.join(DIR, "morumelons-%02d.webp" % n)).convert("RGBA").resize((400, 400), Image.LANCZOS)).astype(np.int32)   # half size: plenty for a 128 px sticker
    h, w = a.shape[:2]
    dark = ui.lum(a) < s.get("dark", 70)
    if s.get("bg"):   # a dark background: its own colours (sampled at the corners) never count as outline
        for x, y in ((4, 4), (395, 4), (4, 150), (395, 150)):
            dark &= np.sqrt(((a[..., :3] - a[y, x, :3]) ** 2).sum(-1)) > s["bg"]
    wall = ui.grow(dark, s.get("close", 1))
    wall[-3:, :] = True   # the bust's cut edge closes the outline
    edge = np.zeros((h, w), bool)
    edge[0, :] = edge[:, 0] = edge[:, -1] = True
    outside = ui.flood(~wall, edge & ~wall)
    seed = ui.point((h, w), s.get("seed", (200, 280)))
    m = ui.fill_holes(ui.flood(~outside, seed))
    m[-3:, :] = m[-4, :]   # the wall rows at the bottom belong to the character where it touches them
    if s.get("open"):
        k = s["open"]
        m = ui.grow(ui.flood(ui.shrink(m, k), seed), k) & m
    out = a.copy()
    out[..., 3] = np.where(m, 255, 0)
    im = Image.fromarray(out.astype(np.uint8), "RGBA")
    im.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(.8)))
    return ui.fit(im, SIZE, .04)


def build(sheet=None):
    ims = []
    for n, s in SPEC.items():
        if s.get("skip"):
            continue
        im = cut(n, s)
        im.save(os.path.join(DIR, "sticker-%02d.png" % n), optimize=True)
        ims.append(im)
    if sheet:
        cs = Image.new("RGBA", (SIZE * 6 * 2, SIZE * 2 * 2), (43, 19, 66, 255))
        for k, im in enumerate(ims):
            cs.alpha_composite(im.resize((SIZE * 2, SIZE * 2), Image.LANCZOS), ((k % 6) * SIZE * 2, (k // 6) * SIZE * 2))
        cs.save(sheet)
    print("wrote", len(ims), "stickers:", sum(os.path.getsize(os.path.join(DIR, "sticker-%02d.png" % n)) for n in SPEC if not SPEC[n].get("skip")) // 1024, "KB")


if __name__ == "__main__":
    build(sys.argv[sys.argv.index("--sheet") + 1] if "--sheet" in sys.argv else None)
