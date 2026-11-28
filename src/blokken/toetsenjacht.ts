// Toetsenjacht (les 0, stap 5): het kind leert vier toetsen bij naam: de
// spatiebalk, Enter, Backspace en Shift. De toets staat groot getekend, zoals
// op een Belgische Chromebook, met haar naam eronder. Fien en Jef zeggen in
// hun tekstballon wat de toets doet.
//
// Eerst de vier toetsen in de volgorde van de lesdata: het schermtoetsenbord
// wijst de toets aan. Daarna de herhaling, zonder hulp; pas na een verkeerde
// toets wijst het toetsenbord ze aan. Een verkeerde toets is geen fout die
// telt: de app wacht gewoon op de juiste.
//
// - De app werkt met toetscodes, los van de indeling. Linker en rechter Shift
//   zijn allebei goed.
// - Enter betekent in deze stap niet "Verder": het is een van de vier toetsen.
//   Pas op het einde komt de knop Verder. De laatste gevraagde toets is nooit
//   Enter (test in tests/inhoud.test.ts), zodat een Enter die nog bij de
//   oefening hoorde het slot niet overslaat.
// - Een aanslag gaat nooit verloren; een ingehouden toets telt een keer.

import type { NaamToets, ToetsenjachtBlok } from "../content/types";
import { el, svg } from "../weergave/dom";
import { vinkje } from "../weergave/figuren";
import type { BlokFunctie } from "./context";
import { isAanslag, maakMelding } from "./melding";
import { oefenscherm } from "./oefenscherm";

const CODES: Record<NaamToets, string[]> = {
  spatie: ["Space"],
  enter: ["Enter", "NumpadEnter"],
  backspace: ["Backspace"],
  shift: ["ShiftLeft", "ShiftRight"],
};

// De vier toetsen, getekend zoals op een Belgische Chromebook (tekenvlak 360 op
// 150): de vorm van de toets en het teken dat erop staat. De spatiebalk is een
// lange lege toets, Enter heeft de vorm van een omgekeerde L met een hoekpijl,
// Backspace een pijl naar links, Shift een open pijl naar boven. De tekens zijn
// getekend (geen letterteken): zo zien ze er op elk toestel hetzelfde uit.
const rechthoek = (x: number, y: number, b: number, h: number, r = 10): string =>
  `M ${x + r} ${y} H ${x + b - r} Q ${x + b} ${y} ${x + b} ${y + r} V ${y + h - r} Q ${x + b} ${y + h} ${x + b - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

const TEKENING: Record<NaamToets, { vorm: string; teken: string }> = {
  spatie: { vorm: rechthoek(10, 46, 340, 52), teken: "" },
  enter: {
    vorm: "M 132 8 H 238 Q 248 8 248 18 V 124 Q 248 134 238 134 H 168 Q 158 134 158 124 V 78 Q 158 68 148 68 H 132 Q 122 68 122 58 V 18 Q 122 8 132 8 Z",
    teken: "M 224 34 V 92 H 184 M 199 77 L 184 92 L 199 107",
  },
  backspace: { vorm: rechthoek(85, 30, 190, 84), teken: "M 218 72 H 144 M 163 53 L 144 72 L 163 91" },
  shift: { vorm: rechthoek(70, 30, 220, 84), teken: "M 180 48 L 205 76 H 192 V 97 H 168 V 76 H 155 Z" },
};

function tekenToets(soort: NaamToets): SVGSVGElement {
  const { vorm, teken } = TEKENING[soort];
  return svg(
    "svg",
    { class: `jacht-toets ${soort === "spatie" ? "kleur-grijs" : "kleur-paars"}`, viewBox: "0 0 360 150", "aria-hidden": "true" },
    // De streep onderaan in de vingerkleur, zoals bij de toetsen van het schermtoetsenbord.
    svg("path", { class: "jacht-streep", d: vorm, transform: "translate(0 8)" }),
    svg("path", { class: "jacht-vorm", d: vorm }),
    ...(teken ? [svg("path", { class: "jacht-teken", d: teken })] : []),
  );
}

export const toetsenjacht: BlokFunctie<ToetsenjachtBlok> = (blok, ctx) => {
  const perToets = new Map(blok.naamtoetsen.map((x) => [x.toets, x]));
  const reeks: NaamToets[] = [...blok.naamtoetsen.map((x) => x.toets), ...blok.herhaling];
  const eersteRonde = blok.naamtoetsen.length;
  let i = 0;
  let klaar = false;

  const eerste = perToets.get(reeks[0]);
  const scherm = oefenscherm(ctx, {
    figuren: "blij",
    klasse: "blok-groep blok-jacht",
    doel: eerste?.zin ?? "",
    figuurHoogte: 150,
    enterPlaats: "opdracht",
  });
  // De toets groot, in een vak met een vaste maat; haar naam eronder; daaronder
  // de vaste plek voor de melding.
  const vak = el("div", { class: "jacht-vak" });
  const naam = el("p", { class: "jacht-naam" });
  const melding = maakMelding();
  scherm.veld.append(vak, naam, melding.element);
  scherm.zetOpdracht(blok.tekst ?? "");
  ctx.toetsenbord.toonNaamtoetsen(true);

  function toonHuidige(): void {
    const soort = reeks[i];
    const info = perToets.get(soort);
    scherm.voortgang.zetBalk(i, reeks.length);
    vak.replaceChildren(tekenToets(soort));
    naam.textContent = info?.naam ?? "";
    scherm.zetDoel(info?.zin ?? "", false);
    if (info) ctx.zeg(info.zin);
    melding.verberg();
    // De eerste keer wijst het schermtoetsenbord de toets aan.
    ctx.toetsenbord.markeer(i < eersteRonde ? CODES[soort] : []);
  }

  toonHuidige();

  return {
    opToets(e) {
      if (klaar) {
        if (e.key === "Enter" && !e.repeat) ctx.volgende();
        return;
      }
      if (!isAanslag(e)) return;
      const soort = reeks[i];
      if (!CODES[soort].includes(e.code)) {
        // Nog niet: het toetsenbord wijst de toets aan, de app wacht op de juiste.
        ctx.toetsenbord.markeer(CODES[soort]);
        ctx.toetsenbord.benadruk();
        melding.toon(blok.fout);
        return;
      }
      ctx.toetsenbord.lichtOp(e.code);
      i++;
      if (i < reeks.length) {
        toonHuidige();
        return;
      }
      // Het slot: Fien en Jef zeggen de slotzin, de knop Verder komt op de plaats van de opdracht.
      klaar = true;
      scherm.voortgang.zetBalk(reeks.length, reeks.length);
      ctx.toetsenbord.markeer([]);
      melding.verberg();
      // Op de plaats van de toets komt een vinkje: klaar. Haar naam verdwijnt (de plaats blijft).
      vak.replaceChildren(vinkje(96));
      naam.textContent = "\u00A0";
      scherm.zetFiguren("duim");
      scherm.zetDoel(blok.slot, false);
      scherm.verbergOpdracht();
      ctx.zeg(blok.slot);
      scherm.toonEnter();
    },
    opruimen() {
      ctx.toetsenbord.toonNaamtoetsen(false);
      ctx.toetsenbord.doof();
    },
  };
};
