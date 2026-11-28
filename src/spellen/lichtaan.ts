// Spel "Licht aan in het huis" (les 0). Elke toets van de gevraagde rij is goed
// (herkend via event.code, dus los van de indeling). Goed: een raam gaat aan.
// Fout: de juiste rij licht op het toetsenbord op en er gaat niets verloren.
// Na een fout wordt de invoer kort genegeerd, zodat rammen niet helpt
// (afspraak uit de lesdata). Geen tijd, geen punten.
//
// De tekening is keuze K21 (projectdocument 14; docs/stijlgids.md, deel 8):
// - vier even hoge lagen van 66: het dak, de zolder, de woonkamer en de kelder
//   (onder de grondlijn). Het dak is de cijferrij van het toetsenbord, een
//   vierde rij boven de zolder: de zolder zit dus niet in het dak. In les 0
//   tot 5 blijft het dak leeg;
// - negen gelijke ramen, omdat de rijen op het toetsenbord ook gelijk zijn;
// - de woorden staan in een eigen kolom links, nooit over de tekening;
// - er knippert niets (K16): het vakje van het woord dat aan de beurt is,
//   wordt donker en blijft stil staan;
// - de raamkleuren zijn nagemeten tegen de vingerkleuren: verander ze niet
//   zonder nieuwe meting.
// Fien en Jef staan vlak naast het huis, niet in een raam.

import { t, type TekstSleutel } from "../content";
import type { BlokFunctie } from "../blokken/context";
import { oefenscherm } from "../blokken/oefenscherm";
import type { SpelBlok } from "../content/types";
import { toetsVoorCode, type Rij } from "../logica/indeling";
import { lichtAanRondes } from "../logica/reeksen";
import { svg } from "../weergave/dom";

const VERDIEPINGEN: Rij[] = ["zolder", "woonkamer", "kelder"];
const LIJN = "#1F1F1F";
const RAAM_X = [291, 351, 411];

// De plaats van de ramen en het midden van het woord, per laag. Het dak staat
// er al in, zodat er later een vierde rij ramen en het woord "dak" bij kan
// zonder de tekening te veranderen: zet "dak" dan bij in VERDIEPINGEN.
const LAAG: Record<string, { ramen: number; midden: number }> = {
  dak: { ramen: 64, midden: 83 },
  zolder: { ramen: 130, midden: 149 },
  woonkamer: { ramen: 196, midden: 215 },
  kelder: { ramen: 262, midden: 281 },
};

// De woordvakjes zijn groter dan in de referentie van K21 (150 x 40 in plaats
// van 100 x 28), zodat de woorden ook op een kleine Chromebook leesbaar zijn.
// Ze staan op dezelfde hoogte (het midden van hun laag) en eindigen op dezelfde
// plaats rechts (x = 170), dus nooit over de tekening.
const VAK = { breedte: 150, hoogte: 40, rechts: 170 };

/** Het huis zonder ramen: de referentietekening van K21 (viewBox 0 0 680 350). */
function huisVorm(): SVGGElement {
  return svg(
    "g",
    { stroke: LIJN, "stroke-width": 1.8, "stroke-linejoin": "round" },
    // de grond met de kelder erin, het gras en de struiken
    svg("rect", { x: 200, y: 252, width: 340, height: 72, rx: 8, fill: "#D9C3A0" }),
    svg("rect", { x: 200, y: 244, width: 340, height: 12, rx: 6, fill: "#A9BF6B" }),
    svg("circle", { cx: 220, cy: 241, r: 10, fill: "#7FA04A" }),
    svg("circle", { cx: 236, cy: 235, r: 14, fill: "#7FA04A" }),
    svg("circle", { cx: 520, cy: 238, r: 12, fill: "#7FA04A" }),
    // de schoorsteen en het dak (leeg in les 0 tot 5)
    svg("rect", { x: 440, y: 26, width: 22, height: 34, fill: "#C9824F" }),
    svg("rect", { x: 436, y: 20, width: 30, height: 9, rx: 3, fill: "#C9824F" }),
    svg("polygon", { points: "232,116 266,50 474,50 508,116", fill: "#D8693B" }),
    // de zolder, de woonkamer en de kelder
    svg("rect", { x: 250, y: 116, width: 240, height: 66, fill: "#FBE8D3" }),
    svg("rect", { x: 250, y: 182, width: 240, height: 66, fill: "#FBE8D3" }),
    svg("rect", { x: 250, y: 248, width: 240, height: 66, fill: "#BDB8AE" }),
  );
}

