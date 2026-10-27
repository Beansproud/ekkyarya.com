"""Ekky's Village, first frame (B42 V1): one pre-composited image plus the positions of every place and gallery frame.

Usage: python3 scripts/village.py     writes assets/village/village.png, village.json and village.js
The ground, sea, paths, plank bridges and the gallery block are plain shapes in Ekky's palette (plan asset rule 4);
every character, building and prop is one of his cut-outs from assets/sprites/ (scripts/sprites.py), placed as is.
The four gallery frames are left empty: js/village.js hangs featuredPick(4) real pieces in them on every visit.
Coordinates are image pixels (720 x 880, shown at about half size on a phone); y grows downwards.
"""
import json
import os

import numpy as np

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "village")
W, H = 720, 1000
S = 4  # supersampling for the shapes

INK = (43, 19, 66)
GRASS, GRASS_L, GRASS_R = (168, 219, 160), (111, 179, 122), (78, 142, 92)
SAND = (255, 227, 168)
CLIFF, CLIFF_DARK = (201, 138, 74), (150, 96, 52)
ROCK, ROCK_LIT, ROCK_DARK = (122, 74, 64), (163, 104, 84), (92, 52, 50)
SOIL_L, SOIL_R, SOIL_L_DARK, SOIL_R_DARK, SOIL_EDGE = (240, 168, 72), (206, 128, 50), (222, 146, 58), (184, 110, 42), (170, 100, 40)
SHARD_LIT, SHARD_DARK, SHARD_LINE = (178, 176, 186), (128, 126, 140), (98, 96, 112)
GRASS_FACE, GRASS_FACE2 = (150, 208, 140), (180, 226, 168)
BUSH_LIT, BUSH_DARK, BUSH_TOP = (126, 196, 110), (86, 156, 86), (160, 220, 130)
STONE, PEBBLE = (176, 156, 178), (150, 96, 52)
GRASS_DEEP, GRASS_SPECK, GRASS_LIGHT = (126, 196, 120), (214, 240, 196), (200, 238, 184)
FLOWERS = [(255, 143, 177), (255, 255, 255), (255, 210, 90), (195, 139, 255)]
PATH, PATH_EDGE = (255, 243, 220), (233, 214, 178)
SEA, SEA_LIGHT = (104, 160, 219), (128, 180, 230)
PLANK, PLANK_EDGE = (201, 138, 74), (122, 74, 34)
WALL_L, WALL_R, ROOF = (255, 243, 220), (240, 222, 190), (255, 180, 0)
FRAME = (255, 255, 255)


def P(pts):
    return [(x * S, y * S) for x, y in pts]


def diamond(cx, cy, hw, hh):
    return [(cx, cy - hh), (cx + hw, cy), (cx, cy + hh), (cx - hw, cy)]


def blob(cx, cy, rx, ry, seed, n=72, wobble=.05):
    """An island outline: an iso ellipse with a gentle, fixed wobble (same shape on every build)."""
    import math
    ph = [seed * 1.7, seed * 2.9, seed * .7]
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        r = 1 + wobble * (math.sin(3 * a + ph[0]) * .6 + math.sin(5 * a + ph[1]) * .3 + math.sin(7 * a + ph[2]) * .1)
        pts.append((cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r))
    return pts


def scaled(pts, cx, cy, k, dy=0):
    return [(cx + (x - cx) * k, cy + (y - cy) * k + dy) for x, y in pts]


def facet(d, pts, light, dark, axis=None):
    """A low-poly shape: two faces split down the middle, the left lit and the right in shade."""
    cx = sum(x for x, _ in pts) / len(pts)
    top = min(pts, key=lambda p: p[1])
    bot = max(pts, key=lambda p: p[1])
    d.polygon(P(pts), fill=dark)
    left = [p for p in pts if p[0] <= cx]
    d.polygon(P([top] + sorted(left, key=lambda p: p[1]) + [bot]), fill=light)


