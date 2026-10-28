"""Ekky's Village, first frame (B42 V1): one pre-composited image plus the positions of every place and gallery frame.

Usage: python3 scripts/village.py     writes assets/village/village.png, village.json and village.js
The ground, sea, paths, plank bridges and the gallery's ramen shop are plain shapes in Ekky's palette (plan asset rule 4);
every character, building and prop is one of his cut-outs from assets/sprites/ (scripts/sprites.py), placed as is.
The four gallery frames are left empty: js/village.js hangs featuredPick(4) real pieces in them on every visit.
Coordinates are image pixels (720 x 880, shown at about half size on a phone); y grows downwards.
"""
import json
import math
import os

import numpy as np

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "village")
W, H = 720, 1000
S = 4  # supersampling for the shapes
# the visible window of the canvas, kept from the first version so village.json stays in the same 601 x 827 space
CROP = (67, 105, 668, 932)
Z = 2  # the saved ground is Z times the canvas; village.json stays in canvas units

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


THEME_MAIN = dict(grass=GRASS, grass_l=GRASS_L, grass_r=GRASS_R, deep=GRASS_DEEP, speck=GRASS_SPECK, light=GRASS_LIGHT,
                  cliff=CLIFF, cliff_dark=CLIFF_DARK, rock=ROCK, lit=ROCK_LIT, dark=ROCK_DARK, stone=STONE, pebble=PEBBLE,
                  flowers=FLOWERS)


def sparkle(ld, x, y, r, fill):
    ld.polygon(P([(x, y - r), (x + r * .2, y - r * .2), (x + r, y), (x + r * .2, y + r * .2), (x, y + r), (x - r * .2, y + r * .2), (x - r, y), (x - r * .2, y - r * .2)]), fill=fill)


# North: the cool cosmic observatory. Blue-violet rock with pale veins, frosted lavender ground, star dust.
NORTH_ROCK, NORTH_LIT, NORTH_DARK = (70, 66, 150), (118, 124, 214), (40, 36, 96)
FROST = (236, 244, 255)


def north_rock(ld, rnd, cx, cy, rx, hh, bot):
    for _ in range(int(rx / 9)):   # pale ice veins
        x, y = cx + rnd.uniform(-.85, .85) * rx, bot + rnd.uniform(.03, .42) * rx
        ld.line(P([(x, y), (x + rnd.uniform(-9, 9), y + 9), (x + rnd.uniform(-12, 12), y + 20)]), fill=(170, 210, 255, 170), width=S)
    for _ in range(int(rx / 6)):   # star dust set in the rock
        x, y = cx + rnd.uniform(-.85, .85) * rx, bot + rnd.uniform(.02, .5) * rx
        r = rnd.choice([.7, 1, 1.3])
        ld.ellipse(P([(x - r, y - r), (x + r, y + r)]), fill=(255, 255, 255, rnd.randint(150, 255)))


def north_top(ld, rnd, cx, cy, rx, hh):
    for _ in range(int(rx / 12)):   # frost: pale patches that drift to the rim
        x, y = cx + rnd.uniform(-.95, .95) * rx, cy + rnd.uniform(-.85, .85) * hh
        a, b = rnd.uniform(.08, .2) * rx, rnd.uniform(.04, .09) * rx
        ld.ellipse(P([(x - a, y - b), (x + a, y + b)]), fill=FROST + (120,))
    for _ in range(int(rx / 10)):   # ice crystals: small upright prisms
        x, y = cx + rnd.uniform(-.9, .9) * rx, cy + rnd.uniform(-.8, .85) * hh
        h = rnd.uniform(5, 10)
        ld.polygon(P([(x - 2, y), (x - 1, y - h), (x + 1, y - h * .8), (x + 2.4, y)]), fill=(205, 232, 255, 230), outline=(120, 140, 220, 255))
    for _ in range(int(rx / 7)):   # star dust: sparkles and dots
        x, y = cx + rnd.uniform(-.95, .95) * rx, cy + rnd.uniform(-.9, .9) * hh
        if rnd.random() < .45:
            sparkle(ld, x, y, rnd.uniform(2.5, 5), (255, 236, 170, 235))
        else:
            ld.ellipse(P([(x - 1, y - .8), (x + 1, y + .8)]), fill=(255, 255, 255, 230))
    ring = [(cx + 62 * math.cos(a / 24 * 2 * math.pi), cy + 5 + 25 * math.sin(a / 24 * 2 * math.pi)) for a in range(25)]
    ld.line(P(ring), fill=(255, 226, 160, 210), width=S)   # a gold star-chart ring on the ground
    for a in range(0, 24, 3):
        x, y = ring[a]
        ld.ellipse(P([(x - 1.6, y - 1.2), (x + 1.6, y + 1.2)]), fill=(255, 214, 120, 255))


NORTH = dict(grass=(184, 200, 236), grass_l=(222, 236, 255), grass_r=(98, 100, 176), deep=(158, 172, 226), speck=(255, 255, 255),
             light=(240, 247, 255), cliff=(112, 112, 186), cliff_dark=(78, 76, 150), rock=NORTH_ROCK, lit=NORTH_LIT,
             dark=NORTH_DARK, stone=(180, 214, 255), pebble=(86, 84, 160), flowers=[(255, 255, 255), (190, 222, 255), (255, 232, 160)],
             rock_extra=north_rock, top_extra=north_top)

# South: the warm studio island at sunset. Amber rock, paper-and-cardboard ground with washi tape, lantern light.
SOUTH_ROCK, SOUTH_LIT, SOUTH_DARK = (176, 104, 46), (232, 156, 74), (118, 62, 34)
TAPE = [(255, 214, 100), (255, 163, 150), (150, 205, 200)]