/** Een raam van 38 x 38 met een kruis. De klasse "aan" doet het licht aan (stijl.css). */
function raam(x: number, y: number): SVGGElement {
  return svg(
    "g",
    { class: "raam" },
    svg("rect", { class: "raam-glas", x, y, width: 38, height: 38, rx: 5, stroke: LIJN, "stroke-width": 1.8 }),
    svg("path", { d: `M${x + 19} ${y}V${y + 38}M${x} ${y + 19}H${x + 38}`, stroke: LIJN, "stroke-width": 1.5, fill: "none" }),
  );
}

/** Het woord van een verdieping in een afgerond vakje, links van de tekening. */
function woord(rij: Rij): SVGGElement {
  const midden = LAAG[rij].midden;
  const x = VAK.rechts - VAK.breedte;
  return svg(
    "g",
    { class: "huis-woord" },
    // de rand van de hulp: dezelfde rand als de rij op het toetsenbord (stijl.css)
    svg("rect", { class: "woord-hulp-rand", x: x - 7, y: midden - VAK.hoogte / 2 - 7, width: VAK.breedte + 14, height: VAK.hoogte + 14, rx: VAK.hoogte / 2 + 7 }),
    svg("rect", { x, y: midden - VAK.hoogte / 2, width: VAK.breedte, height: VAK.hoogte, rx: VAK.hoogte / 2, stroke: LIJN, "stroke-width": 1.5 }),
    svg("text", { x: x + VAK.breedte / 2, y: midden, "text-anchor": "middle", "dominant-baseline": "central" }, t(`rij.${rij}` as TekstSleutel)),
  );
}

export interface HuisTekening {
  svg: SVGSVGElement;
  ramen: Map<Rij, SVGGElement[]>;
  woorden: Map<Rij, SVGGElement>;
}

/**
 * Het huis met de ramen (alle lichten uit) en de woorden links. Dezelfde
 * tekening staat in de intro van les 0 en in het spel "Licht aan in het huis".
 */
export function maakHuis(label: string): HuisTekening {
  const ramen = new Map<Rij, SVGGElement[]>();
  const woorden = new Map<Rij, SVGGElement>();
  // De viewBox is het deel van de referentie waar iets staat, zodat de tekening
  // zo groot mogelijk in haar zone past. De verhoudingen blijven die van K21.
  // Links begint ze op 8: de hulprand rond een woordvakje (tot x = 11) valt er
  // volledig binnen en wordt nergens afgekapt (test van 28 november).
  const huis = svg("svg", { class: "huis", viewBox: "8 14 538 316", role: "img", "aria-label": label }, huisVorm());
  for (const rij of VERDIEPINGEN) {
    const lijst = RAAM_X.map((x) => raam(x, LAAG[rij].ramen));
    ramen.set(rij, lijst);
    const w = woord(rij);
    woorden.set(rij, w);
    huis.append(...lijst, w);
  }
  return { svg: huis, ramen, woorden };
}

