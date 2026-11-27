"""Knipt Fien en Jef uit het modelblad en maakt de achtergrond doorzichtig.

Gebruik (vanuit de hoofdmap van het project, Python 3 met Pillow, numpy en scipy):
    python3 scripts/knip-figuren.py

Invoer:  docs/beelden/fien-en-jef-modelblad.png (klare lijn, 1536 x 1024)
Uitvoer: src/beelden/<naam>.png

Het modelblad toont twee rijen van vijf houdingen: boven Fien, onder Jef.
De vakken hieronder zijn ruwe zones (links, boven, rechts, onder). Binnen elke zone:
- de achtergrond die aan de rand raakt, wordt doorzichtig;
- ingesloten stukken achtergrond groter dan 350 pixels ook (tussen arm en lijf);
  kleinere stukken blijven, zo blijft het wit van ogen en tanden;
- losse spikkels kleiner dan 40 pixels verdwijnen;
- de figuur wordt precies afgebakend en verkleind tot hoogstens 360 hoog.

"trots" is dezelfde prent als "duim": het modelblad heeft geen aparte houding.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

BRON = Path("docs/beelden/fien-en-jef-modelblad.png")
DOEL = Path("src/beelden")
MAX_HOOGTE = 360
ACHTERGROND = np.array([252, 248, 242])
SPELING = 11

ZONES = {
    "fien-zwaai": (445, 15, 668, 512),
    "fien-blij": (668, 15, 866, 512),
    "fien-duim": (866, 15, 1070, 512),
    "fien-nadenkend": (1070, 15, 1276, 512),
    "fien-aanmoedigend": (1276, 15, 1510, 512),
    "jef-zwaai": (445, 512, 672, 1020),
    "jef-blij": (672, 512, 872, 1020),
    "jef-duim": (872, 512, 1084, 1020),
    "jef-nadenkend": (1084, 512, 1284, 1020),
    "jef-aanmoedigend": (1284, 512, 1520, 1020),
}


def knip(blad, zone):
    x0, y0, x1, y1 = zone
    stuk = blad[y0:y1, x0:x1]
    achtergrond = np.abs(stuk - ACHTERGROND).max(axis=2) <= SPELING
    labels, aantal = ndi.label(achtergrond)
    rand = set(labels[0]) | set(labels[-1]) | set(labels[:, 0]) | set(labels[:, -1])
    rand.discard(0)
    groottes = ndi.sum(achtergrond, labels, range(1, aantal + 1))
    weg = np.isin(labels, list(rand))
    for nr, grootte in enumerate(groottes, 1):
        if nr not in rand and grootte > 350:
            weg |= labels == nr
    zichtbaar = ~weg
    labels2, aantal2 = ndi.label(zichtbaar)
    groottes2 = ndi.sum(zichtbaar, labels2, range(1, aantal2 + 1))
    for nr, grootte in enumerate(groottes2, 1):
        if grootte < 40:
            zichtbaar[labels2 == nr] = False
    ys, xs = np.where(zichtbaar)
    kader = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    rgba = np.dstack([stuk, np.where(zichtbaar, 255, 0)]).astype("uint8")
    prent = Image.fromarray(rgba).crop(kader)
    if prent.height > MAX_HOOGTE:
        prent = prent.resize((round(prent.width * MAX_HOOGTE / prent.height), MAX_HOOGTE), Image.LANCZOS)
    # 256 kleuren volstaan voor vlakke prenten en maken de bestanden veel kleiner.
    return prent.quantize(256, method=Image.Quantize.FASTOCTREE)


def main():
    blad = np.array(Image.open(BRON).convert("RGB")).astype(int)
    DOEL.mkdir(parents=True, exist_ok=True)
    for naam, zone in ZONES.items():
        prent = knip(blad, zone)
        prent.save(DOEL / f"{naam}.png", optimize=True)
        print(naam, prent.size)
        if naam.endswith("-duim"):
            prent.save(DOEL / f"{naam[:-5]}-trots.png", optimize=True)


if __name__ == "__main__":
    main()