def south_rock(ld, rnd, cx, cy, rx, hh, bot):
    for j in range(3):   # a strip of masking tape wrapped round the rock
        y0 = bot + 12 + j * rx * .14
        line = [(x, y0 + 4 * math.sin(x / 22 + j * 2.1)) for x in range(int(cx - rx * 1.2), int(cx + rx * 1.2), 6)]
        ld.line(P(line), fill=(255, 236, 190, 120), width=5 * S)
    for _ in range(int(rx / 8)):   # lantern light catching the grain
        x, y = cx + rnd.uniform(-.85, .85) * rx, bot + rnd.uniform(.03, .45) * rx
        ld.ellipse(P([(x - 1.6, y - 1), (x + 1.6, y + 1)]), fill=(255, 212, 120, 200))


def south_top(ld, rnd, cx, cy, rx, hh):
    for _ in range(int(rx * .9)):   # paper fibres
        x, y = cx + rnd.uniform(-1, 1) * rx, cy + rnd.uniform(-1, 1) * hh
        ld.line(P([(x, y), (x + rnd.uniform(-5, 5), y + rnd.uniform(-2, 2))]), fill=(255, 250, 232, 150), width=S)
    for _ in range(5):   # crumple creases
        x, y = cx + rnd.uniform(-.7, .7) * rx, cy + rnd.uniform(-.6, .6) * hh
        ld.line(P([(x, y), (x + rnd.uniform(20, 45), y + rnd.uniform(-8, 8)), (x + rnd.uniform(50, 90), y + rnd.uniform(-12, 12))]), fill=(180, 120, 70, 90), width=S + 1)
    for dx, dy, ang, col in [(-.6, .1, -.3, TAPE[0]), (.62, .05, .4, TAPE[1]), (-.12, .62, .08, TAPE[2]), (.34, .45, -.25, TAPE[0])]:
        x, y = cx + dx * rx, cy + dy * hh   # washi tape strips with notched ends
        c, s = math.cos(ang), math.sin(ang)
        hw, hh2 = 30, 8
        pts = [(-hw, -hh2), (hw, -hh2), (hw - 3, 0), (hw, hh2), (-hw, hh2), (-hw + 3, 0)]
        ld.polygon(P([(x + px * c - py * s, y + px * s + py * c) for px, py in pts]), fill=col + (205,), outline=(120, 70, 40, 160))
        for k in range(-3, 4):
            ld.line(P([(x + k * 7 * c - 3 * -s, y + k * 7 * s - 3 * c), (x + k * 7 * c + 3 * -s, y + k * 7 * s + 3 * c)]), fill=(255, 255, 255, 120), width=S)
    for _ in range(int(rx / 9)):   # pencil dots, like a sketch grid
        x, y = cx + rnd.uniform(-.9, .9) * rx, cy + rnd.uniform(-.85, .85) * hh
        ld.ellipse(P([(x - 1, y - .7), (x + 1, y + .7)]), fill=(150, 96, 60, 150))
    for _ in range(int(rx / 30)):   # ink stars
        sparkle(ld, cx + rnd.uniform(-.8, .8) * rx, cy + rnd.uniform(-.7, .7) * hh, rnd.uniform(3, 5), (255, 196, 80, 230))


SOUTH = dict(grass=(244, 188, 110), grass_l=(255, 216, 140), grass_r=(176, 104, 48), deep=(226, 158, 84), speck=(255, 240, 200),
             light=(255, 226, 160), cliff=(206, 124, 54), cliff_dark=(164, 94, 46), rock=SOUTH_ROCK, lit=SOUTH_LIT,
             dark=SOUTH_DARK, stone=(255, 220, 160), pebble=(150, 86, 44), flowers=[(255, 176, 96), (255, 244, 214), (255, 150, 120)],
             rock_extra=south_rock, top_extra=south_top)


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


