"""Maakt de prenten van Fien en Jef voor de app uit losse tekeningen met een
doorzichtige achtergrond.

Gebruik (vanuit de hoofdmap van het project, Python 3 met Pillow en numpy):
    python3 scripts/knip-figuren.py

Invoer:  docs/beelden/figuren/<wie>-<houding>.png
         twaalf losse tekeningen uit ChatGPT (28 november 2026), elk 1024 x 1536,
         met een doorzichtige achtergrond, de volledige figuur van hoofd tot schoenen.
Uitvoer: src/beelden/<wie>-<houding>.webp en src/beelden/maten.json

Houdingen: zwaai, duim, blij, trots, aanmoedigend, nadenkend; voor fien en jef.

Waarom zo (docs/beslissingen.md, 12q):
- De vorige prenten kwamen uit een blad met twaalf figuren (1536 x 1024): elke
  figuur was maar ongeveer 250 pixels breed. Ze waren wazig op een groot scherm,
  en het script moest de achtergrond zelf wegknippen. Dat gaf een harde rand
  (een pixel was doorzichtig of niet) en met 256 kleuren trapjes langs de lijnen.
- Nu is elke figuur een eigen tekening met een echte doorzichtige achtergrond.
  Het script knipt niets meer weg; de zachte randen van de tekening blijven.
- WebP met doorzichtigheid: alle kleuren en zachte randen, en toch klein
  (ongeveer tien keer kleiner dan een PNG met alle kleuren).

Wat het script doet:
- Losse spikkels rond de figuur (bijna doorzichtige ruis van de tekening) weg.
- Strak afbakenen op de figuur.
- Een schaal per kind, voor alle houdingen dezelfde: de lichaamslengte is de
  mediaan over de zes houdingen. Zo heeft Fien in elke houding dezelfde maat, en
  houden Fien en Jef hun verhouding (Jef is iets groter). Alle prenten van een
  soort hebben dezelfde hoogte, met de voeten op dezelfde lijn: er verspringt
  niets als een houding wisselt (K20).
- "zwaai" wordt de hele figuur (startscherm, strook van een spel, slotschermen).
  De andere houdingen worden afgesneden op de helft van de prent, ter hoogte
  van de zak van de trui: een gezichtje met bovenlijf naast de oefening.
- Twee keer zo groot als vroeger, zodat de figuren ook scherp zijn als het scherm
  meeschaalt op een groot scherm (schalen als een dia, 12p).
- maten.json bewaart breedte en hoogte van elke prent, zodat de code nooit een
  verhouding moet raden (bv. de figuren in de strook van "Over de beek").
"""

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

BRON = Path("docs/beelden/figuren")
DOEL = Path("src/beelden")

KINDEREN = ["fien", "jef"]
HOUDINGEN = ["zwaai", "duim", "blij", "trots", "aanmoedigend", "nadenkend"]

HOOGTE_HEEL = 720  # hele figuur: hoogte van de prent (vroeger 360)
HOOGTE_LIJF = 1200  # maat waarop de bovenlijven berekend worden (vroeger 600)
SNEDE = 0.50  # bovenlijf: dit deel van de prent, van boven gerekend
DREMPEL = 40  # alfa boven deze waarde telt als figuur
RAND = 4  # zo ver rond de figuur blijven de zachte randpixels staan
KWALITEIT = 92  # WebP-kwaliteit


def schoon(prent):
    """Haalt bijna doorzichtige ruis weg die niet tegen de figuur ligt, en bakent af."""
    alfa = prent.getchannel("A")
    figuur = alfa.point(lambda v: 255 if v > DREMPEL else 0)
    # De zachte rand van de lijn hoort erbij: een paar pixels rond de figuur.
    houden = figuur.filter(ImageFilter.MaxFilter(2 * RAND + 1))
    nieuw = Image.fromarray(np.minimum(np.array(alfa), np.array(houden)).astype("uint8"))
    prent = prent.copy()
    prent.putalpha(nieuw)
    return prent.crop(figuur.getbbox())


def op_doek(prent, schaal, doekhoogte):
    """Schaalt de figuur en zet ze met de voeten onderaan op een doorzichtig doek."""
    breedte, hoogte = round(prent.width * schaal), round(prent.height * schaal)
    geschaald = prent.resize((breedte, hoogte), Image.LANCZOS)
    doek = Image.new("RGBA", (breedte, doekhoogte), (0, 0, 0, 0))
    doek.paste(geschaald, (0, doekhoogte - hoogte))
    return doek


def bewaar(prent, naam, maten):
    prent.save(DOEL / f"{naam}.webp", "WEBP", quality=KWALITEIT, method=6)
    maten[naam] = {"breedte": prent.width, "hoogte": prent.height}
    print(naam, prent.size, (DOEL / f"{naam}.webp").stat().st_size // 1024, "kB")


def main():
    DOEL.mkdir(parents=True, exist_ok=True)
    prenten = {
        wie: {h: schoon(Image.open(BRON / f"{wie}-{h}.png").convert("RGBA")) for h in HOUDINGEN}
        for wie in KINDEREN
    }
    # De lichaamslengte per kind: de mediaan over de zes houdingen.
    lengte = {wie: float(np.median([p.height for p in lijst.values()])) for wie, lijst in prenten.items()}
    grootste = max(lengte.values())

    maten = {}
    for wie, lijst in prenten.items():
        verhouding = lengte[wie] / grootste
        for houding, prent in lijst.items():
            if houding == "zwaai":
                schaal = HOOGTE_HEEL * verhouding / lengte[wie]
                bewaar(op_doek(prent, schaal, HOOGTE_HEEL), f"{wie}-{houding}", maten)
            else:
                schaal = HOOGTE_LIJF * verhouding / lengte[wie]
                doek = op_doek(prent, schaal, HOOGTE_LIJF)
                lijf = doek.crop((0, 0, doek.width, round(HOOGTE_LIJF * SNEDE)))
                # Lege kolommen links en rechts weg (armen en benen onder de snede).
                kader = lijf.getchannel("A").point(lambda v: 255 if v > 0 else 0).getbbox()
                lijf = lijf.crop((kader[0], 0, kader[2], lijf.height))
                bewaar(lijf, f"{wie}-{houding}", maten)

    (DOEL / "maten.json").write_text(json.dumps(maten, indent=2) + "\n")


if __name__ == "__main__":
    main()
