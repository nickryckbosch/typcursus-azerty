"""Maakt de prenten van Fien en Jef voor de app uit de twaalf losse bronprenten.

Gebruik (vanuit de hoofdmap van het project, Python 3 met Pillow):
    python3 scripts/maak-figuren.py

Invoer:  docs/beelden/figuren/<kind>-<houding>.webp
         (twaalf prenten uit ChatGPT, elk een hele figuur op een doorzichtige
         achtergrond, 1024 x 1536)
Uitvoer: src/beelden/<kind>-<houding>.png

Dit script vervangt scripts/knip-figuren.py, dat de figuren uit een blad met
zes houdingen knipte. De bronprenten zijn nu los en al doorzichtig, dus er
hoeft niets meer uitgeknipt te worden.

Wat het script doet:
- Het snijdt elke prent bij tot op de figuur.
- Elke houding krijgt dezelfde lichaamslengte als de andere houdingen van
  hetzelfde kind, met de voeten op dezelfde lijn. Zo verspringt er niets als
  een houding wisselt (K20).
- Fien is iets kleiner dan Jef (VERHOUDING_FIEN). De bronprenten zijn apart
  gemaakt en zeggen daar niets over; de verhouding is die van de vorige reeks.
- "zwaai" wordt de hele figuur (startscherm, strook van een spel). De andere
  houdingen worden op de helft afgesneden, ter hoogte van de zak van de trui:
  een gezichtje met bovenlijf naast de oefening.
- De prenten zijn dubbel zo groot als de vorige reeks (720 en 600 pixels hoog
  in plaats van 360 en 300): ze blijven scherp als het scherm meeschaalt op
  een groot venster of op het bord.
"""

from pathlib import Path
from statistics import median

from PIL import Image

BRON = Path("docs/beelden/figuren")
DOEL = Path("src/beelden")

KINDEREN = ["fien", "jef"]
HOUDINGEN = ["zwaai", "duim", "blij", "trots", "aanmoedigend", "nadenkend"]

VERHOUDING_FIEN = 350 / 360  # lichaamslengte van Fien tegenover Jef, zoals in de vorige reeks
HOOGTE_HEEL = 720  # hele figuur: hoogte van de prent
HOOGTE_LIJF = 1200  # maat waarop de bovenlijven berekend worden
SNEDE = 0.50  # bovenlijf: dit deel van de prent, van boven gerekend
MIN_ALFA = 8  # bijna doorzichtige pixels tellen niet mee voor de rand van de figuur


def figuur(naam):
    """De bronprent, strak bijgesneden tot op de figuur."""
    prent = Image.open(BRON / f"{naam}.webp").convert("RGBA")
    kader = prent.getchannel("A").point(lambda a: 255 if a > MIN_ALFA else 0).getbbox()
    return prent.crop(kader)


def op_doek(prent, lengte, doekhoogte):
    """Schaalt de figuur naar de gevraagde lichaamslengte en zet ze met de
    voeten onderaan op een doorzichtig doek met een vaste hoogte."""
    breedte = round(prent.width * lengte / prent.height)
    geschaald = prent.resize((breedte, lengte), Image.LANCZOS)
    doek = Image.new("RGBA", (breedte, doekhoogte), (0, 0, 0, 0))
    doek.paste(geschaald, (0, doekhoogte - lengte))
    return doek


def bewaar(prent, naam):
    # 256 kleuren volstaan voor vlakke prenten en maken de bestanden veel kleiner.
    klein = prent.quantize(256, method=Image.Quantize.FASTOCTREE)
    klein.save(DOEL / f"{naam}.png", optimize=True)
    print(f"{naam}: {klein.width} x {klein.height}")


def main():
    DOEL.mkdir(parents=True, exist_ok=True)
    for kind in KINDEREN:
        verhouding = VERHOUDING_FIEN if kind == "fien" else 1.0
        prenten = {h: figuur(f"{kind}-{h}") for h in HOUDINGEN}
        print(f"{kind}: lichaamslengte in de bron, mediaan {median(p.height for p in prenten.values())} pixels")
        for houding, prent in prenten.items():
            if houding == "zwaai":
                bewaar(op_doek(prent, round(HOOGTE_HEEL * verhouding), HOOGTE_HEEL), f"{kind}-{houding}")
            else:
                doek = op_doek(prent, round(HOOGTE_LIJF * verhouding), HOOGTE_LIJF)
                lijf = doek.crop((0, 0, doek.width, round(HOOGTE_LIJF * SNEDE)))
                # Lege kolommen links en rechts weg (armen en benen onder de snede).
                kader = lijf.getbbox()
                lijf = lijf.crop((kader[0], 0, kader[2], lijf.height))
                bewaar(lijf, f"{kind}-{houding}")


if __name__ == "__main__":
    main()
