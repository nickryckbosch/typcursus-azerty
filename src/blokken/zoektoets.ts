// Zoek de toets: een letter verschijnt groot, het kind drukt de toets.
// Hier is de hulp altijd zichtbaar: toets en vinger lichten op.
//
// Bestaat het blok alleen uit de spatie (les 0, "Duim op de spatiebalk"), dan
// staat er een getekende lamp. Ze staat van bij het begin (uit) in beeld, op
// een vaste plek, en gaat zichtbaar aan: dan mag het kind drukken. Een doel,
// een voorwerp, een signaal: er komt geen kaart "spatie" meer bij.
//
// Een aanslag gaat nooit verloren: de volgende letter is geldig vanaf het
// moment dat de vorige juist getypt is, en op het einde gaat het blok meteen
// verder (geen wachttijd waarin toetsen genegeerd worden).

import type { ZoekToetsBlok } from "../content/types";
import { zoekReeks } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken } from "../logica/typen";
import { el } from "../weergave/dom";
import { lampTekening } from "../weergave/lamp";
import { tekenTonen } from "../weergave/tekens";
import type { BlokFunctie } from "./context";
import { oefenscherm } from "./oefenscherm";

export const zoekToets: BlokFunctie<ZoekToetsBlok> = (blok, ctx) => {
  const reeks = zoekReeks(blok.toetsen, blok.nadruk, blok.aantal);
  const oef = nieuweOefening(reeks.join(""));
  const metLamp = blok.toetsen.every((x) => x === " ");
  let lampAan = !metLamp;

  const scherm = oefenscherm(ctx, { klasse: "blok-zoek" });
  const letter = el("span", {});
  const kaart = el("div", { class: "grote-toets" }, letter);
  scherm.veld.append(metLamp ? lampTekening() : kaart);
  // In de opdracht staat naast het woord "lamp" een klein beeldje van dezelfde lamp.
  scherm.zetOpdracht(blok.tekst ?? "", true, metLamp ? { lamp: () => lampTekening(true) } : {});

  function toonHuidig(): void {
    const teken = volgendTeken(oef);
    scherm.voortgang.zetBalk(oef.positie, reeks.length);
    if (teken === null) return;
    letter.textContent = tekenTonen(teken);
    kaart.classList.toggle("is-spatie", teken === " ");
    for (const l of scherm.element.querySelectorAll(".lamp-tekening")) l.classList.toggle("aan", lampAan);
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
        // Niets schudt: alleen de juiste toets en vinger lichten sterker op.
        ctx.toonFout(volgendTeken(oef));
        return;
      }
      if (klaar) {
        ctx.bewaarPoging([oef]);
        ctx.volgende();
        return;
      }
      if (metLamp) {
        // De lamp gaat uit en na een korte, wisselende tijd weer aan.
        lampAan = false;
        toonHuidig();
        ctx.later(zetLampAan, 700 + Math.random() * 800);
      } else {
        toonHuidig();
      }
    },
  };
};
