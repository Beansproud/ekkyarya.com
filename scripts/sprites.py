"""Village and game sprites (B42 V2), cut from Ekky's own pieces exactly as drawn, into assets/sprites/.

Usage: python3 scripts/sprites.py      writes assets/sprites/<name>.png and assets/sprites/index.json
Same cutting tools as scripts/ui-assets.py (Pillow + numpy). Busy pieces use a polygon or ellipse selection mask
("mask"): it only selects part of the drawing, nothing is drawn, traced or extended. Every source must be a piece
with the `village` role that shareable() allows; npm run check enforces it. Batch 1: the main places of V1.
Batch 2: villagers and scenery (V2); docs/village-sprites.png is the contact sheet (--sheet).
"""
import importlib.util
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "sprites")
_spec = importlib.util.spec_from_file_location("ui_assets", os.path.join(ROOT, "scripts", "ui-assets.py"))
ui = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ui)


def masked(spec):
    """Cut with a selection mask: polygons and ellipses (source pixels), soft 1 px edge."""
    im = Image.open(os.path.join(ROOT, spec["src"])).convert("RGBA")
    m = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(m)
    for shape in spec["mask"]:
        if shape[0] == "poly":
            d.polygon(shape[1], fill=255)
        elif shape[0] == "ellipse":
            d.ellipse(shape[1], fill=255)
    im.putalpha(m.filter(ImageFilter.GaussianBlur(.8)))
    return im.crop(m.getbbox())


def fit_h(im, h):
    """Trim to the visible pixels and scale to height h (never up past the source)."""
    bb = im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
    im = im.crop(bb)
    if im.height > h:
        im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    return im


# name: spec. h = output height in px (2x the largest size it is shown at). piece = the PROJECTS slug.
SPRITES = {
    # Ekky's home: Little Planet's Ekky at his desk on the moon, with his floating doodles (hero.png is that crop, already clear)
    "home": dict(piece="little-planet", src="assets/hero.png", use="file", h=360, role="place:home"),
    # Paint studio: the giraffe with the kid, the fence, trees and grass, cut from the white paper
    "studio": dict(piece="giraffe", src="assets/work/giraffe.jpg", box=(30, 100, 770, 820), seed=(400, 450),
                   mode="color", bg=(255, 255, 255), tol=26, h=300, role="place:studio"),
    # Gallery sign: the Toybox doodle box
    "toybox": dict(piece="toybox", src="assets/work/toybox.jpg", box=(150, 50, 860, 650), seed=(500, 300),
                   mode="color", bg=(235, 220, 160), tol=34, erase=[(548, 618), (905, 500), (905, 664), (548, 664)], stroke=(ui.INK, 6), h=140, role="place:gallery"),
    # Work with Ekky: the Hidden Monster stone gate with the two kids and their lantern (arched selection mask)
    "gate": dict(piece="hidden-monster", src="assets/work/hidden-monster.jpg",
                 mask=[("poly", [(452, 640), (1168, 640), (1168, 1100), (452, 1100)]), ("ellipse", (452, 200, 1168, 1080))],
                 h=320, role="place:hire"),
}
# Reused from assets/ui (already cut, same rules): doodle corner, observatory, signs.
REUSE = {
    "ghost": dict(piece="doodles", file="assets/ui/ghost.png", role="place:doodle"),
    "astronaut": dict(piece="nft-3", file="assets/ui/astronaut.png", role="place:observatory"),
    "radio-explorer": dict(piece="nft-9", file="assets/ui/radio-explorer.png", role="place:observatory"),
    "palette": dict(piece="little-planet", file="assets/ui/palette.png", role="sign:gallery"),
    "pen-hand": dict(piece="little-planet", file="assets/ui/pen-hand.png", role="sign:studio"),
    "helmet": dict(piece="nft-3", file="assets/ui/helmet.png", role="sign:observatory"),
}


