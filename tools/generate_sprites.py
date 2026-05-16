#!/usr/bin/env python3
import json
import os
import struct
import zlib

CELL_W = 32
CELL_H = 48
FRAMES = 4
DIRECTIONS = ["down", "left", "right", "up"]

SPRITES = [
    {"id": "ml_engineer", "skin": (240, 200, 160), "hair": (42, 26, 20), "shirt": (154, 163, 154), "pants": (42, 38, 48), "accent": (194, 32, 42), "hair_style": "messy"},
    {"id": "dana_devops", "skin": (232, 200, 168), "hair": (58, 36, 24), "shirt": (98, 197, 255), "pants": (26, 32, 48), "accent": (255, 179, 71), "hair_style": "long"},
    {"id": "serik_lead", "skin": (216, 176, 138), "hair": (26, 16, 16), "shirt": (168, 255, 101), "pants": (31, 31, 36), "accent": (232, 226, 212), "hair_style": "buzz", "glasses": True},
    {"id": "aigerim_hr", "skin": (232, 200, 168), "hair": (58, 42, 26), "shirt": (168, 146, 194), "pants": (26, 26, 38), "accent": (255, 255, 255), "hair_style": "bun"},
    {"id": "sysadmin", "skin": (216, 176, 138), "hair": (15, 16, 20), "shirt": (38, 56, 76), "pants": (16, 20, 28), "accent": (98, 197, 255), "hair_style": "headphones"},
    {"id": "night_guard", "skin": (208, 168, 120), "hair": (26, 16, 16), "shirt": (20, 24, 36), "pants": (16, 16, 20), "accent": (255, 179, 71), "hair_style": "buzz"},
    {"id": "glitched_worker", "skin": (232, 226, 212), "hair": (5, 6, 7), "shirt": (194, 32, 42), "pants": (14, 16, 20), "accent": (98, 197, 255), "hair_style": "messy", "glitch": True},
    {"id": "pale_clone", "skin": (216, 232, 232), "hair": (14, 16, 20), "shirt": (154, 163, 154), "pants": (31, 31, 36), "accent": (194, 32, 42), "hair_style": "short", "glitch": True},
]


def put(px, x, y, color):
    if 0 <= x < len(px[0]) and 0 <= y < len(px):
        px[y][x] = color


def rect(px, x, y, w, h, color):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            put(px, xx, yy, color)


def line(px, x1, y1, x2, y2, color):
    dx = abs(x2 - x1)
    sx = 1 if x1 < x2 else -1
    dy = -abs(y2 - y1)
    sy = 1 if y1 < y2 else -1
    err = dx + dy
    while True:
        put(px, x1, y1, color)
        if x1 == x2 and y1 == y2:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy
            x1 += sx
        if e2 <= dx:
            err += dx
            y1 += sy


