// Eindoefening: bepaalt of de volgende les opengaat (minstens 90% juist).
// Na twee mislukte pogingen op rij komt de korte versie, met een aanmoediging
// van Fien en Jef. In les 0 is het een houdingsoefening zonder meting.

import { t } from "../content";
import type { EindoefeningBlok } from "../content/types";
import { nauwkeurigheid, woordenPerMinuut } from "../logica/typen";
import { DOEL_NAUWKEURIGHEID, moetKortZijn, registreerEindoefening } from "../logica/voortgang";
import { el } from "../weergave/dom";
import type { BlokFunctie, BlokInstantie } from "./context";
import { houding } from "./houding";
import { typRegels } from "./typregels";
import { enterHint, metFienEnJef } from "./gedeeld";

export const eindoefening: BlokFunctie<EindoefeningBlok> = (blok, ctx) => {
  if (blok.soort === "houding") return houding(blok, ctx);

  const kort = moetKortZijn(ctx.app.voortgang, ctx.les.id) && (blok.regelsKort?.length ?? 0) > 0;
  const regels = kort ? blok.regelsKort! : blok.regels;
  let actief: BlokInstantie | null = null;

  function start(): void {
    ctx.podium.replaceChildren();
    ctx.toetsenbord.toonEnter(false);
    ctx.toonToetsenbord(true);
    actief = typRegels(ctx, regels, blok.tekst ?? "", (oefeningen) => {
      const aanslagen = oefeningen.flatMap((o) => o.aanslagen);
      const nauwk = nauwkeurigheid(aanslagen);
      const tekens = oefeningen.reduce((som, o) => som + o.doel.length, 0);
      const duur = oefeningen.reduce((som, o) => som + ((o.eindTijd ?? 0) - (o.startTijd ?? 0)), 0);
      ctx.bewaarAanslagen(aanslagen);
      const { gehaald, sterren } = registreerEindoefening(
        ctx.app.voortgang,
        ctx.les.id,
        nauwk,
        woordenPerMinuut(tekens, duur),
        blok.doelNauwkeurigheid ?? DOEL_NAUWKEURIGHEID,
      );
      ctx.app.bewaar();
      ctx.sessie.resultaat = { nauwkeurigheid: nauwk, gehaald, sterren, kort };
      ctx.volgende();
    }, blok.tip);
  }

  if (!kort) {
    start();
  } else {
    // Eerst een aanmoediging, dan de korte oefening.
    ctx.toonToetsenbord(false);
    ctx.podium.append(
      el(
        "div",
        { class: "blok blok-intro" },
        metFienEnJef("aanmoedigend", el("div", { class: "ballon" }, el("p", { class: "grote-tekst" }, t("eind.aanmoediging")))),
        enterHint(ctx, start),
      ),
    );
    ctx.zeg(t("eind.aanmoediging"));
  }

  return {
    opToets(e) {
      if (actief) actief.opToets?.(e);
      else if (e.key === "Enter") start();
    },
    opruimen() {
      actief?.opruimen?.();
    },
  };
};