export const lichtAan: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const rijen = (blok.rijen ?? VERDIEPINGEN) as Rij[];
  const rondes = lichtAanRondes(rijen, blok.rondes ?? 9);
  let ronde = 0;
  // Alleen de eerste toets per ronde telt: na een foute toets telt even niets,
  // zodat rammen niet helpt. Na een juiste toets is de volgende ronde meteen aan de beurt.
  let wacht = false;
  let klaar = false;
  let hulpTimer: number | undefined;

  // Hulp: de rij die aan de beurt is, licht op het toetsenbord op, en het woord in
  // het huis krijgt dezelfde rand. In de eerste drie rondes (woonkamer, zolder,
  // kelder) altijd; daarna alleen na een foute toets of na even wachten.
  const RONDES_MET_HULP = 3;
  const PLAATS: Record<string, string> = { zolder: "lichtaan.bovenste", woonkamer: "lichtaan.middelste", kelder: "lichtaan.onderste" };

  const { svg: huis, ramen, woorden } = maakHuis(blok.titel);

  // Het huis staat in het midden in zijn vaste zone, Fien en Jef staan er vlak
  // links naast, als een groep (K27 fase 2). Boven Fien en Jef staat de doelzin
  // (K26): het kind weet waarom het de toetsen indrukt.
  const scherm = oefenscherm(ctx, { figuren: "blij", klasse: "blok-lichtaan", doel: blok.doel, figuurHoogte: 150, enterPlaats: "opdracht" });
  ctx.zeg(blok.doel);
  scherm.veld.append(huis);

  function toonHulp(aan: boolean): void {
    const rij = aan ? rondes[ronde] : null;
    ctx.toetsenbord.toonRij(rij);
    for (const [r, w] of woorden) w.classList.toggle("met-hulp", r === rij);
    if (aan) {
      // De opdracht zegt dan ook waar de rij ligt: "de rij met de bultjes".
      const naam = t(`rij.${rondes[ronde]}` as TekstSleutel);
      scherm.zetOpdracht(t("lichtaan.opdrachtMetPlaats", { rij: naam, plaats: t(PLAATS[rondes[ronde]] as TekstSleutel) }), false);
    }
  }

  function startRonde(): void {
    const rij = rondes[ronde];
    clearTimeout(hulpTimer);
    for (const [r, w] of woorden) w.classList.toggle("aan-de-beurt", r === rij);
    scherm.voortgang.zetBalk(ronde, rondes.length);
    const naam = t(`rij.${rij}` as TekstSleutel);
    if (ronde < RONDES_MET_HULP) {
      scherm.zetOpdracht(t("lichtaan.opdrachtMetPlaats", { rij: naam, plaats: t(PLAATS[rij] as TekstSleutel) }));
      toonHulp(true);
    } else {
      scherm.zetOpdracht(t("lichtaan.opdracht", { rij: naam }));
      toonHulp(false);
      hulpTimer = window.setTimeout(() => toonHulp(true), ctx.hulpNaMs);
    }
  }

  function aantalAan(rij: Rij): number {
    return ramen.get(rij)!.filter((r) => r.classList.contains("aan")).length;
  }

  startRonde();

  return {
    opToets(e) {
      if (klaar) {
        if (e.key === "Enter") ctx.volgende();
        return;
      }
      if (wacht) return;
      const toets = toetsVoorCode(e.code);
      if (!toets || e.repeat) return; // Shift, Tab, Enter... tellen niet mee
      const gevraagd = rondes[ronde];
      const juist = toets.rij === gevraagd;
      ctx.toetsenbord.flits(e.code, juist);
      if (!juist) {
        // Het lukt niet: de hulp verschijnt en blijft tot de juiste toets er is.
        clearTimeout(hulpTimer);
        toonHulp(true);
        wacht = true;
        ctx.later(() => (wacht = false), 900);
        return;
      }
      ramen.get(gevraagd)![aantalAan(gevraagd)]?.classList.add("aan");
      ronde++;
      if (ronde < rondes.length) {
        // Meteen de volgende ronde: een juiste toets die snel volgt, gaat niet verloren.
        startRonde();
        return;
      }
      // Het einde: alle ramen branden, Fien en Jef steken hun duim op (op dezelfde plaats).
      klaar = true;
      clearTimeout(hulpTimer);
      toonHulp(false);
      for (const w of woorden.values()) w.classList.remove("aan-de-beurt");
      scherm.voortgang.zetBalk(rondes.length, rondes.length);
      // De slotzin is wat Fien en Jef zeggen: hij komt in hun tekstballon, op de
      // plaats van de doelzin. De opdracht is klaar: op haar plaats komt de knop Verder.
      scherm.zetFiguren("duim");
      scherm.zetDoel(t("lichtaan.klaar"));
      scherm.verbergOpdracht();
      ctx.zeg(t("lichtaan.klaar"));
      scherm.toonEnter();
    },
    opruimen() {
      clearTimeout(hulpTimer);
      ctx.toetsenbord.toonRij(null);
    },
  };
};