def island(base, cx, cy, hw, hh, depth, seed=1, shards=3, deco=10):
    """A low-poly floating island: a square grass slab on thick soil, grey rock shards underneath,
    small shards floating around it, and low-poly bushes and stones on top (plain shapes)."""
    import random
    rnd = random.Random(seed * 31)
    d = ImageDraw.Draw(base)
    L, B, R, T = (cx - hw, cy), (cx, cy + hh), (cx + hw, cy), (cx, cy - hh)
    dn = lambda p, k=depth: (p[0], p[1] + k)
    # rock shards under the two front edges, each split into a lit and a shaded face
    for edge, n in (((L, B), shards), ((B, R), shards)):
        (x0, y0), (x1, y1) = dn(edge[0]), dn(edge[1])
        for j in range(n):
            t0, t1 = j / n, (j + 1) / n
            a = (x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0)
            b = (x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1)
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            tip = (mx + rnd.uniform(-.15, .15) * hw / n, my + hw * rnd.uniform(.28, .5) * (1.2 - abs(.5 - (t0 + t1) / 2)))
            d.polygon(P([a, (mx, my - 2), tip]), fill=SHARD_LIT, outline=SHARD_LINE)
            d.polygon(P([(mx, my - 2), b, tip]), fill=SHARD_DARK, outline=SHARD_LINE)
    # soil sides (left lit, right shaded), with a darker band at the bottom
    d.polygon(P([L, B, dn(B), dn(L)]), fill=SOIL_L)
    d.polygon(P([B, R, dn(R), dn(B)]), fill=SOIL_R)
    d.polygon(P([dn(L, depth * .7), dn(B, depth * .7), dn(B), dn(L)]), fill=SOIL_L_DARK)
    d.polygon(P([dn(B, depth * .7), dn(R, depth * .7), dn(R), dn(B)]), fill=SOIL_R_DARK)
    for (p0, p1) in ((L, B), (B, R)):   # the turf's thickness over the soil
        d.polygon(P([p0, p1, dn(p1, 5), dn(p0, 5)]), fill=GRASS_R)
    d.line(P([dn(L), dn(B), dn(R)]), fill=INK, width=2 * S)
    d.line(P([L, dn(L)]), fill=INK, width=2 * S)
    d.line(P([R, dn(R)]), fill=INK, width=2 * S)
    d.line(P([B, dn(B)]), fill=SOIL_EDGE, width=2 * S)
    # grass top in four low-poly faces around the center
    c = (cx + rnd.uniform(-.1, .1) * hw, cy + rnd.uniform(-.1, .1) * hh)
    for (p0, p1), col in (((T, L), GRASS), ((L, B), GRASS_FACE), ((B, R), GRASS), ((R, T), GRASS_FACE2)):
        d.polygon(P([c, p0, p1]), fill=col)
    d.line(P([L, B, R]), fill=INK, width=2 * S)
    d.line(P([L, T, R]), fill=GRASS_L, width=2 * S)
    # low-poly bushes and stones on top (kept away from the middle, where the places stand)
    spots = []
    for _ in range(deco * 6):
        if len(spots) >= deco:
            break
        u, v = rnd.uniform(-1, 1), rnd.uniform(-1, 1)
        if abs(u) + abs(v) > .9 or abs(u) + abs(v) < .55:
            continue
        x, y = cx + (u - v) * hw / 2, cy + (u + v) * hh / 2
        if all(abs(x - a) + abs(y - b) > 34 for a, b in spots):
            spots.append((x, y))
    for x, y in sorted(spots, key=lambda p: p[1]):
        if rnd.random() < .7:   # bush: a faceted rounded block
            w, h = rnd.uniform(12, 18), rnd.uniform(18, 28)
            pts = [(x - w, y - 2), (x - w * .8, y - h * .7), (x - w * .2, y - h), (x + w * .5, y - h * .85), (x + w, y - h * .4), (x + w * .9, y), (x, y + 3)]
            facet(d, pts, BUSH_LIT, BUSH_DARK)
            d.polygon(P([(x - w * .2, y - h), (x + w * .5, y - h * .85), (x + w * .1, y - h * .55), (x - w * .5, y - h * .6)]), fill=BUSH_TOP)
        else:   # stone: a faceted grey rock
            w, h = rnd.uniform(10, 15), rnd.uniform(9, 14)
            pts = [(x - w, y), (x - w * .5, y - h), (x + w * .4, y - h * .9), (x + w, y - h * .2), (x + w * .6, y + 2)]
            facet(d, pts, SHARD_LIT, SHARD_DARK)
    # small shards floating around the island
    for _ in range(3):
        side = rnd.choice((-1, 1))
        x = cx + side * rnd.uniform(.75, 1.05) * hw
        y = cy + hh + depth + rnd.uniform(.05, .35) * hw
        r = rnd.uniform(5, 9)
        pts = [(x, y - r * 1.2), (x + r, y - r * .2), (x + r * .2, y + r * 1.6), (x - r * .8, y)]
        facet(d, pts, SHARD_LIT, SHARD_DARK)


