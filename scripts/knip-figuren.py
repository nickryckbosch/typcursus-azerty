"""Knipt Fien en Jef uit het modelblad en maakt de witte achtergrond doorzichtig.

Gebruik (vanuit de hoofdmap van het project, Python 3 met Pillow):
    python3 scripts/knip-figuren.py

Invoer:  docs/beelden/fien-en-jef-modelblad.png
Uitvoer: src/beelden/<naam>.png

De vakken hieronder zijn ruwe zones op het modelblad (links, boven, rechts, onder).
Binnen elke zone wordt de figuur precies afgebakend. Alleen het wit dat aan de
rand van de uitsnede raakt wordt doorzichtig, zodat het wit van ogen en tanden blijft.
"""

from collections import deque
from pathlib import Path

from PIL import Image

BRON = Path("docs/beelden/fien-en-jef-modelblad.png")
DOEL = Path("src/beelden")
MAX_HOOGTE = 360

ZONES = {
    "fien-zwaai": (445, 20, 725, 525),
    "jef-zwaai": (1170, 15, 1445, 525),
    "fien-blij": (20, 545, 310, 805),
    "fien-trots": (340, 545, 670, 805),
    "fien-nadenkend": (20, 810, 310, 1086),
    "fien-aanmoedigend": (335, 810, 670, 1086),
    "jef-blij": (785, 540, 1010, 805),
    "jef-trots": (1075, 540, 1365, 805),
    "jef-nadenkend": (765, 810, 1010, 1086),
    "jef-aanmoedigend": (1065, 810, 1375, 1086),
}


def is_achtergrond(p):
    r, g, b = p[:3]
    return min(r, g, b) >= 236 and max(r, g, b) - min(r, g, b) <= 12


def afbakenen(im):
    """Kleinste kader rond alles wat geen achtergrond is."""
    b, h = im.size
    px = im.load()
    xs, ys = [], []
    for y in range(h):
        for x in range(b):
            if not is_achtergrond(px[x, y]):
                xs.append(x)
                ys.append(y)
    marge = 4
    return (max(min(xs) - marge, 0), max(min(ys) - marge, 0), min(max(xs) + marge + 1, b), min(max(ys) + marge + 1, h))


def maak_doorzichtig(im):
    """Vul vanaf de randen: wit dat met de rand verbonden is, wordt doorzichtig."""
    im = im.convert("RGBA")
    b, h = im.size
    px = im.load()
    gezien = bytearray(b * h)
    rij = deque()
    for x in range(b):
        rij.extend([(x, 0), (x, h - 1)])
    for y in range(h):
        rij.extend([(0, y), (b - 1, y)])
    while rij:
        x, y = rij.popleft()
        if x < 0 or y < 0 or x >= b or y >= h or gezien[y * b + x]:
            continue
        gezien[y * b + x] = 1
        if not is_achtergrond(px[x, y]):
            continue
        px[x, y] = (255, 255, 255, 0)
        rij.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    # Zachte rand: lichte pixels naast doorzichtige pixels half doorzichtig maken.
    kopie = im.copy().load()
    for y in range(1, h - 1):
        for x in range(1, b - 1):
            r, g, bl, a = kopie[x, y]
            if a == 0:
                continue
            buren = (kopie[x + 1, y][3], kopie[x - 1, y][3], kopie[x, y + 1][3], kopie[x, y - 1][3])
            if 0 in buren and min(r, g, bl) > 200:
                px[x, y] = (r, g, bl, 255 - min(r, g, bl))
    return im


def main():
    blad = Image.open(BRON).convert("RGB")
    DOEL.mkdir(parents=True, exist_ok=True)
    for naam, zone in ZONES.items():
        stuk = blad.crop(zone)
        stuk = stuk.crop(afbakenen(stuk))
        stuk = maak_doorzichtig(stuk)
        if stuk.height > MAX_HOOGTE:
            stuk = stuk.resize((round(stuk.width * MAX_HOOGTE / stuk.height), MAX_HOOGTE), Image.LANCZOS)
        # 256 kleuren volstaan voor tekenfilmprenten en maken de bestanden veel kleiner.
        stuk = stuk.quantize(256, method=Image.Quantize.FASTOCTREE)
        stuk.save(DOEL / f"{naam}.png", optimize=True)
        print(naam, stuk.size)


if __name__ == "__main__":
    main()
