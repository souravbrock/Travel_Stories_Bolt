"""Render branded launcher icons (compass mark) into android/ mipmaps."""
import math
import pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent
RES = ROOT / "android" / "app" / "src" / "main" / "res"

TOP = (34, 209, 238)
BOT = (8, 137, 166)
WHITE = (255, 255, 255, 255)
ORANGE = (251, 146, 60, 255)
DARK = (8, 137, 166, 255)

DENSITIES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}


def vgrad(size):
    top = Image.new("RGBA", (size, size), TOP + (255,))
    bot = Image.new("RGBA", (size, size), BOT + (255,))
    mask = Image.new("L", (size, size))
    mp = mask.load()
    for y in range(size):
        v = int(255 * y / (size - 1))
        for x in range(size):
            mp[x, y] = v
    return Image.composite(bot, top, mask)


def star(cx, cy, r_out, r_in, points=4, rot=-90.0, fill=WHITE):
    pts = []
    for i in range(points * 2):
        r = r_out if i % 2 == 0 else r_in
        a = math.radians(rot + i * 180.0 / points)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def draw_mark(d, cx, cy, R):
    cx, cy, R = int(cx), int(cy), int(R)
    # outer ring
    d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=WHITE, width=max(2, R // 12))
    # 4-point star (N/E/S/W), white
    d.polygon(star(cx, cy, R * 0.92, R * 0.20), fill=WHITE)
    # orange north tip overlay
    d.polygon([(cx, cy - R * 0.92), (cx + R * 0.20, cy), (cx - R * 0.20, cy)], fill=ORANGE)
    # center dot
    r = R * 0.16
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=DARK, outline=WHITE, width=max(1, R // 28))


def rounded_tile(size, radius):
    base = vgrad(size)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    base.putalpha(mask)
    return base


def circle_tile(size):
    base = vgrad(size)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    base.putalpha(mask)
    return base


for name, size in DENSITIES.items():
    sq = rounded_tile(size, size // 5)
    d = ImageDraw.Draw(sq)
    draw_mark(d, size / 2, size / 2, size * 0.30)
    out = RES / f"mipmap-{name}"
    out.mkdir(parents=True, exist_ok=True)
    sq.save(out / "ic_launcher.png")

    ci = circle_tile(size)
    d = ImageDraw.Draw(ci)
    draw_mark(d, size / 2, size / 2, size * 0.30)
    ci.save(out / "ic_launcher_round.png")

    # adaptive-icon foreground: centered mark on transparency (safe zone)
    fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(fg)
    draw_mark(d, size / 2, size / 2, size * 0.33)
    fg.save(out / "ic_launcher_foreground.png")
    print(name, size)
print("icons written")
