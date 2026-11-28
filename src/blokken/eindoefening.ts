// Eindoefening: bepaalt of de volgende les opengaat (minstens 90% van de
// posities meteen juist; ook voor de korte versie).
// Na twee mislukte pogingen op rij komt de korte versie, met een aanmoediging
// van Fien en Jef.

import { t } from "../content";
import type { EindoefeningBlok } from "../content/types";
import { woordenPerMinuut } from "../logica/typen";
import { DOEL_NAUWKEURIGHEID, moetKortZijn, registreerEindoefening } from "../logica/voortgang";
import { el } from "../weergave/dom";
import type { BlokFunctie, BlokInstantie } from "./context";
import { typRegels } from "./typregels";
import { oefenscherm } from "./oefenscherm";

export const eindoefening: BlokFunctie<EindoefeningBlok> = (blok, ctx) => {
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
      // De korte versie telt weinig tekens: 90% laat daar maar een fout toe,
      // terwijl de gewone versie er vier toelaat. Wie de korte versie krijgt,
      // heeft het net moeilijk: daar mogen altijd twee fouten.
      const doel = blok.doelNauwkeurigheid ?? DOEL_NAUWKEURIGHEID;
      const { gehaald, sterren } = registreerEindoefening(
        ctx.app.voortgang,
        ctx.les.id,
        nauwk,
        woordenPerMinuut(tekens, duur),
        kort ? Math.min(doel, (tekens - 2) / tekens) : doel,
      );
      ctx.app.bewaar();
      ctx.sessie.resultaat = { nauwkeurigheid: nauwk, gehaald, sterren, kort };
      ctx.volgende();
    }, blok.tip);
  }

  // Eerst lezen, dan starten (K28): de eindoefening beslist of de volgende les
  // opengaat. Ze begint pas na de knop Start, zodat een toets die nog bij de
  // vorige oefening hoorde, niet als fout telt. Bij de korte versie staat hier
  // de aanmoediging.
  const zin = kort ? t("eind.aanmoediging") : (blok.tekst ?? "");
  const scherm = oefenscherm(ctx, { figuren: kort ? "aanmoedigend" : "blij", opbouw: "midden", klasse: "blok-intro" });
  scherm.veld.append(el("div", { class: "ballon" }, el("p", { class: "grote-tekst" }, zin)));
  scherm.toonEnter(start, "start");
  ctx.zeg(zin);

  return {
    opToets(e) {
      if (actief) actief.opToets?.(e);
      else if (e.key === "Enter" && !e.repeat) start();
    },
    opruimen() {
      actief?.opruimen?.();
    },
  };
};
