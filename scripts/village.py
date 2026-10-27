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


def island(base, cx, cy, hw, hh, depth, seed=1, k=.97, tips=((-.45, .32), (0, .48), (.42, .3))):
    """A floating island: a grass top over a soil band, and a rock underside that tapers into points.
    tips: (x offset as a share of the width, depth as a share of the width) for each hanging point."""
    import math
    import random
    rnd = random.Random(seed * 101)
    d = ImageDraw.Draw(base)
    top = blob(cx, cy, hw * k, hh * .9, seed, wobble=.11)
    rx = hw * k
    # the front half of the outline, left to right, at the bottom of the soil band
    left = min(range(len(top)), key=lambda i: top[i][0])
    right = max(range(len(top)), key=lambda i: top[i][0])
    front, i = [], left
    while True:   # points with angles from pi down to 0 run through the front (larger y)
        front.append((top[i][0], top[i][1] + depth))
        if i == right:
            break
        i = (i - 1) % len(top)
    if front[len(front) // 2][1] < cy:   # walked the back edge: go the other way round
        front, i = [], left
        while True:
            front.append((top[i][0], top[i][1] + depth))
            if i == right:
                break
            i = (i + 1) % len(top)
    # rock underside: from the right end, down to each point and back up between them, to the left end
    under = []
    pts = sorted(tips, key=lambda t: -t[0])
    bot = cy + hh * .9 + depth
    for j, (ox, dep) in enumerate(pts):
        x = cx + ox * rx
        if j:
            px = cx + pts[j - 1][0] * rx
            under.append(((x + px) / 2, bot + rx * .18))           # the valley between two points
        under.append((x + rx * .1, bot + rx * dep * .55))        # shoulder
        under.append((x, bot + rx * dep))                         # the point
        under.append((x - rx * .1, bot + rx * dep * .55))
    rock = front + under
    d.polygon(P(rock), fill=ROCK)

    def clipped(poly, paint):
        """Paint on a layer and keep only what falls inside poly (texture stays inside its shape)."""
        layer = Image.new("RGBA", base.size)
        paint(ImageDraw.Draw(layer))
        m = Image.new("L", base.size, 0)
        ImageDraw.Draw(m).polygon(P(poly), fill=255)
        layer.putalpha(Image.fromarray(np.minimum(np.array(layer.getchannel("A")), np.array(m))))
        base.alpha_composite(layer)

    def rock_texture(ld):
        for ox, dep in pts:   # each point: a lit face on the left, a shaded face on the right
            x = cx + ox * rx
            ld.polygon(P([(x - rx * .1, bot + rx * dep * .55), (x, bot + rx * dep), (x - rx * .02, bot + rx * dep * .4), (x - rx * .16, bot)]), fill=ROCK_LIT)
            ld.polygon(P([(x + rx * .02, bot + rx * dep * .3), (x, bot + rx * dep), (x + rx * .1, bot + rx * dep * .55), (x + rx * .14, bot)]), fill=ROCK_DARK)
        for j in range(5):   # strata: wavy layers across the rock
            y0 = bot + 8 + j * rx * .07
            line = [(x, y0 + 3 * math.sin(x / 18 + j * 1.7 + seed)) for x in range(int(cx - rx * 1.2), int(cx + rx * 1.2), 6)]
            ld.line(P(line), fill=ROCK_DARK + (200,), width=2 * S)
        for _ in range(int(rx / 18)):   # cracks
            x, y = cx + rnd.uniform(-.8, .8) * rx, bot + rnd.uniform(.05, .4) * rx
            ld.line(P([(x, y), (x + rnd.uniform(-6, 6), y + 7), (x + rnd.uniform(-8, 8), y + 15)]), fill=INK + (150,), width=S + 2)
        for _ in range(int(rx / 22)):   # stones set in the rock
            x, y, r = cx + rnd.uniform(-.8, .8) * rx, bot + rnd.uniform(.05, .35) * rx, rnd.uniform(3, 6)
            ld.ellipse(P([(x - r, y - r * .7), (x + r, y + r * .7)]), fill=STONE, outline=INK + (180,), width=S)
    clipped(rock, rock_texture)
    d.polygon(P(rock), outline=INK, width=2 * S)

    for kk in range(depth, 0, -2):   # soil band under the grass, with a darker lower half
        d.polygon(P(scaled(top, cx, cy, 1.0, kk)), fill=CLIFF_DARK if kk > depth * .6 else CLIFF)
    soil = scaled(top, cx, cy, 1.0, depth)

    def soil_texture(ld):
        for x, y in front[::2]:   # pebbles along the band
            if rnd.random() < .6:
                yy = y - depth * rnd.uniform(.3, .8)
                ld.ellipse(P([(x - 2, yy - 1.5), (x + 2, yy + 1.5)]), fill=PEBBLE)
    clipped([(x, y - depth) for x, y in front] + front[::-1], soil_texture)
    d.line(P(front), fill=INK, width=2 * S)
    d.polygon(P(scaled(top, cx, cy, 1.0, 6)), fill=GRASS_R)   # the turf's own thickness
    # the grass lip hangs over the soil in small drips
    for x, y in front[1:-1:3]:
        r = rnd.uniform(3, 6)
        d.ellipse(P([(x - r, y - depth + 2), (x + r, y - depth + 2 + r * 2.2)]), fill=GRASS_R)
    d.polygon(P(top), fill=GRASS)

    def grass_texture(ld):
        for _ in range(int(rx / 14)):   # darker patches
            x, y = cx + rnd.uniform(-.9, .9) * rx, cy + rnd.uniform(-.8, .8) * hh
            a, b = rnd.uniform(.08, .2) * rx, rnd.uniform(.04, .1) * rx
            ld.ellipse(P([(x - a, y - b), (x + a, y + b)]), fill=GRASS_DEEP + (120,))
        for _ in range(int(rx * .5)):   # light specks
            x, y = cx + rnd.uniform(-1, 1) * rx, cy + rnd.uniform(-1, 1) * hh
            ld.ellipse(P([(x - 1.2, y - .8), (x + 1.2, y + .8)]), fill=GRASS_SPECK)
        for _ in range(int(rx / 5)):   # grass tufts
            x, y = cx + rnd.uniform(-.95, .95) * rx, cy + rnd.uniform(-.9, .9) * hh
            for dx in (-2.5, 0, 2.5):
                ld.line(P([(x + dx * .4, y), (x + dx, y - 5 - abs(dx))]), fill=GRASS_L, width=S + 1)
        for _ in range(int(rx / 10)):   # little flowers
            x, y = cx + rnd.uniform(-.9, .9) * rx, cy + rnd.uniform(-.85, .85) * hh
            c = rnd.choice(FLOWERS)
            ld.ellipse(P([(x - 2.4, y - 1.8), (x + 2.4, y + 1.8)]), fill=c)
            ld.ellipse(P([(x - .9, y - .7), (x + .9, y + .7)]), fill=(255, 225, 120))
    clipped(top, grass_texture)
    d.line(P(top + [top[0]]), fill=GRASS_L, width=3 * S)
    back = [p for p in top if p[1] < cy]   # a soft light along the back edge
    d.line(P(sorted(back)), fill=GRASS_LIGHT, width=2 * S)


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
    for (x, y, rx, ry, c) in [(360, 480, 215, 300, (120, 72, 200, 235)), (285, 350, 120, 110, (214, 96, 190, 190)),
                              (450, 600, 130, 120, (132, 84, 222, 210)), (410, 280, 100, 80, (255, 143, 177, 150)),
                              (290, 620, 100, 90, (86, 136, 220, 150)), (480, 430, 90, 90, (240, 130, 210, 150))]:
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
    base.alpha_composite(g.resize(base.size, Image.LANCZOS))
    return g


def build():
    os.makedirs(OUT, exist_ok=True)
    base = Image.new("RGBA", (W * S, H * S))
    d = ImageDraw.Draw(base)
    # the calm sea: one soft diamond, with a lighter band
    # islands: main, the observatory islet (top) and the gate islet (bottom)
    galaxy(base)
    island(base, 360, 205, 140, 70, 18, seed=2, tips=((-.3, .4), (.25, .5)))
    island(base, 360, 480, 310, 155, 26, seed=1, k=.9)
    island(base, 400, 755, 150, 75, 18, seed=3, tips=((-.35, .45), (.05, .6), (.4, .38)))
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