def path(d, pts, w=16):
    d.line(P(pts), fill=PATH_EDGE, width=(w + 4) * S, joint="curve")
    d.line(P(pts), fill=PATH, width=w * S, joint="curve")
    for x, y in (pts[0], pts[-1]):
        r = w / 2
        d.ellipse(P([(x - r, y - r / 2), (x + r, y + r / 2)]), fill=PATH)


def bridge(d, a, b, n):
    for k in range(1, n):
        x, y = a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n
        d.polygon(P([(x - 13, y), (x, y - 6), (x + 13, y), (x, y + 6)]), fill=PLANK, outline=PLANK_EDGE, width=S)


def block(d, cx, cy, hw, hh, height):
    """The gallery: a plain block with a flat roof; returns the two front walls as (top-left, top-right, ...) corners."""
    left, bottom, right = (cx - hw, cy), (cx, cy + hh), (cx + hw, cy)
    up = lambda p: (p[0], p[1] - height)
    d.polygon(P([left, bottom, up(bottom), up(left)]), fill=WALL_L, outline=INK, width=2 * S)
    d.polygon(P([bottom, right, up(right), up(bottom)]), fill=WALL_R, outline=INK, width=2 * S)
    d.polygon(P(diamond(cx, cy - height, hw, hh)), fill=ROOF, outline=INK, width=2 * S)
    return left, bottom, right


def paste(img, name, foot, h, flip=False, shadow=True):
    """Stand a cut-out with its bottom center on `foot`, scaled to height h. Returns its box."""
    sp = Image.open(os.path.join(ROOT, "assets", "sprites" if os.path.exists(os.path.join(ROOT, "assets", "sprites", name + ".png")) else "ui", name + ".png")).convert("RGBA")
    w = round(sp.width * h / sp.height)
    sp = sp.resize((w, h), Image.LANCZOS)
    if flip:
        sp = sp.transpose(Image.FLIP_LEFT_RIGHT)
    x, y = round(foot[0] - w / 2), round(foot[1] - h)
    if shadow:   # a soft ground shadow (none for things in the sky or the water)
        sh = Image.new("RGBA", img.size)
        ImageDraw.Draw(sh).ellipse((foot[0] - w * .38, foot[1] - 7, foot[0] + w * .38, foot[1] + 7), fill=INK + (60,))
        img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(3)))
    img.alpha_composite(sp, (x, y))
    return [x, y, x + w, y + h]


# name, height, facing, route (image pixels, on the paths and bridges drawn above)
WALKERS = [   # at most 2 from one piece (UX review): a client meets several pieces within 30 s
    ("car", 52, -1, [(300, 462), (226, 438)]),
    ("dog", 70, -1, [(318, 514), (262, 552)]),
    ("plug-hero", 66, -1, [(432, 482), (500, 472)]),
    ("orange-monster", 44, 1, [(360, 236), (360, 270), (360, 318)]),
    ("crab", 30, 0, [(292, 752), (328, 734)]),
]

