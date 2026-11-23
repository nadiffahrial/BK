"""
Generate SILOKA app icon files:
- logo-siloka-512.png (512x512)
- logo-siloka-192.png (192x192)
- favicon.ico (16, 32, 48, 64 px)

Design: green pentagon shield, gold border, stylized "S" letter with map-pin accent
"""

from PIL import Image, ImageDraw, ImageFont
import math
import struct
import io
import os

OUTPUT_DIR = r"d:\CODING\BK\frontend\public"

def make_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    s = size
    cx, cy = s // 2, s // 2

    # --- Pentagon shield points ---
    # 5-sided, slightly flattened at top, wider at sides
    # Angles: top=90deg going clockwise, shifted so flat top
    # Points (clockwise from top-left): top-left, top-right, right, bottom, left
    r_outer = s * 0.46   # outer radius
    r_inner = s * 0.38   # inner gold ring

    angles_deg = [126, 54, -18, -90, -162]  # pentagon rotated (flat top)
    pts_outer = []
    for a in angles_deg:
        rad = math.radians(a)
        x = cx + r_outer * math.cos(rad)
        y = cy - r_outer * math.sin(rad)
        pts_outer.append((x, y))

    # Dark outline / shadow
    shadow_pts = []
    for a in angles_deg:
        rad = math.radians(a)
        x = cx + (r_outer + s*0.025) * math.cos(rad)
        y = cy - (r_outer + s*0.025) * math.sin(rad)
        shadow_pts.append((x, y))
    draw.polygon(shadow_pts, fill=(10, 30, 10, 220))

    # Main green pentagon
    dark_green = (15, 68, 35)      # #0F4423
    draw.polygon(pts_outer, fill=dark_green)

    # Gold border ring
    gold = (220, 170, 30)
    pts_gold = []
    for a in angles_deg:
        rad = math.radians(a)
        x = cx + r_inner * math.cos(rad)
        y = cy - r_inner * math.sin(rad)
        pts_gold.append((x, y))
    draw.polygon(pts_gold, fill=gold)

    # Inner lighter green fill
    mid_green = (21, 128, 61)   # #15803d
    r_fill = r_inner * 0.84
    pts_fill = []
    for a in angles_deg:
        rad = math.radians(a)
        x = cx + r_fill * math.cos(rad)
        y = cy - r_fill * math.sin(rad)
        pts_fill.append((x, y))
    draw.polygon(pts_fill, fill=mid_green)

    # --- Stylized "S" letter ---
    # Draw a bold white "S" centered slightly up
    font_size = int(s * 0.38)
    # Try to load a font; fall back to default
    font = None
    font_paths = [
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf",
        r"C:\Windows\Fonts\verdanab.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except:
                pass

    text = "S"
    if font:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
    else:
        tw, th = font_size * 0.6, font_size

    tx = cx - tw // 2
    ty = cy - th // 2 - s * 0.03

    # White glow / shadow of S
    for dx, dy in [(-2, -2), (2, -2), (-2, 2), (2, 2), (0, 3)]:
        draw.text((tx + dx, ty + dy), text, fill=(255, 255, 255, 80), font=font)

    # Gold S
    draw.text((tx, ty), text, fill=(255, 215, 0), font=font)

    # --- Map-pin dot accent below S ---
    pin_r = s * 0.045
    pin_cx = cx
    pin_cy = cy + s * 0.19
    pin_color = (255, 215, 0)
    draw.ellipse(
        (pin_cx - pin_r, pin_cy - pin_r, pin_cx + pin_r, pin_cy + pin_r),
        fill=pin_color
    )
    # small cross lines for map-pin cross
    lw = max(1, int(s * 0.012))
    draw.line((pin_cx - pin_r*1.8, pin_cy, pin_cx + pin_r*1.8, pin_cy),
              fill=(255, 215, 0), width=lw)
    draw.line((pin_cx, pin_cy - pin_r*1.8, pin_cx, pin_cy + pin_r*1.8),
              fill=(255, 215, 0), width=lw)

    # --- "SILOKA" text banner below (only for larger sizes) ---
    if size >= 128:
        banner_h = int(s * 0.14)
        banner_y = int(s * 0.84)
        # Rounded rect banner
        banner_x0 = int(s * 0.14)
        banner_x1 = int(s * 0.86)
        draw.rounded_rectangle(
            [banner_x0, banner_y, banner_x1, banner_y + banner_h],
            radius=banner_h // 3,
            fill=(10, 50, 20, 200)
        )
        # Banner text
        bfont_size = int(s * 0.09)
        bfont = None
        for fp in font_paths:
            if os.path.exists(fp):
                try:
                    bfont = ImageFont.truetype(fp, bfont_size)
                    break
                except:
                    pass
        btxt = "SILOKA"
        if bfont:
            bbbox = draw.textbbox((0, 0), btxt, font=bfont)
            btw = bbbox[2] - bbbox[0]
            bth = bbbox[3] - bbbox[1]
        else:
            btw, bth = bfont_size * len(btxt) * 0.6, bfont_size
        btx = cx - btw // 2
        bty = banner_y + (banner_h - bth) // 2
        draw.text((btx, bty), btxt, fill=(255, 215, 0), font=bfont)

    return img


def save_ico(images_dict, output_path):
    """Save ICO file with multiple sizes. images_dict: {size: PIL.Image}"""
    # ICO format: header + directory + image data
    sizes = sorted(images_dict.keys())
    num = len(sizes)

    # Build BITMAPINFOHEADER for each image (32-bit ARGB)
    bitmaps = []
    for sz in sizes:
        img = images_dict[sz].convert("RGBA")
        # ICO stores images as PNG for sizes >= 256, or BMP
        # Use PNG format for all (modern ICO)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        bitmaps.append(buf.getvalue())

    # Header: ICONDIR
    header = struct.pack("<HHH", 0, 1, num)  # reserved=0, type=1 (ICO), count

    # Directory entries (16 bytes each)
    offset = 6 + num * 16
    dir_entries = b""
    for i, sz in enumerate(sizes):
        data = bitmaps[i]
        w = sz if sz < 256 else 0
        h = sz if sz < 256 else 0
        dir_entries += struct.pack(
            "<BBBBHHII",
            w, h,          # width, height (0 = 256)
            0,              # color count (0 = >8bpp)
            0,              # reserved
            1,              # color planes
            32,             # bits per pixel
            len(data),      # size of image data
            offset          # offset of image data
        )
        offset += len(data)

    with open(output_path, "wb") as f:
        f.write(header)
        f.write(dir_entries)
        for data in bitmaps:
            f.write(data)

    print(f"Saved ICO: {output_path} ({os.path.getsize(output_path)} bytes)")


# Generate icons
print("Generating SILOKA icons...")

ico_sizes = [16, 32, 48, 64]
ico_images = {}
for sz in ico_sizes:
    ico_images[sz] = make_icon(sz)
    print(f"  Generated {sz}x{sz}")

# Save ICO
save_ico(ico_images, os.path.join(OUTPUT_DIR, "favicon.ico"))

# Save PNG 512
img512 = make_icon(512)
img512.save(os.path.join(OUTPUT_DIR, "logo-siloka-512.png"), "PNG")
print(f"Saved: {OUTPUT_DIR}\\logo-siloka-512.png")

# Save PNG 192
img192 = make_icon(192)
img192.save(os.path.join(OUTPUT_DIR, "logo-siloka-192.png"), "PNG")
print(f"Saved: {OUTPUT_DIR}\\logo-siloka-192.png")

# Save PNG 32 (for apple-touch-icon fallback)
img32 = make_icon(32)
img32.save(os.path.join(OUTPUT_DIR, "favicon-32x32.png"), "PNG")
print(f"Saved: {OUTPUT_DIR}\\favicon-32x32.png")

print("Done!")
