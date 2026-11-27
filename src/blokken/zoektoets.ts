// Zoek de toets: een letter verschijnt groot, het kind drukt de toets.
// Hier is de hulp altijd zichtbaar: toets en vinger lichten op.
// Bestaat het blok alleen uit de spatie (les 0), dan gaat er een lamp aan en
// mag het kind pas drukken als ze brandt. Lamp en kaart staan er van bij het
// begin en veranderen nooit van plaats; alleen hun zichtbaarheid wisselt.

import type { ZoekToetsBlok } from "../content/types";
import { zoekReeks } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken } from "../logica/typen";
import { el } from "../weergave/dom";
import { lampTekening } from "../weergave/lamp";
import { tekenTonen } from "../weergave/tekens";
import type { BlokFunctie } from "./context";
import { nieuweKaart, schud } from "./gedeeld";
import { oefenscherm, startVerborgen, toon } from "./oefenscherm";

export const zoekToets: BlokFunctie<ZoekToetsBlok> = (blok, ctx) => {
  const reeks = zoekReeks(blok.toetsen, blok.nadruk, blok.aantal);
  const oef = nieuweOefening(reeks.join(""));
  const metLamp = blok.toetsen.every((x) => x === " ");
  let lampAan = !metLamp;

  const scherm = oefenscherm(ctx, { kop: blok.titel });
  // De lamp staat van bij het begin (uit) in beeld, op een vaste plek vlak onder de opdracht.
  const lamp = lampTekening();
  const kaart = startVerborgen(el("div", { class: "grote-toets" }));
  if (metLamp) scherm.veld.append(lamp);
  scherm.veld.append(kaart);
  // In de opdracht staat naast het woord "lamp" een klein beeldje van dezelfde lamp.
  scherm.zetOpdracht(blok.tekst ?? "", true, metLamp ? { lamp: () => lampTekening(true) } : {});

  function toonHuidig(): void {
    const teken = volgendTeken(oef);
    if (teken === null) return;
    kaart.textContent = tekenTonen(teken);
    kaart.classList.toggle("is-spatie", teken === " ");
    toon(kaart, lampAan);
    for (const l of scherm.element.querySelectorAll(".lamp-tekening")) l.classList.toggle("aan", lampAan);
    scherm.zetVoortgang(oef.positie, reeks.length);
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
        scherm.zetVoortgang(reeks.length, reeks.length);
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
