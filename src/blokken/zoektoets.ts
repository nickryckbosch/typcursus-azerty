// Zoek de toets: een letter verschijnt groot, het kind drukt de toets.
// Hier is de hulp altijd zichtbaar: toets en vinger lichten op.
// Bestaat het blok alleen uit de spatie (les 0), dan gaat er een lamp aan en
// mag het kind pas drukken als ze brandt. Lamp en kaart staan er van bij het
// begin en veranderen nooit van plaats; alleen hun zichtbaarheid wisselt.

import { t } from "../content";
import type { ZoekToetsBlok } from "../content/types";
import { zoekReeks } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken } from "../logica/typen";
import { el } from "../weergave/dom";
import { tekenTonen } from "../weergave/tekens";
import type { BlokFunctie } from "./context";
import { nieuweKaart, schud } from "./gedeeld";
import { oefenscherm, startVerborgen, toon } from "./oefenscherm";

export const zoekToets: BlokFunctie<ZoekToetsBlok> = (blok, ctx) => {
  const reeks = zoekReeks(blok.toetsen, blok.nadruk, blok.aantal);
  const oef = nieuweOefening(reeks.join(""));
  const metLamp = blok.toetsen.every((x) => x === " ");
  let lampAan = !metLamp;

  const scherm = oefenscherm(ctx);
  const lamp = el("div", { class: "lamp", "aria-hidden": "true" });
  const kaart = startVerborgen(el("div", { class: "grote-toets" }));
  if (metLamp) scherm.veld.append(lamp);
  scherm.veld.append(kaart);
  scherm.zetOpdracht(blok.tekst ?? "");

  function toonHuidig(): void {
    const teken = volgendTeken(oef);
    if (teken === null) return;
    kaart.textContent = tekenTonen(teken);
    kaart.classList.toggle("is-spatie", teken === " ");
    toon(kaart, lampAan);
    lamp.classList.toggle("aan", lampAan);
    scherm.zetKop(`${blok.titel} · ${t("teller", { nummer: oef.positie + 1, totaal: reeks.length })}`);
    ctx.toonHulp(lampAan ? teken : null);
  }

  function zetLampAan(): void {
    lampAan = true;
    toonHuidig();
  }

  if (metLamp) ctx.later(zetLampAan, 900);
  toonHuidig();

  return {
    opToets(e) {
      if (!teltAlsTeken(e) || !lampAan) return;
      const { juist, klaar } = typ(oef, e.key, performance.now());
      ctx.toetsenbord.flits(e.code, juist);
      if (!juist) {
        schud(kaart);
        return;
      }
      if (klaar) {
        // Meteen verder: een aanslag mag nooit verloren gaan in een wachttijd.
        ctx.bewaarAanslagen(oef.aanslagen);
        ctx.volgende();
        return;
      }
      if (metLamp) {
        lampAan = false;
        toonHuidig();
        ctx.later(zetLampAan, 700 + Math.random() * 800);
      } else {
        toonHuidig();
        nieuweKaart(kaart);
      }
    },
  };
};