# Batch 2 (V2): villagers and scenery from the "Elements to cut" catalogue (docs/roles.md), originals only.
# Source pixels. "within" limits a cut to a selection polygon; "bright" keeps the light shapes under the seed inside
# that selection and then takes back Ekky's outline around them (for figures standing on a dark, busy background).
D = "assets/work/doodles.jpg"
TEAL = (43, 179, 205)
BATCH2 = {
    "croc": dict(piece="doodles", src=D, box=(990, 48, 1555, 349), seed=(1355, 98), mode="color", bg=TEAL, tol=40, erase=[(990, 48), (1056, 48), (1056, 84), (1014, 90), (1014, 120), (990, 120)], h=200, role="villager"),
    "dog": dict(piece="doodles", src=D, box=(589, 563, 966, 1082), seed=(768, 896), mode="color", bg=TEAL, tol=40, erase=[(948, 1058), (966, 1058), (966, 1082), (948, 1082)], h=240, role="villager"),
    "ufo": dict(piece="doodles", src=D, box=(312, 528, 612, 800), seed=(480, 736), mode="color", bg=TEAL, tol=40, h=200, role="villager"),
    "orange-monster": dict(piece="doodles", src=D, box=(56, 592, 285, 819), seed=(160, 704), mode="color", bg=TEAL, tol=40, h=180, role="villager"),
    "pickle": dict(piece="doodles", src=D, box=(355, 780, 765, 1216), seed=(528, 992), mode="color", bg=TEAL, tol=40, h=220, role="villager"),
    "blob": dict(piece="doodles", src=D, box=(960, 365, 1264, 621), seed=(1120, 528), mode="color", bg=TEAL, tol=40, h=180, role="villager"),
    "skull": dict(piece="doodles", src=D, box=(1264, 365, 1384, 525), seed=(1328, 392), mode="color", bg=TEAL, tol=40, h=120, role="villager"),
    "doodle-cat": dict(piece="doodles", src=D, box=(40, 1328, 232, 1552), seed=(152, 1448), mode="color", bg=TEAL, tol=40, h=160, role="villager"),
    "waver": dict(piece="doodles", src=D, box=(224, 1192, 408, 1544), seed=(304, 1264), mode="color", bg=TEAL, tol=40, h=200, role="villager"),
    "plug-hero": dict(piece="plug-hero", src="assets/work/plug-hero.jpg", box=(150, 80, 850, 940), seed=(475, 292), mode="color", bg=(247, 247, 247), tol=34, h=240, role="villager"),
    "noodle-bath": dict(piece="noodles", src="assets/work/noodles.jpg", box=(90, 40, 790, 830), seed=(400, 500), mode="color", bg=(252, 252, 252), tol=60, h=260, role="scenery"),
    "car": dict(piece="road-trip", src="assets/work/road-trip.jpg", box=(185, 395, 900, 925), seed=(648, 756), mode="color", bg=(224, 242, 244), tol=24, open=4, h=240, role="villager"),
    "signpost": dict(piece="road-trip", src="assets/work/road-trip.jpg", box=(48, 700, 171, 853), seed=(108, 745), mode="color", bg=(224, 242, 244), tol=24, open=3, h=120, role="scenery"),
    "crab": dict(piece="summertime", src="assets/work/summertime.jpg", box=(415, 875, 655, 1040), seed=(529, 966), mode="outline", h=120, role="villager"),
    "fire-spirit": dict(piece="rpg", src="assets/work/rpg.jpg", within=[(226, 368), (300, 362), (314, 420), (314, 508), (226, 508), (222, 470)],
                        seed=(270, 470), mode="bright", h=160, role="villager"),
}


def bright(spec):
    """Light shapes under the seed inside the selection polygon, plus Ekky's outline around them (3 px)."""
    im = Image.open(os.path.join(ROOT, spec["src"])).convert("RGBA")
    a = np.array(im).astype(np.int32)
    sel = Image.new("L", im.size, 0)
    ImageDraw.Draw(sel).polygon(spec["within"], fill=255)
    inside = np.array(sel) > 0
    lit = (ui.lum(a) > spec.get("dark", 90)) & inside
    seed = ui.point(inside.shape, spec["seed"])
    core = ui.fill_holes(ui.flood(lit, ui.grow(seed, 2)))
    m = ui.fill_holes(ui.grow(core, spec.get("line", 3)) & inside)
    a[..., 3] = np.where(m, 255, 0)
    out = Image.fromarray(a.astype(np.uint8), "RGBA")
    out.putalpha(out.getchannel("A").filter(ImageFilter.GaussianBlur(.6)))
    return out.crop(Image.fromarray((m * 255).astype(np.uint8)).getbbox())


def make(s):
    if s.get("use") == "file":
        im = Image.open(os.path.join(ROOT, s["src"])).convert("RGBA")
    elif "mask" in s:
        im = masked(s)
    elif s.get("mode") == "bright":
        im = bright(s)
    else:
        im = ui.cut(s)
    return fit_h(im, s["h"])


def build():
    os.makedirs(OUT, exist_ok=True)
    index = {}
    for name, s in list(SPRITES.items()) + list(BATCH2.items()):
        im = make(s)
        im.save(os.path.join(OUT, name + ".png"), optimize=True)
        index[name] = dict(piece=s["piece"], file=f"assets/sprites/{name}.png", w=im.width, h=im.height, role=s["role"],
                           cut="file" if s.get("use") else "mask" if "mask" in s else s["mode"])
    for name, s in REUSE.items():
        im = Image.open(os.path.join(ROOT, s["file"]))
        index[name] = dict(piece=s["piece"], file=s["file"], w=im.width, h=im.height, role=s["role"], cut="assets/ui")
    with open(os.path.join(OUT, "index.json"), "w") as f:
        json.dump(index, f, indent=1, sort_keys=True)
        f.write("\n")
    return index


def sheet(index):
    """Contact sheet for the UX lead: every village sprite on the game's dark background and on paper."""
    names = sorted(index)
    cols, cw, ch = 6, 200, 230
    rows = (len(names) + cols - 1) // cols
    out = Image.new("RGBA", (cols * cw, rows * ch), (43, 19, 66, 255))
    d = ImageDraw.Draw(out)
    for i, n in enumerate(names):
        x, y = (i % cols) * cw, (i // cols) * ch
        if (i // cols + i % cols) % 2:
            d.rectangle((x, y, x + cw - 1, y + ch - 1), fill=(255, 243, 220, 255))
        im = Image.open(os.path.join(ROOT, index[n]["file"])).convert("RGBA")
        im.thumbnail((cw - 24, ch - 52))
        out.alpha_composite(im, (x + (cw - im.width) // 2, y + 10 + (ch - 52 - im.height) // 2))
        light = (i // cols + i % cols) % 2
        d.text((x + 10, y + ch - 36), n, fill=(43, 19, 66) if light else (255, 255, 255))
        d.text((x + 10, y + ch - 20), index[n]["piece"] + " / " + index[n]["role"], fill=(122, 74, 34) if light else (190, 170, 220))
    out.convert("RGB").save(os.path.join(ROOT, "docs", "village-sprites.png"), optimize=True)


if __name__ == "__main__":
    import sys
    idx = build()
    if "--sheet" in sys.argv:
        sheet(idx)
    for k, v in idx.items():
        print(k, v["w"], "x", v["h"], v["piece"])
