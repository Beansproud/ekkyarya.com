# python3 scripts/playtest/star-sim.py [site dir] [rounds]
# Simulates Star Catcher with the BALANCE numbers read from js/game.js, for three players on a 390 x 664 screen:
# idle (never touches), casual (reacts every 0.45 s, ~38 px off, finger 700 px/s) and skilled (0.22 s, 14 px off,
# 1400 px/s, dodges viruses, prefers glowing stars). Prints mean and 10th-90th percentile scores per model.
import json, random, re, statistics, sys, os
site = sys.argv[1] if len(sys.argv) > 1 else "."
n = int(sys.argv[2]) if len(sys.argv) > 2 else 300
src = open(os.path.join(site, "js", "game.js"), encoding="utf8").read()
m = re.search(r"const BALANCE=(\{.*?\}\});", src, re.S) or re.search(r"const BALANCE=(\{.*?\});", src, re.S)
js = re.sub(r"([{,]\s*)([A-Za-z]\w*)\s*:", r'\1"\2":', m.group(1))   # quote the keys
B = json.loads(re.sub(r"(?<![\d])\.(\d)", r"0.\1", js))                          # .75 -> 0.75
def run(model, seed, W=390, H=664):
    R = random.Random(seed); dt = 1 / 60; t = B["seconds"]; spawn = 0; items = []; score = 0; px = tx = W / 2; react = 0; target = None; py = H - 120
    while t > 0:
        prog = min(1, 1 - t / B["seconds"]); t -= dt; spawn -= dt; L = lambda r: r[0] + (r[1] - r[0]) * prog
        if spawn <= 0:
            spawn = L(B["spawn"])
            if R.random() < L(B["hazardShare"]): k = -B["hazardCost"]
            else:
                r = R.random(); k = 5 if r < B["mix"]["glow"] else 3 if r < B["mix"]["glow"] + B["mix"]["palette"] else 1
            items.append([24 + R.random() * (W - 48), -30, L(B["speed"]) + R.random() * B["speedRandom"], k, False])
        if model != "idle":
            react -= dt
            if react <= 0:
                react = model["react"]; goods = [i for i in items if i[3] > 0 and i[1] < py and (py - i[1]) / i[2] < model["look"]]
                if goods:
                    g = min(goods, key=lambda i: (py - i[1]) / i[2] + abs(i[0] - px) / model["speed"] * .7 - (.15 * i[3] if model.get("greedy") else 0))
                    target = g[0] + R.gauss(0, model["noise"])
                if model.get("dodge"):
                    for h in items:
                        if h[3] < 0 and 0 < (py - h[1]) / h[2] < .5 and abs(h[0] - (target or px)) < 40: target = (target or px) + (70 if R.random() < .5 else -70)
            if target is not None: step = model["speed"] * dt; tx += max(-step, min(step, target - tx))
            tx = max(40, min(W - 40, tx))
        px += (tx - px) * min(1, dt * 14)
        for i in items:
            i[1] += i[2] * dt; box = B["catchHazard"] if i[3] < 0 else B["catchStar"]
            if not i[4] and abs(i[0] - px) < box and abs(i[1] - (py - 10)) < box: i[4] = True; score = max(0, score + i[3])
        items = [i for i in items if not i[4] and i[1] < H + 40]
    return score
MODELS = {"idle": "idle", "casual": {"react": .45, "noise": 38, "speed": 700, "look": 1.6},
          "skilled": {"react": .22, "noise": 14, "speed": 1400, "look": 2.2, "dodge": True, "greedy": True}}
print("BALANCE", json.dumps(B))
for name, mdl in MODELS.items():
    s = sorted(run(mdl, k) for k in range(n)); print(f"{name:8} mean {statistics.mean(s):5.1f}  p10 {s[n // 10]:3}  p90 {s[9 * n // 10]:3}")
