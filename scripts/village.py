"""Ekky's Village, first frame (B42 V1): one pre-composited image plus the positions of every place and gallery frame.

Usage: python3 scripts/village.py     writes assets/village/village.png, village.json and village.js
The ground, sea, paths, plank bridges and the gallery block are plain shapes in Ekky's palette (plan asset rule 4);
every character, building and prop is one of his cut-outs from assets/sprites/ (scripts/sprites.py), placed as is.
The four gallery frames are left empty: js/village.js hangs featuredPick(4) real pieces in them on every visit.
Coordinates are image pixels (720 x 880, shown at about half size on a phone); y grows downwards.
"""
import json
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "village")
W, H = 720, 880
S = 4  # supersampling for the shapes

INK = (43, 19, 66)
GRASS, GRASS_L, GRASS_R = (168, 219, 160), (111, 179, 122), (78, 142, 92)
SAND = (255, 227, 168)
PATH, PATH_EDGE = (255, 243, 220), (233, 214, 178)
SEA, SEA_LIGHT = (104, 160, 219), (128, 180, 230)
PLANK, PLANK_EDGE = (201, 138, 74), (122, 74, 34)
WALL_L, WALL_R, ROOF = (255, 243, 220), (240, 222, 190), (255, 180, 0)
FRAME = (255, 255, 255)


def P(pts):
    return [(x * S, y * S) for x, y in pts]


def diamond(cx, cy, hw, hh):
    return [(cx, cy - hh), (cx + hw, cy), (cx, cy + hh), (cx - hw, cy)]


def island(d, cx, cy, hw, hh, depth):
    """An isometric island: grass top, earth sides, a sand rim."""
    top = diamond(cx, cy, hw, hh)
    d.polygon(P([top[3], top[2], (top[2][0], top[2][1] + depth), (top[3][0], top[3][1] + depth)]), fill=GRASS_L)
    d.polygon(P([top[2], top[1], (top[1][0], top[1][1] + depth), (top[2][0], top[2][1] + depth)]), fill=GRASS_R)
    d.polygon(P(diamond(cx, cy, hw + 6, hh + 3)), fill=SAND)
    d.polygon(P(top), fill=GRASS)
    d.line(P([top[3], top[2], top[1]]), fill=INK, width=3 * S, joint="curve")


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


def paste(img, name, foot, h, flip=False):
    """Stand a cut-out with its bottom center on `foot`, scaled to height h. Returns its box."""
    sp = Image.open(os.path.join(ROOT, "assets", "sprites" if os.path.exists(os.path.join(ROOT, "assets", "sprites", name + ".png")) else "ui", name + ".png")).convert("RGBA")
    w = round(sp.width * h / sp.height)
    sp = sp.resize((w, h), Image.LANCZOS)
    if flip:
        sp = sp.transpose(Image.FLIP_LEFT_RIGHT)
    x, y = round(foot[0] - w / 2), round(foot[1] - h)
    shadow = Image.new("RGBA", img.size)
    ImageDraw.Draw(shadow).ellipse((foot[0] - w * .38, foot[1] - 7, foot[0] + w * .38, foot[1] + 7), fill=INK + (60,))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(3)))
    img.alpha_composite(sp, (x, y))
    return [x, y, x + w, y + h]


def build():
    os.makedirs(OUT, exist_ok=True)
    base = Image.new("RGBA", (W * S, H * S))
    d = ImageDraw.Draw(base)
    # the calm sea: one soft diamond, with a lighter band
    d.polygon(P(diamond(360, 500, 352, 330)), fill=SEA)
    d.polygon(P(diamond(360, 500, 300, 250)), fill=SEA_LIGHT)
    # islands: main, the observatory islet (top) and the gate islet (bottom)
    island(d, 360, 205, 140, 70, 18)
    island(d, 360, 480, 310, 155, 26)
    island(d, 400, 755, 150, 75, 18)
    bridge(d, (360, 268), (360, 332), 5)
    bridge(d, (384, 628), (396, 688), 5)
    # paths from Ekky's home to every place
    home = (360, 486)
    for to in [(205, 450), (520, 470), (240, 572), (360, 335), (384, 628)]:
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
    places["observatory"] = paste(img, "astronaut", (338, 222), 96)
    paste(img, "radio-explorer", (404, 228), 70)
    places["gallery"] = [420, 300, 645, 510]
    paste(img, "palette", (532, 362), 44)
    paste(img, "toybox", (604, 506), 62)
    places["studio"] = paste(img, "studio", (205, 470), 168)
    places["home"] = paste(img, "home", (360, 520), 200)
    places["doodle"] = paste(img, "ghost", (240, 590), 92)
    places["hire"] = paste(img, "gate", (400, 778), 172)
    # crop to the drawing (plus a small margin), so the island fills the phone's width and no sky is wasted above it
    bb = img.getchannel("A").getbbox()
    ox, oy = max(0, bb[0] - 4), max(0, bb[1] - 4)
    img = img.crop((ox, oy, min(W, bb[2] + 4), min(H, bb[3] + 4)))
    img.save(os.path.join(OUT, "village.png"), optimize=True)

    # label anchors (bottom center of each place) and the buttons' hit boxes, in image pixels
    for f in frames:
        f["x"], f["y"] = round(f["x"] - ox, 1), round(f["y"] - oy, 1)
    out = dict(w=img.width, h=img.height, frames=frames, places={})
    # label signs sit where they cover no other place: above the studio, below the others
    labels = {"observatory": (372, 250), "gallery": (532, 528), "studio": (190, 262), "home": (360, 526), "doodle": (240, 598), "hire": (400, 800)}
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