# V5, client scenery (switch clientScenery, off): (sprite name, piece slug, foot, height). Each is a separate image over
# the village, never baked into village.png, so the switch removes it completely. Stays empty until the owner confirms
# client reuse to the Developer directly; then the cut-outs go in scripts/sprites.py (characters and props only, never
# a logo, wordmark, storefront sign or campaign lettering, per docs/roles.md).
CLIENT_SCENERY = []


def galaxy(base):
    """A galaxy cloud behind the floating islands: soft nebula glows in Ekky's purples and pinks, and small stars."""
    import random
    rnd = random.Random(7)
    col = Image.new("RGB", (W, H), (98, 58, 170))   # color and alpha are blurred apart, so the edges never go dark
    al = Image.new("L", (W, H), 0)
    cd, ad = ImageDraw.Draw(col), ImageDraw.Draw(al)
    # the glow follows the diamond of the square slabs, not a round disc: a diamond haze plus patches at its corners
    ad.polygon([(360, 170), (590, 480), (360, 840), (130, 480)], fill=120)
    cd.polygon([(360, 170), (590, 480), (360, 840), (130, 480)], fill=(110, 66, 190))
    for (x, y, rx, ry, c) in [(360, 210, 90, 60, (255, 143, 177, 170)), (560, 470, 70, 90, (214, 96, 190, 190)),
                              (160, 470, 70, 90, (132, 84, 222, 200)), (380, 790, 90, 60, (86, 136, 220, 170)),
                              (250, 320, 90, 70, (240, 130, 210, 140)), (480, 650, 100, 80, (150, 90, 230, 170))]:
        box = (x - rx, y - ry, x + rx, y + ry)
        cd.ellipse(box, fill=c[:3])
        ad.ellipse(box, fill=c[3])
    g = col.filter(ImageFilter.GaussianBlur(40)).convert("RGBA")
    g.putalpha(al.filter(ImageFilter.GaussianBlur(40)))
    gd = ImageDraw.Draw(g)
    for _ in range(140):   # stars inside the cloud
        x, y = rnd.gauss(360, 170), rnd.gauss(480, 200)
        if 0 < x < W and 0 < y < H and g.getpixel((int(x), int(y)))[3] > 40:
            r = rnd.choice([.6, .8, 1, 1.4])
            gd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, rnd.randint(140, 255)))
    for _ in range(8):   # a few sparkles
        x, y = rnd.gauss(360, 150), rnd.gauss(480, 180)
        if 0 < x < W and 0 < y < H and g.getpixel((int(x), int(y)))[3] > 60:
            gd.line((x - 4, y, x + 4, y), fill=(255, 240, 255, 220), width=1)
            gd.line((x, y - 4, x, y + 4), fill=(255, 240, 255, 220), width=1)
    # constellation pattern: small groups of gold stars joined by thin lines, plus four-point sparkles
    gold, line = (255, 214, 120), (255, 226, 160)
    for _ in range(60):
        x, y = rnd.uniform(60, 660), rnd.uniform(120, 900)
        if g.getpixel((int(x), int(y)))[3] < 25:
            continue
        pts = [(x, y)]
        for _ in range(rnd.randint(3, 5)):
            px, py = pts[-1]
            pts.append((px + rnd.uniform(-38, 38), py + rnd.uniform(-30, 30)))
        gd.line(pts, fill=line + (190,), width=1)
        for i, (px, py) in enumerate(pts):
            r = 2.8 if i == 0 else rnd.choice([1.6, 2, 2.4])
            gd.ellipse((px - r, py - r, px + r, py + r), fill=gold + (235,))
    for _ in range(40):   # four-point sparkles
        x, y = rnd.uniform(60, 660), rnd.uniform(120, 900)
        if g.getpixel((int(x), int(y)))[3] < 25:
            continue
        r = rnd.uniform(5, 10)
        gd.polygon([(x, y - r), (x + r * .22, y - r * .22), (x + r, y), (x + r * .22, y + r * .22), (x, y + r), (x - r * .22, y + r * .22), (x - r, y), (x - r * .22, y - r * .22)], fill=gold + (230,))
    base.alpha_composite(g.resize(base.size, Image.LANCZOS))
    return g


