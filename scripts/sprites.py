"""Village and game sprites (B42 V2), cut from Ekky's own pieces exactly as drawn, into assets/sprites/.

Usage: python3 scripts/sprites.py      writes assets/sprites/<name>.png and assets/sprites/index.json
Same cutting tools as scripts/ui-assets.py (Pillow + numpy). Busy pieces use a polygon or ellipse selection mask
("mask"): it only selects part of the drawing, nothing is drawn, traced or extended. Every source must be a piece
with the `village` role that shareable() allows; npm run check enforces it. Batch 1: the main places of V1.
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


def build():
    os.makedirs(OUT, exist_ok=True)
    index = {}
    for name, s in SPRITES.items():
        if s.get("use") == "file":
            im = Image.open(os.path.join(ROOT, s["src"])).convert("RGBA")
        elif "mask" in s:
            im = masked(s)
        else:
            im = ui.cut(s)
        im = fit_h(im, s["h"])
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


if __name__ == "__main__":
    for k, v in build().items():
        print(k, v["w"], "x", v["h"], v["piece"])
