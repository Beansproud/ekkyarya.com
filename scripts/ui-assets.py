"""Cut the game's UI icons out of Ekky's own artwork into assets/ui/.

Usage: python3 scripts/ui-assets.py            (writes assets/ui/*.png and re-crops assets/cat-social.png, cat-web.png)
Needs Pillow and numpy (no scipy). Crop areas are in source pixels; docs/assets.md lists them.

Modes
  alpha    the source is already transparent (assets/hero.png): keep the shape under the seed point.
  outline  fill inside the dark outline: everything reachable from the crop edge without crossing a
           dark line is background; the shape under the seed point is kept and its holes are filled.
  color    flood fill from the crop edge over pixels close to the background colour.
  badge    no cut-out: a rounded square that keeps the original background.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "ui")
INK = (43, 19, 66)  # #2B1342


def grow(m, n=1):
    """4-neighbour dilation, n steps."""
    for _ in range(n):
        g = m.copy()
        g[1:] |= m[:-1]; g[:-1] |= m[1:]; g[:, 1:] |= m[:, :-1]; g[:, :-1] |= m[:, 1:]
        m = g
    return m


def shrink(m, n=1):
    return ~grow(~m, n)


def flood(passable, seed):
    """Pixels of `passable` connected to the boolean `seed` mask."""
    r = seed & passable
    while True:
        n = grow(r) & passable
        if n.sum() == r.sum():
            return r
        r = n


def border(shape):
    b = np.zeros(shape, bool)
    b[0, :] = b[-1, :] = b[:, 0] = b[:, -1] = True
    return b


def point(shape, xy):
    s = np.zeros(shape, bool)
    s[xy[1], xy[0]] = True
    return s


def fill_holes(m):
    return ~flood(~m, border(m.shape))


def lum(a):
    return a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114


def load(src, box):
    im = Image.open(os.path.join(ROOT, src)).convert("RGBA")
    if im.getextrema()[3][0] == 255 or src.endswith(".jpg"):
        return np.array(im.crop(box)).astype(np.int32)
    # transparent source: composite on white for colour tests but keep alpha
    return np.array(im.crop(box)).astype(np.int32)


def erase(m, spec, seed):
    """Drop polygons (source pixels) of neighbouring lines that touch the subject."""
    from PIL import ImageDraw
    polys = [spec[k] for k in ("erase", "erase2", "erase3") if spec.get(k)]
    if not polys:
        return m
    h, w = m.shape
    e = Image.new("L", (w, h), 0)
    for poly in polys:
        ImageDraw.Draw(e).polygon([(x - spec["box"][0], y - spec["box"][1]) for x, y in poly], fill=255)
    return flood(m & (np.array(e) == 0), seed)


def cut(spec):
    a = load(spec["src"], spec["box"])
    h, w = a.shape[:2]
    seed = point((h, w), (spec["seed"][0] - spec["box"][0], spec["seed"][1] - spec["box"][1]))
    mode = spec["mode"]
    if mode == "alpha":
        m = flood(a[..., 3] > 8, seed)
        if spec.get("cut"):  # straight cut across a limb: drop everything past the line
            (px, py), (dx, dy) = spec["cut"]
            yy, xx = np.mgrid[0:h, 0:w]
            m &= (xx + spec["box"][0] - px) * dx + (yy + spec["box"][1] - py) * dy < 0
            m = flood(m, seed)
        m = erase(m, spec, seed)
        alpha = np.where(m, a[..., 3], 0)
    else:
        if mode == "outline":
            dark = lum(a) < spec.get("dark", 80)
            if spec.get("wall_blue"):  # only the subject's blue outline counts as a wall, not black scenery lines
                dark &= a[..., 2] - a[..., 0] > spec["wall_blue"]
            if a[..., 3].min() < 255:
                dark &= a[..., 3] > 128
            wall = grow(dark, spec.get("close", 1))
            outside = flood(~wall, border((h, w)) & ~wall)
            m = flood(~outside, seed)
            m = fill_holes(m)
            m = grow(m, spec.get("close", 1)) & ~outside | m
            m = flood(m, seed)
        elif mode == "color":
            bg = np.array(spec["bg"])
            d = np.sqrt(((a[..., :3] - bg) ** 2).sum(-1))
            outside = flood(d < spec.get("tol", 40), border((h, w)))
            m = flood(~outside, seed)
            m = fill_holes(m)
        else:
            raise ValueError(mode)
        m = erase(m, spec, seed)
        if spec.get("open"):  # drop thin lines of the background that touch the outline
            n = spec["open"]
            m = grow(flood(shrink(m, n), seed), n) & m
        alpha = np.where(m, 255, 0)
    out = a.copy()
    out[..., 3] = alpha
    im = Image.fromarray(out.astype(np.uint8), "RGBA")
    # soften the 1-bit edge a little before downscaling
    al = im.getchannel("A").filter(ImageFilter.GaussianBlur(spec.get("soft", .6)))
    im.putalpha(al)
    if spec.get("stroke"):
        im = add_stroke(im, *spec["stroke"])
    if spec.get("stroke2"):  # light sticker edge so dark lines still read on #2B1342
        im = add_stroke(im, *spec["stroke2"])
    if spec.get("glow"):
        im = add_glow(im, spec["glow"])
    return im


def add_stroke(im, color, px):
    pad = px * 2
    big = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2))
    big.paste(im, (pad, pad))
    a = np.array(big.getchannel("A")) > 100
    ring = grow(a, px)
    st = Image.new("RGBA", big.size, color + (0,))
    st.putalpha(Image.fromarray((ring * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7)))
    st.alpha_composite(big)
    return st


def add_glow(im, spec):
    color, radius = spec
    pad = radius * 2
    big = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2))
    big.paste(im, (pad, pad))
    a = big.getchannel("A").filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(radius))
    a = a.point(lambda v: min(255, int(v * 1.6)))
    g = Image.new("RGBA", big.size, color + (0,))
    g.putalpha(a)
    g.alpha_composite(big)
    return g


def badge(spec):
    im = Image.open(os.path.join(ROOT, spec["src"])).convert("RGBA").crop(spec["box"])
    side = max(im.size)
    sq = Image.new("RGBA", (side, side))
    sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    s = 4  # supersampled rounded corners
    mask = Image.new("L", (side * s, side * s), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, side * s - 1, side * s - 1), radius=int(side * s * .24), fill=255)
    mask = mask.resize((side, side), Image.LANCZOS)
    sq.putalpha(Image.fromarray(np.minimum(np.array(sq.getchannel("A")), np.array(mask))))
    # thin ink border so it sits on light and dark backgrounds alike
    bw = max(2, side // 40)
    ring = Image.new("L", (side * s, side * s), 0)
    ImageDraw.Draw(ring).rounded_rectangle((0, 0, side * s - 1, side * s - 1), radius=int(side * s * .24), outline=255, width=bw * s)
    ring = ring.resize((side, side), Image.LANCZOS)
    ink = Image.new("RGBA", (side, side), INK + (0,))
    ink.putalpha(ring)
    sq.alpha_composite(ink)
    return sq


def fit(im, size, pad=.04):
    bb = im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
    if bb:
        im = im.crop(bb)
    inner = round(size * (1 - 2 * pad))
    sc = inner / max(im.size)
    im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
    out = Image.new("RGBA", (size, size))
    out.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    return out


def check_badge(base, size):
    """Composite a small check badge (bottom-right) on an icon: Quest Complete."""
    from PIL import ImageDraw
    s = 4
    r = int(size * .2)
    lay = Image.new("RGBA", (size * s, size * s))
    d = ImageDraw.Draw(lay)
    cx, cy = (size - r - 1) * s, (size - r - 1) * s
    d.ellipse((cx - r * s, cy - r * s, cx + r * s, cy + r * s), fill=(126, 217, 176, 255), outline=INK + (255,), width=int(size * .04 * s))
    k = r * s * .5
    d.line([(cx - k, cy), (cx - k * .25, cy + k * .7), (cx + k, cy - k * .65)], fill=INK + (255,), width=int(size * .06 * s), joint="curve")
    lay = lay.resize((size, size), Image.LANCZOS)
    out = base.copy()
    out.alpha_composite(lay)
    return out


# name: spec. size = 2x the largest display size.
ICONS = {
    "face":         dict(src="assets/face.png", box=(0, 0, 256, 256), seed=(128, 140), mode="color", bg=(212, 255, 215), tol=60, size=128),
    "pen-hand":     dict(src="assets/hero.png", box=(170, 100, 262, 220), seed=(200, 140), mode="alpha", cut=((236, 182), (1, 1.6)), stroke=(INK, 2), stroke2=((255, 255, 255), 4), size=96),
    "palette":      dict(src="assets/hero.png", box=(388, 58, 486, 156), seed=(430, 100), mode="alpha", size=96),
    "planet":       dict(src="assets/hero.png", box=(428, 186, 526, 252), seed=(475, 220), mode="alpha", size=96),
    "cat":          dict(src="assets/hero.png", box=(232, 8, 324, 100), seed=(278, 60), mode="alpha", size=96),
    "ghost":        dict(src="assets/work/doodles.jpg", box=(925, 362, 1252, 632), seed=(1100, 395), mode="outline", dark=100, close=2, open=3, size=96),
    "monster-head": dict(src="assets/work/monster.jpg", box=(610, 0, 1000, 390), mode="badge", size=128),
    "helmet":       dict(src="assets/work/nft-3.jpg", box=(30, 6, 226, 202), mode="badge", size=96),
    "virus":        dict(src="assets/work/virus-and-war.jpg", box=(440, 355, 582, 487), seed=(490, 410), mode="outline", dark=110, open=3, size=96),
}


def build(only=None):
    os.makedirs(OUT, exist_ok=True)
    made = {}
    for name, spec in ICONS.items():
        if only and name not in only:
            continue
        im = badge(spec) if spec["mode"] == "badge" else cut(spec)
        im = fit(im, spec["size"], 0 if spec["mode"] == "badge" else .04)
        im.save(os.path.join(OUT, name + ".png"), optimize=True)
        made[name] = im
    if not only or "monster-head" in only:
        check_badge(made["monster-head"], ICONS["monster-head"]["size"]).save(os.path.join(OUT, "monster-head-check.png"), optimize=True)
    return made


# Category icons, re-cut from hero.png (the old crops clipped the mic handle and caught a stray line).
CATS = {
    "cat-social": dict(src="assets/hero.png", box=(60, 366, 156, 450), seed=(85, 390), mode="outline", dark=110, erase=[(129, 388), (162, 388), (162, 433), (150, 432.5), (129, 417)], erase2=[(112, 441), (125, 433), (137, 444), (137, 452), (112, 452)], soft=.3),
    "cat-web":    dict(src="assets/hero.png", box=(408, 282, 522, 396), seed=(455, 340), mode="alpha"),
}


def build_cats():
    for name, spec in CATS.items():
        im = cut(dict({"soft": .3}, **spec))
        bb = im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
        im.crop(bb).save(os.path.join(ROOT, "assets", name + ".png"), optimize=True)


if __name__ == "__main__":
    import sys
    args = sys.argv[1:]
    if "--cats" in args:
        build_cats()
    else:
        build(args or None)
        if not args:
            build_cats()
