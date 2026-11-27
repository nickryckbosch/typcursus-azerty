// Eindoefening: bepaalt of de volgende les opengaat (minstens 90% van de
// posities meteen juist; ook voor de korte versie).
// Na twee mislukte pogingen op rij komt de korte versie, met een aanmoediging
// van Fien en Jef. In les 0 is het een houdingsoefening zonder meting.

import { t } from "../content";
import type { EindoefeningBlok } from "../content/types";
import { woordenPerMinuut } from "../logica/typen";
import { DOEL_NAUWKEURIGHEID, moetKortZijn, registreerEindoefening } from "../logica/voortgang";
import { el } from "../weergave/dom";
import type { BlokFunctie, BlokInstantie } from "./context";
import { houding } from "./houding";
import { typRegels } from "./typregels";
import { oefenscherm } from "./oefenscherm";

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
      // Nauwkeurigheid = posities meteen juist / posities (een fout telt een keer per positie).
      const nauwk = ctx.bewaarPoging(oefeningen);
      const tekens = oefeningen.reduce((som, o) => som + o.doel.length, 0);
      const duur = oefeningen.reduce((som, o) => som + ((o.eindTijd ?? 0) - (o.startTijd ?? 0)), 0);
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
    const scherm = oefenscherm(ctx, { figuren: "aanmoedigend", klasse: "blok-intro" });
    scherm.veld.append(el("div", { class: "ballon" }, el("p", { class: "grote-tekst" }, t("eind.aanmoediging"))));
    scherm.toonEnter(start);
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