def island(base, cx, cy, hw, hh, depth, seed=1, k=.97, tips=((-.45, .32), (0, .48), (.42, .3)), T=None):
    T = T or THEME_MAIN
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
    d.polygon(P(rock), fill=T['rock'])

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
            ld.polygon(P([(x - rx * .1, bot + rx * dep * .55), (x, bot + rx * dep), (x - rx * .02, bot + rx * dep * .4), (x - rx * .16, bot)]), fill=T['lit'])
            ld.polygon(P([(x + rx * .02, bot + rx * dep * .3), (x, bot + rx * dep), (x + rx * .1, bot + rx * dep * .55), (x + rx * .14, bot)]), fill=T['dark'])
        for j in range(5):   # strata: wavy layers across the rock
            y0 = bot + 8 + j * rx * .07
            line = [(x, y0 + 3 * math.sin(x / 18 + j * 1.7 + seed)) for x in range(int(cx - rx * 1.2), int(cx + rx * 1.2), 6)]
            ld.line(P(line), fill=T['dark'] + (200,), width=2 * S)
        for _ in range(int(rx / 18)):   # cracks
            x, y = cx + rnd.uniform(-.8, .8) * rx, bot + rnd.uniform(.05, .4) * rx
            ld.line(P([(x, y), (x + rnd.uniform(-6, 6), y + 7), (x + rnd.uniform(-8, 8), y + 15)]), fill=INK + (150,), width=S + 2)
        for _ in range(int(rx / 22)):   # stones set in the rock
            x, y, r = cx + rnd.uniform(-.8, .8) * rx, bot + rnd.uniform(.05, .35) * rx, rnd.uniform(3, 6)
            ld.ellipse(P([(x - r, y - r * .7), (x + r, y + r * .7)]), fill=T['stone'], outline=INK + (180,), width=S)
    clipped(rock, rock_texture)
    if T.get('rock_extra'):
        clipped(rock, lambda ld: T['rock_extra'](ld, rnd, cx, cy, rx, hh, bot))
    d.polygon(P(rock), outline=INK, width=2 * S)

    for kk in range(depth, 0, -2):   # soil band under the grass, with a darker lower half
        d.polygon(P(scaled(top, cx, cy, 1.0, kk)), fill=T['cliff_dark'] if kk > depth * .6 else T['cliff'])
    soil = scaled(top, cx, cy, 1.0, depth)

    def soil_texture(ld):
        for x, y in front[::2]:   # pebbles along the band
            if rnd.random() < .6:
                yy = y - depth * rnd.uniform(.3, .8)
                ld.ellipse(P([(x - 2, yy - 1.5), (x + 2, yy + 1.5)]), fill=T['pebble'])
    clipped([(x, y - depth) for x, y in front] + front[::-1], soil_texture)
    d.line(P(front), fill=INK, width=2 * S)
    d.polygon(P(scaled(top, cx, cy, 1.0, 6)), fill=T['grass_r'])   # the turf's own thickness
    # the grass lip hangs over the soil in small drips
    for x, y in front[1:-1:3]:
        r = rnd.uniform(3, 6)
        d.ellipse(P([(x - r, y - depth + 2), (x + r, y - depth + 2 + r * 2.2)]), fill=T['grass_r'])
    d.polygon(P(top), fill=T['grass'])

    def grass_texture(ld):
        for _ in range(int(rx / 14)):   # darker patches
            x, y = cx + rnd.uniform(-.9, .9) * rx, cy + rnd.uniform(-.8, .8) * hh
            a, b = rnd.uniform(.08, .2) * rx, rnd.uniform(.04, .1) * rx
            ld.ellipse(P([(x - a, y - b), (x + a, y + b)]), fill=T['deep'] + (120,))
        for _ in range(int(rx * .5)):   # light specks
            x, y = cx + rnd.uniform(-1, 1) * rx, cy + rnd.uniform(-1, 1) * hh
            ld.ellipse(P([(x - 1.2, y - .8), (x + 1.2, y + .8)]), fill=T['speck'])
        for _ in range(int(rx / 5)):   # grass tufts
            x, y = cx + rnd.uniform(-.95, .95) * rx, cy + rnd.uniform(-.9, .9) * hh
            for dx in (-2.5, 0, 2.5):
                ld.line(P([(x + dx * .4, y), (x + dx, y - 5 - abs(dx))]), fill=T['grass_l'], width=S + 1)
        for _ in range(int(rx / 10)):   # little flowers
            x, y = cx + rnd.uniform(-.9, .9) * rx, cy + rnd.uniform(-.85, .85) * hh
            c = rnd.choice(T['flowers'])
            ld.ellipse(P([(x - 2.4, y - 1.8), (x + 2.4, y + 1.8)]), fill=c)
            ld.ellipse(P([(x - .9, y - .7), (x + .9, y + .7)]), fill=(255, 225, 120))
    clipped(top, grass_texture)
    if T.get('top_extra'):
        clipped(top, lambda ld: T['top_extra'](ld, rnd, cx, cy, rx, hh))
    d.line(P(top + [top[0]]), fill=T['grass_l'], width=3 * S)
    back = [p for p in top if p[1] < cy]   # a soft light along the back edge
    d.line(P(sorted(back)), fill=T['light'], width=2 * S)


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


RAMEN_RED, RAMEN_RED_D, RAMEN_RED_L = (226, 70, 64), (178, 44, 56), (244, 112, 92)
WOOD, WOOD_D = (150, 96, 52), (110, 66, 40)
LANTERN, LANTERN_D = (236, 58, 58), (176, 30, 46)


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def chochin(d, x, y, r=6):
    """A red paper lantern hanging from (x, y): cord, ink caps, ribs and a white band (one stroke hints at a word)."""
    d.line(P([(x, y), (x, y + 3)]), fill=INK, width=S)
    top, h = y + 3, r * 2.6
    d.rectangle(P([(x - r * .55, top), (x + r * .55, top + 2)]), fill=INK)
    d.ellipse(P([(x - r, top + 1.5), (x + r, top + h)]), fill=LANTERN, outline=INK, width=S + 1)
    for k in (.45, .75):
        d.arc(P([(x - r * k, top + 2), (x + r * k, top + h - .5)]), 90, 270, fill=LANTERN_D, width=S)
        d.arc(P([(x - r * k, top + 2), (x + r * k, top + h - .5)]), -90, 90, fill=LANTERN_D, width=S)
    d.line(P([(x, top + h * .32), (x, top + h * .7)]), fill=INK, width=S + 1)
    d.rectangle(P([(x - r * .55, top + h - .5), (x + r * .55, top + h + 1.5)]), fill=INK)
    d.line(P([(x, top + h + 1.5), (x, top + h + 4)]), fill=INK, width=S)
    return x, top + h / 2


def katakana_sign(d, x, y, w, h):
    """The shop's hanging board, "ラーメン" (ramen) written top to bottom in hand-drawn ink strokes."""
    d.line(P([(x + 2, y - 6), (x + 2, y)]), fill=INK, width=S)
    d.line(P([(x + w - 2, y - 6), (x + w - 2, y)]), fill=INK, width=S)
    d.rounded_rectangle(P([(x, y), (x + w, y + h)]), radius=2 * S, fill=(255, 250, 240), outline=INK, width=2 * S)
    c, g, u = x + w / 2, h / 4, w * .3    # one glyph per quarter, u = half a glyph's width
    ln = lambda pts, k=1.6: d.line(P(pts), fill=INK, width=int(S * k), joint="curve")
    t = y + 2                                                   # ラ
    ln([(c - u * .7, t + 1.5), (c + u * .7, t + 1.5)])
    ln([(c - u, t + 4), (c + u, t + 4), (c + u * .6, t + 7.5), (c - u * .5, t + g - 1.5)])
    t += g                                                      # ー, drawn upright in vertical writing
    ln([(c, t + 1.5), (c, t + g - 2)])
    t += g                                                      # メ
    ln([(c + u, t + 1.5), (c + u * .2, t + 5), (c - u, t + g - 1.5)])
    ln([(c - u * .5, t + 3.5), (c + u * .8, t + g - 2)])
    t += g                                                      # ン
    ln([(c - u, t + 1.5), (c - u * .3, t + 3)])
    ln([(c - u, t + g - 2), (c + u * .4, t + g - 3.5), (c + u, t + 1.5)])


