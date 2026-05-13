"""
Sanity-check board annotations.

For each board JSON in src/boards/:
  • Draw a numbered dot at every square coordinate
  • Draw coloured arrow lines for every transition
    – red  = snake (goes DOWN)
    – green = ladder (goes UP)

Output: sanitycheck_labelledboards/<board_id>.png
"""

import json
import math
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT    = os.path.join(ROOT, "sanitycheck_labelledboards")
BOARDS = sorted(glob.glob(os.path.join(ROOT, "src", "boards", "data_*.json")))

os.makedirs(OUT, exist_ok=True)

# ── Colour palette ─────────────────────────────────────────────────────────────
COL_DOT_FILL   = (255, 255, 255, 200)   # white dot fill (semi-transparent)
COL_DOT_BORDER = (30,  30,  30,  230)   # dark border around dot
COL_TEXT       = (10,  10,  10,  255)   # label text
COL_SNAKE      = (220, 40,  40,  230)   # red  – snake
COL_LADDER     = (30,  160, 60,  230)   # green – ladder
COL_ARROW_TIP  = (255, 255, 255, 220)   # white arrowhead outline for contrast


def load_font(size: int):
    """Try system fonts, fall back to Pillow default."""
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def scale_factor(image_width: int) -> float:
    """Return a scale multiplier relative to a 700-px-wide reference image."""
    return image_width / 700.0


def draw_arrow(draw: ImageDraw.ImageDraw,
               x0: float, y0: float,
               x1: float, y1: float,
               colour, line_w: int, arrow_len: float):
    """Draw a line with an arrowhead at (x1, y1)."""
    draw.line([(x0, y0), (x1, y1)], fill=colour, width=line_w)

    # Arrowhead
    angle = math.atan2(y1 - y0, x1 - x0)
    spread = math.radians(28)
    tip1 = (
        x1 - arrow_len * math.cos(angle - spread),
        y1 - arrow_len * math.sin(angle - spread),
    )
    tip2 = (
        x1 - arrow_len * math.cos(angle + spread),
        y1 - arrow_len * math.sin(angle + spread),
    )
    # White outline for visibility
    draw.polygon([tip1, (x1, y1), tip2], fill=COL_ARROW_TIP)
    draw.polygon([tip1, (x1, y1), tip2], outline=colour)


def process_board(json_path: str):
    data = json.load(open(json_path))
    board_id  = data["id"]
    img_url   = data["imageUrl"].lstrip("/")
    squares   = {s["id"]: (s["x"], s["y"]) for s in data["squares"]}
    transitions = data.get("transitions", [])

    # Resolve image path (look in public/ first, then boards/)
    candidates = [
        os.path.join(ROOT, "public", img_url),
        os.path.join(ROOT, img_url),
    ]
    img_path = next((p for p in candidates if os.path.exists(p)), None)
    if img_path is None:
        print(f"  ✗ image not found for {board_id}: {img_url}")
        return

    img = Image.open(img_path).convert("RGBA")
    W, H = img.size
    sf   = scale_factor(W)

    # Layer for arrows + dots (drawn on transparent overlay then composited)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw    = ImageDraw.Draw(overlay, "RGBA")

    dot_r    = max(6,  int(10 * sf))
    line_w   = max(2,  int(3  * sf))
    arr_len  = max(10, int(20 * sf))
    font_sz  = max(8,  int(11 * sf))
    font     = load_font(font_sz)

    # ── Draw transitions first (under the dots) ──────────────────────────────
    for t in transitions:
        f_id, to_id = t["from"], t["to"]
        if f_id not in squares or to_id not in squares:
            print(f"  ✗ missing square id {f_id} or {to_id} in {board_id}")
            continue
        fx, fy = squares[f_id]
        tx, ty = squares[to_id]
        colour  = COL_SNAKE if t["type"] == "snake" else COL_LADDER
        draw_arrow(draw, fx, fy, tx, ty, colour, line_w, arr_len)

        # Small mid-point label (S / L)
        mx, my = (fx + tx) / 2, (fy + ty) / 2
        label  = "S" if t["type"] == "snake" else "L"
        bbox   = font.getbbox(label)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pad    = max(2, int(3 * sf))
        draw.rectangle(
            [mx - tw/2 - pad, my - th/2 - pad, mx + tw/2 + pad, my + th/2 + pad],
            fill=(255, 255, 255, 200),
        )
        draw.text((mx - tw/2, my - th/2), label, fill=colour, font=font)

    # ── Draw square dots + numbers ────────────────────────────────────────────
    for sq_id, (x, y) in squares.items():
        # Dot
        draw.ellipse(
            [x - dot_r, y - dot_r, x + dot_r, y + dot_r],
            fill=COL_DOT_FILL,
            outline=COL_DOT_BORDER,
            width=max(1, int(1.5 * sf)),
        )
        # Number label
        label = str(sq_id)
        bbox  = font.getbbox(label)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(
            (x - tw / 2, y - th / 2),
            label,
            fill=COL_TEXT,
            font=font,
        )

    # Composite and convert to RGB for saving
    result = Image.alpha_composite(img, overlay).convert("RGB")

    out_path = os.path.join(OUT, f"{board_id}.png")
    result.save(out_path, "PNG", optimize=False)
    print(f"  ✓ {board_id}  ({W}×{H})  → {os.path.relpath(out_path, ROOT)}")


def main():
    print(f"Processing {len(BOARDS)} boards …\n")
    for jf in BOARDS:
        print(f"• {os.path.basename(jf)}")
        process_board(jf)
    print(f"\nDone. Open sanitycheck_labelledboards/ to review.")


if __name__ == "__main__":
    main()