def build():
    os.makedirs(OUT, exist_ok=True)
    base = Image.new("RGBA", (W * S, H * S))
    d = ImageDraw.Draw(base)
    # the calm sea: one soft diamond, with a lighter band
    # islands: main, the observatory islet (top) and the gate islet (bottom)
    galaxy(base)
    island(base, 360, 205, 140, 70, 26, seed=2, shards=2, deco=6)
    island(base, 360, 480, 310, 155, 40, seed=1, shards=4, deco=18)
    island(base, 400, 755, 150, 75, 26, seed=3, shards=2, deco=6)
    d = ImageDraw.Draw(base)
    bridge(d, (360, 268), (360, 332), 5)
    bridge(d, (384, 628), (396, 688), 5)
    # paths from Ekky's home to every place
    home = (372, 486)
    for to in [(205, 430), (520, 470), (226, 576), (360, 335), (384, 628)]:
        path(d, [home, to])
    path(d, [(360, 268), (360, 225)])
    path(d, [(396, 688), (400, 742)])
    walls = block(d, 532, 452, 112, 56, 96)
    img = base.resize((W, H), Image.LANCZOS)

    places = {}
    # gallery frames: two per wall, as parallelograms on the wall plane (js/village.js hangs real pieces in them)
    frames = []
    left, bottom, right = walls
    for (a, b), side in [((left, bottom), "left"), ((bottom, right), "right")]:
        for k in range(2):
            t0, t1 = .14 + k * .45, .14 + k * .45 + .34
            x0, x1 = a[0] + (b[0] - a[0]) * t0, a[0] + (b[0] - a[0]) * t1
            y0 = a[1] + (b[1] - a[1]) * t0 - 82
            frames.append(dict(wall=side, x=round(x0, 1), y=round(y0, 1), w=round(x1 - x0, 1), h=56,
                               slope=round((b[1] - a[1]) / (b[0] - a[0]), 4)))
    # the frames' white mats, so the wall shows where the pictures hang even before they load
    m = Image.new("RGBA", img.size)
    md = ImageDraw.Draw(m)
    for f in frames:
        sx = f["slope"]
        x0, y0, x1 = f["x"] - 3, f["y"] - 3, f["x"] + f["w"] + 3
        md.polygon([(x0, y0), (x1, y0 + (x1 - x0) * sx), (x1, y0 + (x1 - x0) * sx + f["h"] + 6), (x0, y0 + f["h"] + 6)], fill=FRAME + (255,), outline=INK + (255,))
    img.alpha_composite(m)

    # main places: each Ekky cut-out stands on its spot (back to front, so nearer ones overlap farther ones)
    folk = {}   # still villagers and scenery (V3): tapping one opens its artwork card
    folk["ufo"] = paste(img, "ufo", (214, 196), 56, shadow=False)
    places["observatory"] = paste(img, "astronaut", (338, 222), 96)
    paste(img, "radio-explorer", (404, 228), 70)
    places["gallery"] = [420, 300, 645, 510]
    paste(img, "palette", (532, 362), 44)
    folk["fire-spirit"] = paste(img, "fire-spirit", (588, 468), 52)   # peeks out behind the Toybox (its cut edge is hidden)
    paste(img, "toybox", (604, 506), 62)
    folk["noodle-bath"] = paste(img, "noodle-bath", (112, 502), 74)
    places["studio"] = paste(img, "studio", (205, 440), 168)
    places["home"] = paste(img, "home", (372, 520), 200)
    places["doodle"] = paste(img, "ghost", (222, 594), 92)
    places["hire"] = paste(img, "gate", (400, 778), 172)
    # crop to the drawing (plus a small margin), so the island fills the phone's width and no sky is wasted above it
    bb = img.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()   # crop to the glow, which fades out inside the canvas
    ox, oy = max(0, bb[0] - 4), max(0, bb[1] - 4)
    img = img.crop((ox, oy, min(W, bb[2] + 4), min(H, bb[3] + 4)))
    img.save(os.path.join(OUT, "village.png"), optimize=True)
    # galaxy glow layer: white wherever the nebula shows between the islands, for its slow 10 % pulse
    a = np.array(img).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    neb = (a[..., 3] > 20) & (b > g + 25) & (r > g)
    sh = Image.new("LA", img.size, (255, 0))
    sh.putalpha(Image.fromarray((neb * 140).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)))
    sh.save(os.path.join(OUT, "shimmer.png"), optimize=True)

    # label anchors (bottom center of each place) and the buttons' hit boxes, in image pixels
    for f in frames:
        f["x"], f["y"] = round(f["x"] - ox, 1), round(f["y"] - oy, 1)
    out = dict(w=img.width, h=img.height, frames=frames, places={}, folk={}, walkers=[], scenery=[])
    sprites = json.load(open(os.path.join(ROOT, "assets", "sprites", "index.json")))
    for k, b in folk.items():
        out["folk"][k] = dict(piece=sprites[k]["piece"], box=[b[0] - ox, b[1] - oy, b[2] - ox, b[3] - oy])
    for name, piece, (fx, fy), h in CLIENT_SCENERY:
        sp = sprites[name]
        w = round(sp["w"] * h / sp["h"])
        out["scenery"].append(dict(name=name, piece=piece, src=sp["file"], box=[fx - w / 2 - ox, fy - h - oy, fx + w / 2 - ox, fy - oy]))
    # the gate's lantern (in the Hidden Monster cut-out at 105, 216 of 255 x 320), for its 6 s pulse
    g = places["hire"]
    out["lantern"] = [round(g[0] + 105 * (g[2] - g[0]) / 255 - ox, 1), round(g[1] + 216 * (g[3] - g[1]) / 320 - oy, 1)]
    nb = folk["noodle-bath"]
    out["smoke"] = [[round((nb[0] + nb[2]) / 2 - ox, 1), round(nb[1] + 18 - oy, 1)]]
    # walkers (content): each walks its route along a path, pauses at the ends, and turns to face where it goes.
    # face = the way the drawing looks (-1 left, 1 right, 0 either); h = height in image pixels.
    for name, h, face, route in WALKERS:
        out["walkers"].append(dict(name=name, piece=sprites[name]["piece"], src=sprites[name]["file"], h=h, face=face,
                                   aspect=round(sprites[name]["w"] / sprites[name]["h"], 3),
                                   route=[[x - ox, y - oy] for x, y in route]))

    # one rule for every label: centred just under its own place, so labels never sit on a character
    labels = {k: ((b[0] + b[2]) / 2, b[3] + 4) for k, b in places.items()}
    for k in ("studio", "observatory"):   # Director: 8 px lower, so these labels sit in front of the place, not on a face
        labels[k] = (labels[k][0], labels[k][1] + 8)
    labels["gallery"] = (532, 516)   # the gallery's place box includes its whole block; its label goes under the front corner
    for k, box in places.items():
        out["places"][k] = dict(box=[box[0] - ox, box[1] - oy, box[2] - ox, box[3] - oy], label=[labels[k][0] - ox, labels[k][1] - oy])
    with open(os.path.join(OUT, "village.json"), "w") as f:
        json.dump(out, f, indent=1)
        f.write("\n")
    with open(os.path.join(OUT, "village.js"), "w") as f:   # the same data for the browser (works from file:// too)
        f.write("// Generated by scripts/village.py from village.json. Do not edit.\nwindow.VILLAGE=" + json.dumps(out) + ";\n")
    print("wrote assets/village/village.png", os.path.getsize(os.path.join(OUT, "village.png")) // 1024, "KB")


if __name__ == "__main__":
    build()
