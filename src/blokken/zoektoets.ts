// Zoek de toets: een letter verschijnt groot, het kind drukt de toets.
// Hier is de hulp altijd zichtbaar: toets en vinger lichten op.
//
// Bestaat het blok alleen uit de spatie (les 0, "Duim op de spatiebalk"), dan
// staat er een getekende lamp. Ze staat van bij het begin (uit) in beeld, op
// een vaste plek, en gaat zichtbaar aan: dan mag het kind drukken. Een doel,
// een voorwerp, een signaal: er komt geen kaart "spatie" meer bij. Drukt het
// kind te vroeg, dan verschijnt onder de lamp "Wacht op de lamp." (geen fout).
//
// Bij de spatie staat in de kaart een getekende spatiebalk in plaats van het
// woord "spatie": de spatie is geen letter.
//
// Een aanslag gaat nooit verloren: de volgende letter is geldig vanaf het
// moment dat de vorige juist getypt is, en op het einde gaat het blok meteen
// verder (geen wachttijd waarin toetsen genegeerd worden).

import type { ZoekToetsBlok } from "../content/types";
import { zoekReeks } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken } from "../logica/typen";
import { el } from "../weergave/dom";
import { t } from "../content";
import { lampMetWachtzin, lampTekening } from "../weergave/lamp";
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
  // De spatie is geen letter: in de kaart staat dan een getekende spatiebalk (zelfde kaartmaat).
  const spatiebalk = el("span", { class: "spatiebalk-tekening", role: "img", "aria-label": t("teken.spatie"), hidden: true });
  const kaart = el("div", { class: "grote-toets" }, letter, spatiebalk);
  const lamp = lampMetWachtzin(t("lamp.wacht"), () => scherm.element, metLamp ? scherm.enter : undefined);
  scherm.veld.append(metLamp ? lamp.element : kaart);
  // In de opdracht staat naast het woord "lamp" een klein beeldje van dezelfde lamp.
  scherm.zetOpdracht(blok.tekst ?? "", true, metLamp ? { lamp: () => lampTekening(true) } : {});

  function toonHuidig(): void {
    const teken = volgendTeken(oef);
    scherm.voortgang.zetBalk(oef.positie, reeks.length);
    if (teken === null) return;
    const isSpatie = teken === " ";
    letter.textContent = isSpatie ? "" : tekenTonen(teken);
    letter.hidden = isSpatie;
    spatiebalk.hidden = !isSpatie;
    if (metLamp) lamp.zetAan(lampAan);
    ctx.toonHulp(lampAan ? teken : null);
  }

  function zetLampAan(): void {
    lampAan = true;
    toonHuidig();
  }

  // Eerst lezen, dan starten (K28): de lamp gaat pas aan nadat het kind op
  // Start drukt (Enter of de knop). Zo kan het de opdracht eerst rustig lezen.
  let gestart = !metLamp;
  function start(): void {
    if (gestart) return;
    gestart = true;
    scherm.verbergEnter();
    ctx.later(zetLampAan, 900);
  }
  if (metLamp) scherm.toonEnter(start, "start");
  toonHuidig();

  return {
    opToets(e) {
      if (!gestart) {
        if (e.key === "Enter") start();
        // De spatiebalk voor de start: wel een reactie, maar de lamp komt pas na Start.
        else if (teltAlsTeken(e)) lamp.teVroeg(t("lamp.eerstStart"));
        return;
      }
      if (!teltAlsTeken(e)) return;
      if (!lampAan) {
        // Te vroeg: geen fout, maar wel een reactie, anders voelt de toets kapot.
        lamp.teVroeg();
        return;
      }
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
        // Een nieuwe kaart: de letter verschijnt kort opnieuw. Zo zie je ook bij twee
        // keer dezelfde letter dat de vorige toets telde. Alleen visueel, er beweegt niets.
        letter.classList.remove("verschijnt");
        void letter.offsetWidth;
        letter.classList.add("verschijnt");
      }
    },
  };
};