def ramen_bowl(d, cx, cy, rx):
    """A big ramen bowl, the shop's rooftop sign: red bowl with a white wave, broth, noodles, egg, naruto, nori, chopsticks."""
    ry = rx * .36
    d.line(P([(cx - rx * .35, cy - ry * .2), (cx + rx * .95, cy - rx * 1.45)]), fill=WOOD_D, width=3 * S)   # the far chopstick
    d.polygon(P([(cx + rx * .32, cy - ry * .9), (cx + rx * .72, cy - ry * .7), (cx + rx * .66, cy - rx * .95), (cx + rx * .3, cy - rx * 1.02)]),
              fill=(46, 84, 60), outline=INK, width=S)                                                      # nori standing in the broth
    d.ellipse(P([(cx - rx * 1.1, cy + rx * .62), (cx + rx * 1.1, cy + rx * 1.02)]), fill=(140, 30, 44))   # its shadow on the roof
    d.rounded_rectangle(P([(cx - rx * .34, cy + rx * .62), (cx + rx * .34, cy + rx * .86)]), radius=S, fill=RAMEN_RED_D, outline=INK, width=S + 1)   # the foot
    body = [(cx - rx + rx * 2 * k / 24, cy + math.sin(math.pi * k / 24) * rx * .7) for k in range(25)]
    d.polygon(P(body), fill=LANTERN, outline=INK, width=2 * S)
    wave = [(cx - rx * .7 + rx * 1.4 * k / 24, cy + rx * .42 + math.sin(k * math.pi / 3) * 1.4) for k in range(25)]
    d.line(P(wave), fill=(255, 250, 240), width=2 * S, joint="curve")
    d.ellipse(P([(cx - rx, cy - ry), (cx + rx, cy + ry)]), fill=(255, 250, 240), outline=INK, width=2 * S)
    d.ellipse(P([(cx - rx * .86, cy - ry * .78), (cx + rx * .86, cy + ry * .8)]), fill=(240, 162, 82))
    for j in range(4):                                                                                       # noodles
        yy = cy - ry * .35 + j * ry * .3
        d.line(P([(cx - rx * .62 + k * 2.2, yy + (1 if k % 2 else -1) * .8) for k in range(int(rx * .55))]), fill=(255, 226, 120), width=int(S * 1.4))
    d.ellipse(P([(cx - rx * .62, cy - ry * .55), (cx - rx * .18, cy + ry * .35)]), fill=(255, 252, 244), outline=INK, width=S)   # half an egg
    d.ellipse(P([(cx - rx * .5, cy - ry * .35), (cx - rx * .3, cy + ry * .15)]), fill=(255, 176, 40))
    d.ellipse(P([(cx + rx * .08, cy - ry * .3), (cx + rx * .44, cy + ry * .5)]), fill=(255, 252, 244), outline=INK, width=S)     # naruto
    d.arc(P([(cx + rx * .17, cy - ry * .1), (cx + rx * .35, cy + ry * .3)]), 0, 300, fill=(255, 128, 168), width=S + 1)
    d.line(P([(cx - rx * .55, cy + ry * .15), (cx + rx * 1.15, cy - rx * 1.3)]), fill=WOOD, width=3 * S)   # the near chopstick
    d.line(P([(cx - rx * .55, cy + ry * .15), (cx + rx * 1.15, cy - rx * 1.3)]), fill=(214, 160, 100), width=S)


def ramen_shop(d, cx, cy, hw, hh, height):
    """The gallery is Ekky's ramen shop: posters on the walls (the frames), a striped awning, a red tiled roof with
    paper lanterns at the eaves, a "ラーメン" board on the front corner and a big bowl on top. Returns the two front walls as (left, bottom, right) corners, the lantern spots and the bowl's steam spot."""
    left, bottom, right = (cx - hw, cy), (cx, cy + hh), (cx + hw, cy)
    up = lambda p, k=height: (p[0], p[1] - k)
    for a, b, wall in ((left, bottom, WALL_L), (bottom, right, WALL_R)):
        d.polygon(P([a, b, up(b), up(a)]), fill=wall, outline=INK, width=2 * S)
        d.polygon(P([a, b, up(b, 9), up(a, 9)]), fill=WOOD if wall == WALL_L else WOOD_D, outline=INK, width=2 * S)   # wooden skirting
        n = 9
        for k in range(n):   # the striped awning along the top of the wall, with a scalloped hem
            p0, p1 = lerp(a, b, k / n), lerp(a, b, (k + 1) / n)
            col = (RAMEN_RED if wall == WALL_L else RAMEN_RED_D) if k % 2 == 0 else (255, 250, 240)
            d.polygon(P([up(p0), up(p1), up(p1, height - 9), up(p0, height - 9)]), fill=col)
            m = lerp(p0, p1, .5)
            hr = (p1[0] - p0[0]) / 2
            d.chord(P([(m[0] - hr, m[1] - height + 9 - 3), (m[0] + hr, m[1] - height + 9 + 3)]), 0, 180, fill=col)
        d.line(P([up(a), up(b)]), fill=INK, width=2 * S)
    d.line(P([bottom, up(bottom)]), fill=INK, width=2 * S)
    # the roof: eaves over the walls, a dark wooden fascia, four tiled faces up to a small cap
    ey, ew, eh, rise = cy - height - 5, hw + 8, hh + 4, 34
    L, T, R, B = (cx - ew, ey), (cx, ey - eh), (cx + ew, ey), (cx, ey + eh)
    A = (cx, ey - rise)
    for p, q in ((L, B), (B, R)):
        d.polygon(P([p, q, (q[0], q[1] + 5), (p[0], p[1] + 5)]), fill=WOOD_D, outline=INK, width=2 * S)
    faces = ((L, T, RAMEN_RED_L), (T, R, RAMEN_RED_L), (L, B, RAMEN_RED), (B, R, RAMEN_RED_D))
    for p, q, col in faces:
        d.polygon(P([p, q, A]), fill=col, outline=INK, width=2 * S)
    for p, q, col in faces[2:]:   # tile rows, parallel to the eave
        for t in (.25, .5, .75):
            d.line(P([lerp(p, A, t), lerp(q, A, t)]), fill=RAMEN_RED_D if col == RAMEN_RED else (140, 30, 44), width=S + 1)
        for k in range(1, 8):
            d.line(P([lerp(p, q, k / 8), lerp(lerp(p, q, k / 8), A, .25)]), fill=RAMEN_RED_D if col == RAMEN_RED else (140, 30, 44), width=S)
    for p in (L, B, R):
        d.line(P([p, A]), fill=INK, width=3 * S)
    d.line(P([L, B, R]), fill=INK, width=2 * S)
    lights = [chochin(d, L[0] + 3, L[1] + 4, 7), chochin(d, R[0] - 3, R[1] + 4, 7)]   # at the side corners: the frames' pictures cover the walls
    katakana_sign(d, cx - 7, B[1] + 10, 14, 46)
    ramen_bowl(d, cx, A[1] + 10, 30)
    return (left, bottom, right), lights, (cx, A[1] - 4)


