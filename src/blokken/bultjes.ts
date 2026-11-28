// Voel de bultjes (les 0, stap 6): het kind sluit de ogen, voelt met de
// wijsvingers de twee bultjes en drukt ze allebei in. Drie keer; tussenin
// gaan de handen in de schoot.
//
// - De app kijkt naar de toetscodes KeyF en KeyJ: de twee toetsen met een
//   bultje, los van de indeling. De letters f en j worden hier niet genoemd:
//   dat doet les 1.
// - Twee kaartjes met een bultje (zonder letter) worden blauw, de kleur van de
//   wijsvinger, als de toets ingedrukt is. Op het schermtoetsenbord blijven de
//   twee toetsen branden tot ze allebei gevonden zijn.
// - Een andere toets: "Nog niet. Voel verder over de woonkamer.", en de twee
//   toetsen lichten op het schermtoetsenbord op. De app wacht.
// - Een aanslag gaat nooit verloren: drukt het kind tijdens de pauze tussen
//   twee beurten al een toets in, dan begint de volgende beurt meteen.

import type { BultjesBlok } from "../content/types";
import { el } from "../weergave/dom";
import type { BlokFunctie } from "./context";
import { isAanslag, maakMelding } from "./melding";
import { oefenscherm } from "./oefenscherm";

const BULTJES = ["KeyF", "KeyJ"];
/** zo lang blijft "Gevonden!" staan voor de volgende beurt begint */
const PAUZE_MS = 2200;

export const bultjes: BlokFunctie<BultjesBlok> = (blok, ctx) => {
  let beurt = 0;
  const gevonden = new Set<string>();
  let pauze: number | undefined;
  let inPauze = false;
  let klaar = false;

  const scherm = oefenscherm(ctx, { figuren: "blij", klasse: "blok-groep blok-bultjes", doel: "", figuurHoogte: 150, enterPlaats: "opdracht" });
  const kaartjes = new Map(BULTJES.map((code) => [code, el("div", { class: "bult-kaart kleur-blauw", "aria-hidden": "true" })]));
  const melding = maakMelding();
  scherm.veld.append(el("div", { class: "bult-kaartjes" }, ...kaartjes.values()), melding.element);
  scherm.zetOpdracht(blok.tekst ?? "");
  scherm.voortgang.zetBalk(0, blok.aantal);
  // De getekende handen tonen de twee wijsvingers in kleur.
  ctx.handen.toon(["linkerwijs", "rechterwijs"]);

  function nieuweBeurt(): void {
    clearTimeout(pauze);
    inPauze = false;
    gevonden.clear();
    for (const k of kaartjes.values()) k.classList.remove("aan");
    ctx.toetsenbord.doof();
    ctx.toetsenbord.markeer([]);
    melding.verberg();
  }

  return {
    opToets(e) {
      if (klaar) {
        if (e.key === "Enter" && !e.repeat) ctx.volgende();
        return;
      }
      if (!isAanslag(e)) return;
      if (inPauze) nieuweBeurt();
      if (!BULTJES.includes(e.code)) {
        ctx.toetsenbord.markeer(BULTJES.filter((c) => !gevonden.has(c)));
        melding.toon(blok.fout);
        return;
      }
      gevonden.add(e.code);
      kaartjes.get(e.code)!.classList.add("aan");
      // De bultjes blijven branden tot ze allebei gevonden zijn.
      ctx.toetsenbord.lichtOp(e.code, true);
      ctx.toetsenbord.markeer([]);
      melding.verberg();
      if (gevonden.size < BULTJES.length) return;

      beurt++;
      scherm.voortgang.zetBalk(beurt, blok.aantal);
      if (beurt < blok.aantal) {
        inPauze = true;
        melding.toon(blok.gevonden);
        pauze = window.setTimeout(nieuweBeurt, PAUZE_MS);
        return;
      }
      // Het slot: de bultjes blijven blauw, Fien en Jef zeggen waar "thuis" is.
      klaar = true;
      scherm.zetFiguren("duim");
      scherm.zetDoel(blok.slot, false);
      scherm.verbergOpdracht();
      ctx.zeg(blok.slot);
      scherm.toonEnter();
    },
    opruimen() {
      clearTimeout(pauze);
      ctx.toetsenbord.doof();
    },
  };
};
