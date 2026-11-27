// Spel "Licht aan in het huis" (les 0). Een verdieping knippert; elke toets
// van die rij is goed (herkend via event.code, dus los van de indeling).
// Goed: een raam gaat aan. Fout: de juiste rij licht op, er gaat niets
// verloren en dezelfde ronde begint opnieuw. Alleen de eerste toets per
// ronde telt: tijdens de uitleg na een fout worden toetsen genegeerd, zodat
// rammen niet helpt. Geen tijd, geen punten.

import { t, type TekstSleutel } from "../content";
import type { BlokFunctie } from "../blokken/context";
import type { SpelBlok } from "../content/types";
import { toetsVoorCode, type Rij } from "../logica/indeling";
import { lichtAanRondes } from "../logica/reeksen";
import { el } from "../weergave/dom";
import { schud } from "../blokken/gedeeld";
import { oefenscherm } from "../blokken/oefenscherm";

const VERDIEPINGEN: Rij[] = ["zolder", "woonkamer", "kelder"];
const RAMEN_PER_VERDIEPING = 3;

export const lichtAan: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const rijen = (blok.rijen ?? VERDIEPINGEN) as Rij[];
  const rondes = lichtAanRondes(rijen, blok.rondes ?? 9);
  let ronde = 0;
  let wacht = false;
  let klaar = false;

  const ramen = new Map<Rij, HTMLElement[]>();
  const verdiepingen = new Map<Rij, HTMLElement>();
  const huis = el("div", { class: "huis" }, el("div", { class: "huis-dak", "aria-hidden": "true" }));
  for (const rij of VERDIEPINGEN) {
    const lijst = Array.from({ length: RAMEN_PER_VERDIEPING }, () => el("div", { class: "raam" }));
    ramen.set(rij, lijst);
    const v = el(
      "div",
      { class: "verdieping" },
      el("span", { class: "verdieping-naam" }, t(`rij.${rij}` as TekstSleutel)),
      el("div", { class: "ramen" }, ...lijst),
    );
    verdiepingen.set(rij, v);
    huis.append(v);
  }
  // Het huis staat in het midden in een vaste zone; Fien en Jef staan links. De
  // opdracht wisselt per ronde, maar huis en figuren blijven op hun plaats.
  const scherm = oefenscherm(ctx, { kop: blok.titel, figuren: "zwaai" });
  scherm.element.classList.add("blok-lichtaan");
  scherm.veld.append(huis);

  function startRonde(): void {
    const rij = rondes[ronde];
    for (const [r, v] of verdiepingen) v.classList.toggle("knippert", r === rij);
    scherm.zetOpdracht(t("lichtaan.opdracht", { rij: t(`rij.${rij}` as TekstSleutel) }));
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
        ctx.toetsenbord.lichtRijOp(gevraagd);
        schud(verdiepingen.get(gevraagd)!);
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
      for (const v of verdiepingen.values()) v.classList.remove("knippert");
      for (const lijst of ramen.values()) for (const r of lijst) r.classList.add("aan");
      scherm.zetOpdracht(t("lichtaan.klaar"));
      scherm.toonEnter();
    },
  };
};
