// Spel "Licht aan in het huis" (les 0). Elke toets van de gevraagde rij is goed
// (herkend via event.code, dus los van de indeling). Goed: een raam gaat aan.
// Fout: de juiste rij licht op het toetsenbord op, er gaat niets verloren en
// dezelfde ronde gaat verder. Alleen de eerste toets per ronde telt: na een fout
// wordt de invoer kort genegeerd, zodat rammen niet helpt (zie de lesdata).
// Geen tijd, geen punten.
//
// De tekening (keuze K21 in projectdocument 14, zie docs/stijlgids.md):
// - drie rijen van gelijke hoogte (80) met negen gelijke ramen, net zoals de
//   rijen op het toetsenbord gelijk zijn: zolder in het dak, woonkamer, kelder
//   onder de grondlijn;
// - de woorden staan in een eigen kolom links, nooit over de tekening;
// - de verdieping die aan de beurt is, knippert niet: het vakje van haar woord
//   wordt donker en blijft stil staan (K16: geen decoratieve beweging);
// - de raamkleuren zijn nagemeten (zie docs/stijlgids.md): niet veranderen
//   zonder nieuwe meting.

import { t, type TekstSleutel } from "../content";
import type { BlokFunctie } from "../blokken/context";
import type { SpelBlok } from "../content/types";
import { toetsVoorCode, type Rij } from "../logica/indeling";
import { lichtAanRondes } from "../logica/reeksen";
import { svg } from "../weergave/dom";
import { oefenscherm } from "../blokken/oefenscherm";

const VERDIEPINGEN: Rij[] = ["zolder", "woonkamer", "kelder"];
const RAAM_X = [290, 350, 410];
const RAAM_Y: Record<string, number> = { zolder: 90, woonkamer: 170, kelder: 250 };
const WOORD_Y: Record<string, number> = { zolder: 96, woonkamer: 176, kelder: 256 };
const BRUIN = "#4A2E1A";

/** Het huis zelf, zonder ramen (de referentietekening uit K21). */
function huisTekening(): SVGGElement {
  return svg(
    "g",
    { stroke: BRUIN, "stroke-width": 3, "stroke-linejoin": "round" },
    svg("rect", { x: 200, y: 234, width: 340, height: 86, rx: 8, fill: "#D8BC94" }),
    svg("rect", { x: 200, y: 226, width: 340, height: 12, rx: 6, fill: "#8FC454" }),
    svg("circle", { cx: 220, cy: 223, r: 10, fill: "#6FAE3C" }),
    svg("circle", { cx: 236, cy: 217, r: 14, fill: "#6FAE3C" }),
    svg("circle", { cx: 520, cy: 220, r: 12, fill: "#6FAE3C" }),
    svg("rect", { x: 440, y: 46, width: 24, height: 42, fill: "#E0703F" }),
    svg("rect", { x: 436, y: 40, width: 32, height: 10, rx: 3, fill: "#E0703F" }),
    svg("polygon", { points: "228,150 262,70 478,70 512,150", fill: "#D9503A" }),
    svg("rect", { x: 250, y: 150, width: 240, height: 80, fill: "#FFF3D6" }),
    svg("rect", { x: 250, y: 230, width: 240, height: 80, fill: "#CFC7BA" }),
  );
}

/** Een raam van 40 x 40 met een kruis; de klasse "aan" doet het licht aan (zie stijl.css). */
function raam(x: number, y: number): SVGGElement {
  return svg(
    "g",
    { class: "raam" },
    svg("rect", { class: "raam-glas", x, y, width: 40, height: 40, rx: 5, stroke: BRUIN, "stroke-width": 2.5 }),
    svg("line", { x1: x + 20, y1: y, x2: x + 20, y2: y + 40, stroke: BRUIN, "stroke-width": 2 }),
    svg("line", { x1: x, y1: y + 20, x2: x + 40, y2: y + 20, stroke: BRUIN, "stroke-width": 2 }),
  );
}

/** Het woord van een verdieping in een afgerond vakje, links van de tekening. */
function woord(rij: Rij): SVGGElement {
  const y = WOORD_Y[rij];
  return svg(
    "g",
    { class: "huis-woord" },
    svg("rect", { x: 70, y, width: 100, height: 28, rx: 14, "stroke-width": 1.5, stroke: BRUIN }),
    svg("text", { x: 120, y: y + 14, "text-anchor": "middle", "dominant-baseline": "central" }, t(`rij.${rij}` as TekstSleutel)),
  );
}

export const lichtAan: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const rijen = (blok.rijen ?? VERDIEPINGEN) as Rij[];
  const rondes = lichtAanRondes(rijen, blok.rondes ?? 9);
  let ronde = 0;
  let wacht = false;
  let klaar = false;

  const ramen = new Map<Rij, SVGGElement[]>();
  const woorden = new Map<Rij, SVGGElement>();
  // viewBox: het deel van de referentie (0 0 680 350) waar iets staat, zodat de
  // tekening zo groot mogelijk in haar zone past. De verhoudingen blijven gelijk.
  const huis = svg(
    "svg",
    { class: "huis", viewBox: "62 36 482 288", role: "img", "aria-label": blok.titel, preserveAspectRatio: "xMidYMid meet" },
    huisTekening(),
  );
  for (const rij of VERDIEPINGEN) {
    const lijst = RAAM_X.map((x) => raam(x, RAAM_Y[rij]));
    ramen.set(rij, lijst);
    huis.append(...lijst);
    const w = woord(rij);
    woorden.set(rij, w);
    huis.append(w);
  }

  // Het huis staat in het midden in een vaste zone; Fien en Jef staan links ernaast.
  const scherm = oefenscherm(ctx, { kop: blok.titel, figuren: "zwaai" });
  scherm.element.classList.add("blok-lichtaan");
  scherm.veld.append(huis);

  function startRonde(): void {
    const rij = rondes[ronde];
    for (const [r, w] of woorden) w.classList.toggle("aan-de-beurt", r === rij);
    scherm.zetOpdracht(t("lichtaan.opdracht", { rij: t(`rij.${rij}` as TekstSleutel) }));
    scherm.zetVoortgang(ronde, rondes.length);
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
        // De juiste rij licht op het toetsenbord op; het huis beweegt niet.
        ctx.toetsenbord.lichtRijOp(gevraagd);
        wacht = true;
        ctx.later(() => (wacht = false), 900);
        return;
      }
      ramen.get(gevraagd)![aantalAan(gevraagd)]?.classList.add("aan");
      ronde++;
      if (ronde < rondes.length) {
        // Meteen de volgende ronde: de volgende toets telt al.
        startRonde();
        return;
      }
      klaar = true;
      for (const w of woorden.values()) w.classList.remove("aan-de-beurt");
      for (const lijst of ramen.values()) for (const r of lijst) r.classList.add("aan");
      scherm.zetVoortgang(rondes.length, rondes.length);
      scherm.zetOpdracht(t("lichtaan.klaar"));
      scherm.toonEnter();
    },
  };
};