def radial(im, cx, cy, rx, ry, rgb, a, k):
    """A soft elliptical glow centred on (cx, cy) (canvas units; k = pixels per unit of im), peak opacity a (0..1)."""
    x0, y0 = max(0, int((cx - rx) * k)), max(0, int((cy - ry) * k))
    x1, y1 = min(im.width, int((cx + rx) * k)), min(im.height, int((cy + ry) * k))
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = np.sqrt(((xx / k - cx) / rx) ** 2 + ((yy / k - cy) / ry) ** 2)
    al = np.clip(1 - d, 0, 1) ** 2.4 * a * 255
    lay = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    lay[..., :3] = rgb
    lay[..., 3] = al.astype(np.uint8)
    im.alpha_composite(Image.fromarray(lay), (x0, y0))


INK_PAD = 6 * Z


def inked(sp, name, cut=()):
    """Ekky's cut-out with one shared, slightly wobbly dark ink outline (about 2 px on a phone) around its silhouette,
    so every character and prop on the islands reads as drawn on the same page. The wobble is a fixed noise per name."""
    import random
    rnd = np.random.RandomState(sum(map(ord, name)))
    pad = INK_PAD
    big = Image.new("RGBA", (sp.width + 2 * pad, sp.height + 2 * pad))
    big.alpha_composite(sp, (pad, pad))
    a = big.getchannel("A").point(lambda v: 255 if v > 40 else 0)
    thin, thick = a.filter(ImageFilter.MaxFilter(2 * int(1.4 * Z) + 1)), a.filter(ImageFilter.MaxFilter(2 * int(2.4 * Z) + 1))
    n = Image.fromarray((rnd.rand(big.height // 24 + 2, big.width // 24 + 2) * 255).astype(np.uint8)).resize(big.size, Image.BICUBIC)
    n = n.filter(ImageFilter.GaussianBlur(4)).point(lambda v: 255 if v > 118 else 0)
    ring = Image.composite(thick, thin, n).filter(ImageFilter.GaussianBlur(.6))
    if cut:   # no ink line across a flat cut: it fades into the ground instead
        r = np.array(ring)
        m = 14 * Z + pad
        if "bottom" in cut:
            r[-m:, :] = 0
        if "left" in cut:
            r[:, :m] = 0
        if "right" in cut:
            r[:, -m:] = 0
        ring = Image.fromarray(r)
    out = Image.new("RGBA", big.size, INK + (0,))
    out.putalpha(ring)
    out.alpha_composite(big)
    return out


def feather(sp, sides, px):
    """Fade the alpha of a cut-out toward the sides where its picture was cropped flat (the original art ends in a straight line
    there), so the island's own ground shows through and no straight edge is left."""
    a = np.array(sp.getchannel("A")).astype(float)
    h, w = a.shape
    ramp = lambda n: np.clip(np.arange(n) / px, 0, 1)
    if "bottom" in sides:
        a *= ramp(h)[::-1][:, None]
    if "top" in sides:
        a *= ramp(h)[:, None]
    if "left" in sides:
        a *= ramp(w)[None, :]
    if "right" in sides:
        a *= ramp(w)[::-1][None, :]
    out = sp.copy()
    out.putalpha(Image.fromarray((a * 1).astype(np.uint8)))
    return out


def paste(img, name, foot, h, flip=False, shadow=True, ink=True, cut=()):
    """Stand a cut-out with its bottom center on `foot` (canvas units), scaled to height h; img is Z times the canvas.
    Returns its box in canvas units."""
    sp = Image.open(os.path.join(ROOT, "assets", "sprites" if os.path.exists(os.path.join(ROOT, "assets", "sprites", name + ".png")) else "ui", name + ".png")).convert("RGBA")
    w = round(sp.width * h / sp.height)
    sp = sp.resize((w * Z, h * Z), Image.LANCZOS)
    if flip:
        sp = sp.transpose(Image.FLIP_LEFT_RIGHT)
    if cut:
        sp = feather(sp, cut, 12 * Z)
    x, y = round(foot[0] * Z - w * Z / 2), round(foot[1] * Z - h * Z)
    if shadow:   # a soft ground shadow (none for things in the sky or the water)
        sh = Image.new("RGBA", img.size)
        ImageDraw.Draw(sh).ellipse(((foot[0] - w * .38) * Z, (foot[1] - 7) * Z, (foot[0] + w * .38) * Z, (foot[1] + 7) * Z), fill=INK + (60,))
        img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(3 * Z)))
    box = [x // Z, y // Z, (x + w * Z) // Z, (y + h * Z) // Z]
    if ink:
        sp = inked(sp, name, cut)
        x, y = x - INK_PAD, y - INK_PAD
    img.alpha_composite(sp, (x, y))
    return box


# name, height, facing, route (image pixels, on the paths and bridges drawn above)
WALKERS = [   # at most 2 from one piece (UX review): a client meets several pieces within 30 s
    ("car", 52, -1, [(300, 462), (226, 438)]),
    ("dog", 70, -1, [(318, 514), (262, 552)]),
    ("plug-hero", 66, -1, [(432, 482), (500, 472)]),
    ("orange-monster", 44, 1, [(360, 236), (360, 270), (360, 318)]),
    ("crab", 30, 0, [(292, 752), (328, 734)]),
    ("mm-popstar", 50, 0, [(262, 246), (296, 256)]),   # Morumelons: on the north island's free left side
    ("mm-clown", 52, 0, [(448, 598), (490, 590)]),     # and on the grass between Ekky's home and the Gallery
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
    nebula = g.copy()   # the soft cloud alone; the stars below are saved as a crisp vector (stars.svg), not as pixels
    prim = []           # svg shapes, in canvas units
    gd = ImageDraw.Draw(g)   # a scratch copy, so the star positions come out exactly as before
    for _ in range(140):   # stars inside the cloud
        x, y = rnd.gauss(360, 170), rnd.gauss(480, 200)
        if 0 < x < W and 0 < y < H and g.getpixel((int(x), int(y)))[3] > 40:
            r = rnd.choice([.6, .8, 1, 1.4])
            al_ = rnd.randint(140, 255)
            gd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, al_))
            prim.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fff" fill-opacity="%.2f"/>' % (x, y, r, al_ / 255))
    for _ in range(8):   # a few sparkles
        x, y = rnd.gauss(360, 150), rnd.gauss(480, 180)
        if 0 < x < W and 0 < y < H and g.getpixel((int(x), int(y)))[3] > 60:
            gd.line((x - 4, y, x + 4, y), fill=(255, 240, 255, 220), width=1)
            gd.line((x, y - 4, x, y + 4), fill=(255, 240, 255, 220), width=1)
            prim.append('<path d="M%.1f %.1fh8M%.1f %.1fv8" stroke="#FFF0FF" stroke-opacity=".86" stroke-width="1" fill="none"/>' % (x - 4, y, x, y - 4))
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
        prim.append('<polyline points="%s" stroke="#FFE2A0" stroke-opacity=".75" stroke-width="1" fill="none"/>' % " ".join("%.1f,%.1f" % q for q in pts))
        for i, (px, py) in enumerate(pts):
            r = 2.8 if i == 0 else rnd.choice([1.6, 2, 2.4])
            gd.ellipse((px - r, py - r, px + r, py + r), fill=gold + (235,))
            prim.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#FFD678" fill-opacity=".92"/>' % (px, py, r))
    for _ in range(40):   # four-point sparkles
        x, y = rnd.uniform(60, 660), rnd.uniform(120, 900)
        if g.getpixel((int(x), int(y)))[3] < 25:
            continue
        r = rnd.uniform(5, 10)
        gd.polygon([(x, y - r), (x + r * .22, y - r * .22), (x + r, y), (x + r * .22, y + r * .22), (x, y + r), (x - r * .22, y + r * .22), (x - r, y), (x - r * .22, y - r * .22)], fill=gold + (230,))
        prim.append('<path d="M%.1f %.1fL%.1f %.1fL%.1f %.1fL%.1f %.1fL%.1f %.1fL%.1f %.1fL%.1f %.1fL%.1f %.1fz" fill="#FFD678" fill-opacity=".9"/>' % (
            x, y - r, x + r * .22, y - r * .22, x + r, y, x + r * .22, y + r * .22, x, y + r, x - r * .22, y + r * .22, x - r, y, x - r * .22, y - r * .22))
    base.alpha_composite(nebula.resize(base.size, Image.LANCZOS))
    return nebula, prim


def frames_of(walls):
    """Gallery frames: two per wall, as parallelograms on the wall plane (js/village.js hangs real pieces in them)."""
    frames = []
    left, bottom, right = walls
    for (a, b), side in [((left, bottom), "left"), ((bottom, right), "right")]:
        for k in range(2):
            t0, t1 = .14 + k * .45, .14 + k * .45 + .34
            x0, x1 = a[0] + (b[0] - a[0]) * t0, a[0] + (b[0] - a[0]) * t1
            y0 = a[1] + (b[1] - a[1]) * t0 - 82
            frames.append(dict(wall=side, x=round(x0, 1), y=round(y0, 1), w=round(x1 - x0, 1), h=56,
                               slope=round((b[1] - a[1]) / (b[0] - a[0]), 4)))
    return frames


def lamp_post(d, x, y, h=40):
    """A small lantern on a post, plain palette shapes: ink pole, amber paper lantern with ribs and a cap."""
    d.line(P([(x, y), (x, y - h)]), fill=INK, width=3 * S)
    d.ellipse(P([(x - 3.5, y - 2), (x + 3.5, y + 2)]), fill=INK)
    d.line(P([(x, y - h), (x + 9, y - h), (x + 9, y - h + 5)]), fill=INK, width=2 * S)
    lx, ly = x + 9, y - h + 5
    d.ellipse(P([(lx - 7, ly), (lx + 7, ly + 17)]), fill=(255, 176, 60), outline=INK, width=S + 1)
    d.ellipse(P([(lx - 3, ly + 1), (lx + 3, ly + 16)]), outline=(214, 112, 40), width=S)
    d.rectangle(P([(lx - 3.5, ly - 2), (lx + 3.5, ly + 1)]), fill=INK)
    return lx, ly + 9


def quantize(im):
    return im.quantize(256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG)


def build():
    os.makedirs(OUT, exist_ok=True)
    new = lambda: Image.new("RGBA", (W * S, H * S))
    sky, mid, north, south = new(), new(), new(), new()
    g, stars = galaxy(sky)   # the galaxy cloud is the sky layer; its stars and constellations are a separate vector
    # north: the cool cosmic observatory, its cold halo is part of the sky layer
    radial(sky, 360, 215, 250, 140, (96, 150, 255), .6, S)
    island(north, 360, 205, 140, 70, 18, seed=2, tips=((-.3, .4), (.25, .5)), T=NORTH)
    # middle: Ekky's home, studio, doodle corner and the gallery
    island(mid, 360, 480, 310, 155, 26, seed=1, k=.9)
    # south: the warm studio island at sunset, its low sunset glow is part of the sky layer
    radial(sky, 430, 790, 340, 210, (255, 96, 150), .55, S)
    radial(sky, 470, 770, 170, 110, (255, 170, 100), .6, S)
    island(south, 400, 755, 150, 75, 18, seed=3, tips=((-.35, .45), (.05, .6), (.4, .38)), T=SOUTH)
    dn, dm, ds = ImageDraw.Draw(north), ImageDraw.Draw(mid), ImageDraw.Draw(south)
    bridge(dn, (360, 268), (360, 332), 5)
    bridge(ds, (384, 628), (396, 688), 5)
    # paths from Ekky's home to every place
    home = (372, 486)
    for to in [(205, 430), (520, 470), (226, 576), (360, 335), (384, 628)]:
        path(dm, [home, to])
    path(dn, [(360, 268), (360, 225)])
    path(ds, [(396, 688), (400, 742)])
    walls, shop_lights, bowl = ramen_shop(dm, 532, 452, 112, 56, 96)
    lamps = [lamp_post(ds, 282, 768), lamp_post(ds, 496, 774, 34)]   # the lantern posts' light is added below
    L = {}
    for name, im in (("sky", sky), ("mid", mid), ("north", north), ("south", south)):
        L[name] = im.resize((W * Z, H * Z), Image.LANCZOS)
    del sky, mid, north, south

    places = {}
    frames = frames_of(walls)
    # the frames' white mats, so the wall shows where the pictures hang even before they load
    m = Image.new("RGBA", L["mid"].size)
    md = ImageDraw.Draw(m)
    for f in frames:
        sx = f["slope"]
        x0, y0, x1 = f["x"] - 3, f["y"] - 3, f["x"] + f["w"] + 3
        md.polygon([(c * Z, e * Z) for c, e in [(x0, y0), (x1, y0 + (x1 - x0) * sx), (x1, y0 + (x1 - x0) * sx + f["h"] + 6), (x0, y0 + f["h"] + 6)]], fill=FRAME + (255,), outline=INK + (255,))
    L["mid"].alpha_composite(m)

    # main places: each Ekky cut-out stands on its spot (back to front, so nearer ones overlap farther ones)
    folk = {}   # still villagers and scenery (V3): tapping one opens its artwork card
    ufo = dict(name="ufo", foot=(214, 196), h=56)   # a hovering prop of the north island, kept off the baked layers
    places["observatory"] = paste(L["north"], "astronaut", (338, 222), 96)
    paste(L["north"], "radio-explorer", (404, 228), 70)
    paste(L["north"], "planet", (468, 204), 34, shadow=False)   # a small ringed planet at the island's edge
    places["gallery"] = [420, 300, 645, 510]
    for x, y in shop_lights:
        radial(L["mid"], x, y, 22, 22, (255, 120, 80), .35, Z)   # the shop's lanterns glow
    folk["fire-spirit"] = paste(L["mid"], "fire-spirit", (588, 468), 52)   # peeks out behind the Toybox (its cut edge is hidden)
    paste(L["mid"], "toybox", (604, 506), 62)
    folk["noodle-bath"] = paste(L["mid"], "noodle-bath", (112, 502), 74)
    places["studio"] = paste(L["mid"], "studio", (205, 440), 168)
    places["home"] = paste(L["mid"], "home", (372, 520), 200)
    places["doodle"] = paste(L["mid"], "ghost", (222, 594), 92)
    radial(L["south"], 400, 782, 120, 20, (255, 190, 90), .45, Z)   # a pool of lantern light on the ground in front of the gate
    places["hire"] = paste(L["south"], "gate", (400, 778), 172, cut=("bottom", "left", "right"))   # the gate's picture is cropped flat on three sides
    paste(L["south"], "signpost", (560, 764), 48)
    paste(L["south"], "pen-hand", (330, 790), 30, flip=True)
    gb = places["hire"]
    lx, ly = gb[0] + 105 * (gb[2] - gb[0]) / 255, gb[1] + 216 * (gb[3] - gb[1]) / 320
    radial(L["south"], lx, ly, 70, 70, (255, 190, 80), .6, Z)   # the gate's lantern glow
    for x, y in lamps:
        radial(L["south"], x, y, 38, 38, (255, 190, 80), .6, Z)
    # crop to the galaxy glow (plus a small margin), so the island fills the phone's width and no sky is wasted above it
    ox, oy, ex, ey = CROP
    crop = (ox * Z, oy * Z, ex * Z, ey * Z)
    Q = {}   # each layer gets its own 256-colour palette (with alpha): flat art and smooth sky both stay clean, at a fifth of the size
    for name in L:
        if name == "sky":   # the smooth cloud is never palette-quantized (that made visible bands); half size is plenty for a soft glow
            sk = L[name].crop(crop).resize(((ex - ox) // 2 + 1, (ey - oy) // 2 + 1), Image.LANCZOS)
            a = np.array(sk).astype(float)
            yy, xx = np.mgrid[0:sk.height, 0:sk.width]
            edge = np.minimum(np.minimum(xx, sk.width - 1 - xx), np.minimum(yy, sk.height - 1 - yy)) / 22.0   # fades to nothing before the frame's edge
            edge = np.clip(edge, 0, 1)
            a[..., 3] *= edge * edge * (3 - 2 * edge)
            Q[name] = Image.fromarray(a.astype(np.uint8))
            L[name] = Q[name].resize(((ex - ox) * Z, (ey - oy) * Z), Image.BILINEAR)
            continue
        Q[name] = quantize(L[name].crop(crop))
        L[name] = Q[name].convert("RGBA")
    img = L["sky"].copy()
    for name in ("mid", "north", "south"):
        img.alpha_composite(L[name])
    uimg = Image.new("RGBA", (W * Z, H * Z))
    ubox = paste(uimg, "ufo", ufo["foot"], ufo["h"], shadow=False, ink=False)
    img.alpha_composite(uimg.crop(crop))
    # galaxy glow layer: white wherever the nebula shows between the islands, for its slow 10 % pulse
    small = img.resize((ex - ox, ey - oy), Image.LANCZOS)
    a = np.array(small).astype(int)
    r, gg, b = a[..., 0], a[..., 1], a[..., 2]
    neb = (a[..., 3] > 20) & (b > gg + 25) & (r > gg)
    sh = Image.new("LA", small.size, (255, 0))
    sh.putalpha(Image.fromarray((neb * 140).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)))
    sh.save(os.path.join(OUT, "shimmer.png"), optimize=True)
    # the layers for the living village (same 601 x 827 space as village.json): the sky, and one cropped image per island.
    # x, y, w, h say where each cropped image sits; the UFO is not in any layer (assets/sprites/ufo.png floats over the north island)
    layers = {"sky": dict(src="assets/village/nebula.png", x=0, y=0, w=ex - ox, h=ey - oy),
              "stars": dict(src="assets/village/stars.svg", x=0, y=0, w=ex - ox, h=ey - oy)}
    Q["sky"].save(os.path.join(OUT, "nebula.png"), optimize=True)
    with open(os.path.join(OUT, "stars.svg"), "w") as f:   # stars and gold constellations: vector, so they stay sharp at any zoom
        f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d"><g transform="translate(%d %d)">%s</g></svg>\n' % (ex - ox, ey - oy, -ox, -oy, "".join(stars)))
    for name in ("north", "mid", "south"):
        x0, y0, x1, y1 = L[name].getchannel("A").point(lambda v: 255 if v else 0).getbbox()
        x0, y0, x1, y1 = x0 // Z - 6, y0 // Z - 6, -(-x1 // Z) + 6, -(-y1 // Z) + 6   # whole canvas units, with a clear margin so no shape ends in a straight line on the image border
        lay = Q[name].crop((x0 * Z, y0 * Z, x1 * Z, y1 * Z))
        a = np.array(lay)
        clear = int(a[0, 0]) if lay.convert("RGBA").getpixel((0, 0))[3] == 0 else int(np.argmin(np.array(lay.convert("RGBA")).reshape(-1, 4)[:, 3]))
        a[:6], a[-6:], a[:, :6], a[:, -6:] = clear, clear, clear, clear   # a clear border: faint edge strips drew a pale line on the map
        out_im = Image.fromarray(a, "P")
        out_im.putpalette(lay.getpalette(rawmode="RGBA"), rawmode="RGBA")
        out_im.save(os.path.join(OUT, "island-%s.png" % name), optimize=True)
        layers[name] = dict(src="assets/village/island-%s.png" % name, x=x0, y=y0, w=x1 - x0, h=y1 - y0)
    img = small
    folk["ufo"] = ubox

    # label anchors (bottom center of each place) and the buttons' hit boxes, in image pixels
    for f in frames:
        f["x"], f["y"] = round(f["x"] - ox, 1), round(f["y"] - oy, 1)
    out = dict(w=img.width, h=img.height, layers=layers, frames=frames, places={}, folk={}, walkers=[], scenery=[])
    sprites = json.load(open(os.path.join(ROOT, "assets", "sprites", "index.json")))
    for k, b in folk.items():
        out["folk"][k] = dict(piece=sprites[k]["piece"], box=[b[0] - ox, b[1] - oy, b[2] - ox, b[3] - oy])
    for name, piece, (fx, fy), h in CLIENT_SCENERY:
        sp = sprites[name]
        w = round(sp["w"] * h / sp["h"])
        out["scenery"].append(dict(name=name, piece=piece, src=sp["file"], box=[fx - w / 2 - ox, fy - h - oy, fx + w / 2 - ox, fy - oy]))
    # the gate's lantern (in the Hidden Monster cut-out at 105, 216 of 255 x 320), for its 6 s pulse
    out["lantern"] = [round(lx - ox, 1), round(ly - oy, 1)]
    out["ufo"] = dict(src="assets/sprites/ufo.png", box=[ubox[0] - ox, ubox[1] - oy, ubox[2] - ox, ubox[3] - oy], layer="north")
    nb = folk["noodle-bath"]
    out["smoke"] = [[round((nb[0] + nb[2]) / 2 - ox, 1), round(nb[1] + 18 - oy, 1)], [round(bowl[0] - ox, 1), round(bowl[1] - oy, 1)]]   # the noodle bath, the ramen bowl
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
    print("wrote assets/village layers:", ", ".join("%s %d KB" % (n, os.path.getsize(os.path.join(ROOT, l["src"])) // 1024) for n, l in layers.items()))


if __name__ == "__main__":
    build()
