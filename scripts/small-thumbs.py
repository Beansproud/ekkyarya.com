"""S5 speed: phone thumbnails. Writes assets/work/s/<name>.jpg, at most 400 px on the long side, from each
assets/work/thumb/<name>.jpg (the 720 px set). thumbOf() in js/site.js serves these on screens up to 760 px wide.
Usage: python3 scripts/small-thumbs.py (re-run after adding a piece)."""
import glob, os
from PIL import Image
os.makedirs("assets/work/s", exist_ok=True)
for f in sorted(glob.glob("assets/work/thumb/*.jpg")):
    im = Image.open(f).convert("RGB")
    im.thumbnail((400, 400), Image.LANCZOS)
    im.save(os.path.join("assets/work/s", os.path.basename(f)), "JPEG", quality=72, optimize=True, progressive=True)
