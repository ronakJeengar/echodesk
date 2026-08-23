import os
import zlib
import struct
import math

def make_png(width, height, pixel_func):
    """
    Generate a PNG in pure Python with RGBA pixels.
    pixel_func: (x, y) -> (r, g, b, a) with 0-255 values
    """
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = pixel_func(x, y, width, height)
            raw_data.extend([int(r), int(g), int(b), int(a)])

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    compressed = zlib.compress(bytes(raw_data), 9)

    png_bytes = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", compressed)
        + chunk(b"IEND", b"")
    )
    return png_bytes

def echodesk_logo_pixel(x, y, w, h):
    # Normalized coordinates [-1, 1]
    nx = (x / (w - 1)) * 2 - 1
    ny = (y / (h - 1)) * 2 - 1
    
    # Background rounded rect box
    # Rounded rect parameters
    box_size = 0.88
    radius = 0.28
    
    # Distance to rounded rectangle
    dx = max(0.0, abs(nx) - (box_size - radius))
    dy = max(0.0, abs(ny) - (box_size - radius))
    dist = math.sqrt(dx * dx + dy * dy) - radius
    
    # Base dark background: #0B101B
    bg_r, bg_g, bg_b = 11, 16, 27
    
    # Outside the rounded square?
    if dist > 0.04:
        return (0, 0, 0, 0)
    
    # Antialiasing on outer edge
    edge_alpha = 1.0
    if dist > 0.0:
        edge_alpha = max(0.0, 1.0 - (dist / 0.04))
    
    # Gradient on box: dark navy #0F1B2B to #090E17
    grad = (ny + 1.0) / 2.0
    r = int(15 * (1 - grad) + 9 * grad)
    g = int(27 * (1 - grad) + 14 * grad)
    b = int(43 * (1 - grad) + 23 * grad)
    
    # Cyan border check (around border of rounded rect)
    if -0.05 <= dist <= 0.0:
        border_intensity = (dist + 0.05) / 0.05
        # Cyan color: #06B6D4 (6, 182, 212)
        r = int(r * (1 - border_intensity * 0.8) + 6 * border_intensity * 0.8)
        g = int(g * (1 - border_intensity * 0.8) + 182 * border_intensity * 0.8)
        b = int(b * (1 - border_intensity * 0.8) + 212 * border_intensity * 0.8)

    # Audio Waveform Equalizer / Graphic EQ bars in the center
    # 5 vertical rounded bars representing voice audio intelligence
    bars = [
        (-0.40, 0.28),   # bar 1: x_center = -0.40, height = 0.28
        (-0.20, 0.48),   # bar 2: x_center = -0.20, height = 0.48
        ( 0.00, 0.65),   # bar 3: x_center =  0.00, height = 0.65 (center)
        ( 0.20, 0.48),   # bar 4: x_center =  0.20, height = 0.48
        ( 0.40, 0.28),   # bar 5: x_center =  0.40, height = 0.28
    ]
    bar_width = 0.065
    
    in_bar = 0.0
    for bx, bh in bars:
        bdx = max(0.0, abs(nx - bx) - bar_width / 2)
        bdy = max(0.0, abs(ny) - bh / 2)
        bdist = math.sqrt(bdx * bdx + bdy * bdy)
        if bdist < 0.035:
            bar_coverage = max(0.0, min(1.0, 1.0 - (bdist - 0.015) / 0.02)) if bdist > 0.015 else 1.0
            in_bar = max(in_bar, bar_coverage)
    
    if in_bar > 0.0:
        # Vibrant Cyan / Emerald gradient: #06B6D4 (6, 182, 212) to #10B981 (16, 185, 129)
        bar_t = (nx + 0.4) / 0.8
        cr = int(6 * (1 - bar_t) + 16 * bar_t)
        cg = int(182 * (1 - bar_t) + 185 * bar_t)
        cb = int(212 * (1 - bar_t) + 129 * bar_t)
        
        r = int(r * (1 - in_bar) + cr * in_bar)
        g = int(g * (1 - in_bar) + cg * in_bar)
        b = int(b * (1 - in_bar) + cb * in_bar)
    
    return (r, g, b, int(255 * edge_alpha))

def main():
    res_dir = "/Users/ronakjeengar/Desktop/echodesk/mobile/android/app/src/main/res"
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    for folder, size in sizes.items():
        target_folder = os.path.join(res_dir, folder)
        os.makedirs(target_folder, exist_ok=True)
        png_data = make_png(size, size, echodesk_logo_pixel)
        filepath = os.path.join(target_folder, "ic_launcher.png")
        with open(filepath, "wb") as f:
            f.write(png_data)
        print(f"Generated {filepath} ({size}x{size})")
        
        # Also generate foreground for adaptive icons
        fg_filepath = os.path.join(target_folder, "ic_launcher_foreground.png")
        with open(fg_filepath, "wb") as f:
            f.write(png_data)

    # Generate high-res 512x512 splash logo
    drawable_dir = os.path.join(res_dir, "drawable")
    os.makedirs(drawable_dir, exist_ok=True)
    splash_png = make_png(256, 256, echodesk_logo_pixel)
    with open(os.path.join(drawable_dir, "ic_splash_logo.png"), "wb") as f:
        f.write(splash_png)
    print("Generated drawable/ic_splash_logo.png (256x256)")

    # Also save to flutter assets
    assets_dir = "/Users/ronakjeengar/Desktop/echodesk/mobile/assets"
    os.makedirs(assets_dir, exist_ok=True)
    app_icon_512 = make_png(512, 512, echodesk_logo_pixel)
    with open(os.path.join(assets_dir, "app_logo.png"), "wb") as f:
        f.write(app_icon_512)
    print("Generated assets/app_logo.png (512x512)")

if __name__ == "__main__":
    main()