def draw_character(px, ox, oy, spec, direction, frame):
    skin = spec["skin"]
    hair = spec["hair"]
    shirt = spec["shirt"]
    pants = spec["pants"]
    accent = spec["accent"]
    outline = (6, 8, 12)
    shadow = (0, 0, 0, 92)
    walk = [-2, 0, 2, 0][frame]
    alt = [2, 0, -2, 0][frame]

    rect(px, ox + 8, oy + 41, 16, 3, shadow)
    rect(px, ox + 11, oy + 25, 4, 11 + walk // 2, pants)
    rect(px, ox + 17, oy + 25, 4, 11 + alt // 2, pants)
    rect(px, ox + 10, oy + 36 + walk // 2, 5, 3, outline)
    rect(px, ox + 17, oy + 36 + alt // 2, 5, 3, outline)

    rect(px, ox + 8, oy + 14, 16, 14, outline)
    rect(px, ox + 9, oy + 15, 14, 12, shirt)
    rect(px, ox + 15, oy + 15, 2, 10, accent)
    rect(px, ox + 6, oy + 16 + alt // 2, 4, 11, shirt)
    rect(px, ox + 22, oy + 16 + walk // 2, 4, 11, shirt)
    rect(px, ox + 6, oy + 26 + alt // 2, 4, 3, skin)
    rect(px, ox + 22, oy + 26 + walk // 2, 4, 3, skin)

    rect(px, ox + 13, oy + 11, 6, 4, skin)
    rect(px, ox + 9, oy + 3, 14, 12, outline)
    rect(px, ox + 10, oy + 4, 12, 10, skin)

    style = spec.get("hair_style", "short")
    if style == "long":
        rect(px, ox + 8, oy + 2, 16, 5, hair)
        rect(px, ox + 8, oy + 6, 3, 14, hair)
        rect(px, ox + 21, oy + 6, 3, 14, hair)
        rect(px, ox + 11, oy + 13, 10, 10, hair)
    elif style == "bun":
        rect(px, ox + 8, oy + 2, 16, 5, hair)
        rect(px, ox + 21, oy + 5, 5, 5, hair)
    elif style == "buzz":
        rect(px, ox + 10, oy + 3, 12, 3, hair)
    elif style == "headphones":
        rect(px, ox + 8, oy + 2, 16, 4, hair)
        rect(px, ox + 7, oy + 7, 3, 6, outline)
        rect(px, ox + 22, oy + 7, 3, 6, outline)
        line(px, ox + 9, oy + 5, ox + 23, oy + 5, accent)
    elif style == "messy":
        rect(px, ox + 8, oy + 2, 16, 4, hair)
        rect(px, ox + 7, oy + 1, 5, 3, hair)
        rect(px, ox + 15, oy + 0, 5, 4, hair)
        rect(px, ox + 21, oy + 2, 4, 4, hair)
    else:
        rect(px, ox + 8, oy + 2, 16, 4, hair)
        rect(px, ox + 8, oy + 5, 3, 7, hair)
        rect(px, ox + 21, oy + 5, 3, 7, hair)

    if direction != "up":
        eye_y = oy + 9
        if direction == "left":
            rect(px, ox + 11, eye_y, 2, 2, outline)
        elif direction == "right":
            rect(px, ox + 19, eye_y, 2, 2, outline)
        else:
            rect(px, ox + 12, eye_y, 2, 2, outline)
            rect(px, ox + 18, eye_y, 2, 2, outline)
            rect(px, ox + 14, oy + 12, 4, 1, outline)

    if spec.get("glasses"):
        rect(px, ox + 11, oy + 8, 4, 3, outline)
        rect(px, ox + 18, oy + 8, 4, 3, outline)
        line(px, ox + 15, oy + 9, ox + 18, oy + 9, outline)

    if spec.get("glitch"):
        for i in range(5):
            gy = oy + 8 + i * 6
            rect(px, ox + 4 + ((frame + i) % 3) * 3, gy, 8 + i, 1, accent)
        rect(px, ox + 23, oy + 18 + frame, 3, 12, (98, 197, 255, 150))


def write_png(path, pixels):
    height = len(pixels)
    width = len(pixels[0])
    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for r, g, b, *a in row:
            raw.extend([r, g, b, a[0] if a else 255])

    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def main():
    out_dir = os.path.join("assets", "sprites")
    os.makedirs(out_dir, exist_ok=True)
    width = len(SPRITES) * FRAMES * CELL_W
    height = len(DIRECTIONS) * CELL_H
    pixels = [[(0, 0, 0, 0) for _ in range(width)] for _ in range(height)]
    manifest = {"image": "office_characters.png", "cell": {"w": CELL_W, "h": CELL_H}, "frames": FRAMES, "directions": DIRECTIONS, "sprites": {}}

    for si, spec in enumerate(SPRITES):
      manifest["sprites"][spec["id"]] = {}
      for di, direction in enumerate(DIRECTIONS):
        manifest["sprites"][spec["id"]][direction] = []
        for frame in range(FRAMES):
          x = (si * FRAMES + frame) * CELL_W
          y = di * CELL_H
          draw_character(pixels, x, y, spec, direction, frame)
          manifest["sprites"][spec["id"]][direction].append({"x": x, "y": y, "w": CELL_W, "h": CELL_H})

    write_png(os.path.join(out_dir, "office_characters.png"), pixels)
    with open(os.path.join(out_dir, "office_characters.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
