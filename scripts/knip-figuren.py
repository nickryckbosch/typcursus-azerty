"""Knipt Fien en Jef uit het blad met zes houdingen en maakt de achtergrond doorzichtig.

Gebruik (vanuit de hoofdmap van het project, Python 3 met Pillow, numpy en scipy):
    python3 scripts/knip-figuren.py

Invoer:  docs/beelden/fien-en-jef-zes-houdingen.png (klare lijn, 1536 x 1024)
Uitvoer: src/beelden/<naam>.png

Het blad toont twee rijen van zes houdingen: boven Fien, onder Jef. Van links
naar rechts: zwaai, duim, blij, trots, aanmoedigend, nadenkend.

Wat het script doet:
- Het zoekt de figuren zelf: de kolommen zonder tekening zijn de grenzen.
- De achtergrond wordt doorzichtig, ook de stukjes die ingesloten zijn (tussen
  paardenstaart en nek). Het wit van schoenen, ogen en tanden blijft: dat is
  koeler van kleur dan de roomwitte achtergrond.
- Elke figuur krijgt dezelfde lichaamslengte als de andere houdingen van hetzelfde
  kind, en Fien en Jef houden hun verhouding van het blad (Jef is iets groter).
  Alle prenten van een soort hebben dezelfde hoogte, met de voeten op dezelfde
  lijn. Zo verspringt er niets als een houding wisselt.
- "zwaai" wordt de hele figuur (startscherm, strook van een spel). De andere
  houdingen worden op dezelfde hoogte boven de voeten afgesneden, ter hoogte
  van de zak van de trui: een gezichtje met bovenlijf naast de oefening.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

BRON = Path("docs/beelden/fien-en-jef-zes-houdingen.png")
DOEL = Path("src/beelden")

HOUDINGEN = ["zwaai", "duim", "blij", "trots", "aanmoedigend", "nadenkend"]
RIJEN = {"fien": (0, 505), "jef": (505, 1024)}

ACHTERGROND = np.array([252, 247, 243])
SPELING = 12
# De achtergrond is roomwit (rood duidelijk hoger dan blauw); schoenen, ogen en
# tanden zijn koel wit. Dit verschil houdt ze uit elkaar.
MIN_WARMTE = 5
MIN_GAT = 40  # ingesloten achtergrond kleiner dan dit blijft staan (ruis)
SCHOENZONE = 0.15  # onderste deel van de figuur: daar blijft ingesloten roomwit staan (schaduw in de schoenen)
MIN_STUK = 40  # losse spikkels kleiner dan dit verdwijnen

HOOGTE_HEEL = 360  # hele figuur: hoogte van de prent
HOOGTE_LIJF = 600  # maat waarop de bovenlijven berekend worden (scherper)
SNEDE = 0.50  # bovenlijf: dit deel van de prent, van boven gerekend


def masker_achtergrond(stuk):
    dichtbij = np.abs(stuk - ACHTERGROND).max(axis=2) <= SPELING
    warm = (stuk[:, :, 0] - stuk[:, :, 2]) >= MIN_WARMTE
    return dichtbij & warm


def figuren_in_rij(blad, y0, y1):
    """Geeft per figuur het uitgeknipte stuk (RGBA, strak afgebakend)."""
    rij = blad[y0:y1]
    achtergrond = masker_achtergrond(rij)
    kolommen = (~achtergrond).sum(axis=0)
    # Kolommen met minder dan 2 afwijkende pixels tellen als leeg (ruis).
    bezet = kolommen >= 2
    zones, start = [], None
    for x, vol in enumerate(bezet):
        if vol and start is None:
            start = x
        if not vol and start is not None:
            if x - start > 60:
                zones.append((start, x))
            start = None
    if start is not None:
        zones.append((start, len(bezet)))
    if len(zones) != len(HOUDINGEN):
        raise SystemExit(f"Verwachtte {len(HOUDINGEN)} figuren, vond {len(zones)}: {zones}")

    uit = []
    for x0, x1 in zones:
        marge = 6
        stuk = rij[:, max(0, x0 - marge) : x1 + marge]
        bg = masker_achtergrond(stuk)
        labels, aantal = ndi.label(bg)
        rand = set(labels[0]) | set(labels[-1]) | set(labels[:, 0]) | set(labels[:, -1])
        rand.discard(0)
        groottes = ndi.sum(bg, labels, range(1, aantal + 1))
        weg = np.isin(labels, list(rand))
        rijen_met_figuur = np.where((~bg).sum(axis=1) >= 2)[0]
        boven, onder = rijen_met_figuur.min(), rijen_met_figuur.max()
        schoenlijn = onder - SCHOENZONE * (onder - boven)
        middens = ndi.center_of_mass(bg, labels, range(1, aantal + 1))
        for nr, grootte in enumerate(groottes, 1):
            if nr not in rand and grootte >= MIN_GAT and middens[nr - 1][0] < schoenlijn:
                weg |= labels == nr
        zichtbaar = ~weg
        labels2, aantal2 = ndi.label(zichtbaar)
        groottes2 = ndi.sum(zichtbaar, labels2, range(1, aantal2 + 1))
        for nr, grootte in enumerate(groottes2, 1):
            if grootte < MIN_STUK:
                zichtbaar[labels2 == nr] = False
        # Het lichte randje tussen de achtergrond en de zwarte lijn weghalen,
        # anders staat er een wit randje rond de figuur op een gekleurd vlak.
        # Alleen lichte, grijzige pixels die aan het doorzichtige deel raken;
        # de zwarte lijn en de gekleurde vlakken blijven.
        licht = (stuk.min(axis=2) >= 120) & ((stuk.max(axis=2) - stuk.min(axis=2)) <= 45)
        for _ in range(3):
            buur_weg = ndi.binary_dilation(~zichtbaar, structure=np.ones((3, 3)))
            zichtbaar &= ~(buur_weg & licht)
        alfa = np.where(zichtbaar, 255, 0).astype("uint8")
        ys, xs = np.where(zichtbaar)
        kader = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        rgba = np.dstack([stuk.astype("uint8"), alfa])
        uit.append(Image.fromarray(rgba).crop(kader))
    return uit


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
    print(naam, klein.size)


def main():
    blad = np.array(Image.open(BRON).convert("RGB")).astype(int)
    DOEL.mkdir(parents=True, exist_ok=True)
    stukken = {wie: figuren_in_rij(blad, *rij) for wie, rij in RIJEN.items()}
    # De lichaamslengte per kind: de mediaan over de zes houdingen op het blad.
    lengte = {wie: float(np.median([p.height for p in lijst])) for wie, lijst in stukken.items()}
    grootste = max(lengte.values())

    for wie, lijst in stukken.items():
        verhouding = lengte[wie] / grootste
        for houding, prent in zip(HOUDINGEN, lijst):
            if houding == "zwaai":
                bewaar(op_doek(prent, round(HOOGTE_HEEL * verhouding), HOOGTE_HEEL), f"{wie}-{houding}")
            else:
                doek = op_doek(prent, round(HOOGTE_LIJF * verhouding), HOOGTE_LIJF)
                lijf = doek.crop((0, 0, doek.width, round(HOOGTE_LIJF * SNEDE)))
                # Lege kolommen links en rechts weg (armen en benen onder de snede).
                kader = lijf.getbbox()
                lijf = lijf.crop((kader[0], 0, kader[2], lijf.height))
                bewaar(lijf, f"{wie}-{houding}")


if __name__ == "__main__":
    main()
