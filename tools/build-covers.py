"""Generate optimized WebP covers for every game listed in js/games-data.js.

Usage (from the repo root, needs Pillow):  python tools/build-covers.py

For each game it reads `id` and `image` (the original artwork) and writes
assets/img/covers/<id>-640.webp, <id>-1280.webp and <id>-og.jpg (social preview).
The site (js/games.js) serves them through srcset. Covers that are already
newer than their source image are skipped.
"""

import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "js" / "games-data.js"
OUT_DIR = ROOT / "assets" / "img" / "covers"
WIDTHS = (640, 1280)
QUALITY = 82
OG_SIZE = (1200, 630)


def read_games():
    text = DATA_FILE.read_text(encoding="utf-8")
    games = re.findall(r'id:\s*"([^"]+)".*?image:\s*"([^"]+)"', text, flags=re.S)
    if not games:
        sys.exit(f"No games found in {DATA_FILE}")
    return games


def has_transparency(img):
    return img.mode == "RGBA" and img.getchannel("A").getextrema()[0] < 255


def build(game_id, source_path):
    source = ROOT / source_path
    if not source.exists():
        print(f"  ! {game_id}: source not found: {source_path}")
        return

    with Image.open(source) as original:
        img = original.convert("RGBA")
        if not has_transparency(img):
            img = img.convert("RGB")

        for width in WIDTHS:
            target = OUT_DIR / f"{game_id}-{width}.webp"
            if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
                print(f"  = {target.name} is up to date")
                continue
            height = round(img.height * width / img.width)
            img.resize((width, height), Image.LANCZOS).save(target, "WEBP", quality=QUALITY, method=6)
            print(f"  + {target.name}  {width}x{height}  {target.stat().st_size // 1024} KB")

        # Social preview (og:image) used by pages/<Game>.html: 1200x630 JPEG, the size Facebook/Telegram/X expect.
        target = OUT_DIR / f"{game_id}-og.jpg"
        if not (target.exists() and target.stat().st_mtime >= source.stat().st_mtime):
            ImageOps.fit(img.convert("RGB"), OG_SIZE, Image.LANCZOS).save(target, "JPEG", quality=85, optimize=True)
            print(f"  + {target.name}  {target.stat().st_size // 1024} KB")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for game_id, image in read_games():
        print(f"{game_id}  ({(ROOT / image).stat().st_size // 1024 if (ROOT / image).exists() else '?'} KB source)")
        build(game_id, image)


if __name__ == "__main__":
    main()
