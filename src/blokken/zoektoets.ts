// Zoek de toets: een letter verschijnt groot, het kind drukt de toets.
// Hier is de hulp altijd zichtbaar: toets en vinger lichten op.
// Bestaat het blok alleen uit de spatie (les 0), dan gaat er een lampje aan
// en mag het kind pas drukken als het brandt.

import { t } from "../content";
import type { ZoekToetsBlok } from "../content/types";
import { zoekReeks } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken } from "../logica/typen";
import { el } from "../weergave/dom";
import { tekenTonen } from "../weergave/tekens";
import type { BlokFunctie } from "./context";

export const zoekToets: BlokFunctie<ZoekToetsBlok> = (blok, ctx) => {
  const reeks = zoekReeks(blok.toetsen, blok.nadruk, blok.aantal);
  const oef = nieuweOefening(reeks.join(""));
  const metLampje = blok.toetsen.every((x) => x === " ");
  let lampAan = !metLampje;

  const kaart = el("div", { class: "grote-toets" });
  const lamp = el("div", { class: "lamp", "aria-hidden": "true" });
  const teller = el("p", { class: "teller" });
  ctx.podium.append(
    el(
      "div",
      { class: "blok blok-zoek" },
      el("p", { class: "opdracht" }, blok.tekst ?? ""),
      metLampje ? lamp : null,
      kaart,
      teller,
    ),
  );
  ctx.zeg(blok.tekst ?? "");

  function toonHuidig(): void {
    const teken = volgendTeken(oef);
    if (teken === null) return;
    kaart.textContent = tekenTonen(teken);
    kaart.classList.toggle("is-spatie", teken === " ");
    kaart.hidden = !lampAan;
    lamp.classList.toggle("aan", lampAan);
    teller.textContent = t("teller", { nummer: oef.positie + 1, totaal: reeks.length });
    ctx.toonHulp(lampAan ? teken : null);
  }

  function zetLampAan(): void {
    lampAan = true;
    toonHuidig();
  }

  if (metLampje) ctx.later(zetLampAan, 900);
  toonHuidig();

  return {
    opToets(e) {
      if (!teltAlsTeken(e) || !lampAan) return;
      const { juist, klaar } = typ(oef, e.key, performance.now());
      ctx.toetsenbord.flits(e.code, juist);
      if (!juist) {
        // Niets schudt: alleen de juiste toets en vinger lichten sterker op.
        ctx.toonFout(volgendTeken(oef));
        return;
      }
      if (klaar) {
        ctx.bewaarPoging([oef]);
        ctx.toonHulp(null);
        ctx.later(() => ctx.volgende(), 400);
        return;
      }
      if (metLampje) {
        lampAan = false;
        toonHuidig();
        ctx.later(zetLampAan, 700 + Math.random() * 800);
      } else {
        toonHuidig();
      }
    },
  };
};
