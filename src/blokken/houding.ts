// Les 0, eindoefening "Klaar voor de start": Fien en Jef zeggen "Voeten plat,
// rug recht!". Daarna drukt het kind drie keer de spatiebalk in, telkens als de
// lamp aangaat. Er wordt niets gemeten.
//
// Dezelfde lamp als in "Duim op de spatiebalk": een enkel signaal voor "druk
// nu" in heel les 0. De lamp staat van bij het begin (uit) op een vaste plek.
// Drukt het kind te vroeg, dan verschijnt "Wacht op de lamp." (geen fout).

import { t } from "../content";
import type { EindoefeningBlok } from "../content/types";
import { markeerAfgewerkt } from "../logica/voortgang";
import { lampMetWachtzin, lampTekening } from "../weergave/lamp";
import type { BlokContext, BlokInstantie } from "./context";
import { oefenscherm } from "./oefenscherm";

const AANTAL = 3;

export function houding(_blok: EindoefeningBlok, ctx: BlokContext): BlokInstantie {
  let aan = false;
  let gestart = false;
  let aantal = 0;
  // "Voeten plat, rug recht!" staat in de tekstballon van Fien en Jef, de opdracht
  // staat meteen bovenaan. Vroeger wisselde de opdracht na 2 seconden van tekst.
  const scherm = oefenscherm(ctx, { figuren: "blij", klasse: "blok-houding", doel: t("houding.zeg") });
  const lamp = lampMetWachtzin(t("lamp.wacht"), () => scherm.element, scherm.enter);
  scherm.veld.append(lamp.element);
  ctx.handen.toon(["duim"]);

  function lampAan(): void {
    aan = true;
    lamp.zetAan(true);
    ctx.toetsenbord.markeer(["Space"]);
  }

  // Eerst lezen, dan starten (K28): de lamp gaat pas aan nadat het kind op Start drukt.
  function start(): void {
    if (gestart) return;
    gestart = true;
    scherm.verbergEnter();
    ctx.later(lampAan, 1200);
  }
  scherm.voortgang.zetBalk(0, AANTAL);
  ctx.zeg(t("houding.zeg"));
  scherm.zetOpdracht(t("houding.opdracht"), true, { lamp: () => lampTekening(true) });
  lamp.zetAan(false);
  scherm.toonEnter(start, "start");

  return {
    opToets(e) {
      if (!gestart) {
        if (e.key === "Enter") start();
        else if (e.code === "Space") lamp.teVroeg(t("lamp.eerstStart"));
        return;
      }
      if (e.code !== "Space") return;
      if (!aan) {
        if (aantal < AANTAL) lamp.teVroeg();
        return;
      }
      ctx.toetsenbord.flits("Space", true);
      aan = false;
      lamp.zetAan(false);
      ctx.toetsenbord.markeer([]);
      aantal++;
      scherm.voortgang.zetBalk(aantal, AANTAL);
      if (aantal < AANTAL) {
        ctx.later(lampAan, 1200 + Math.random() * 1000);
      } else {
        markeerAfgewerkt(ctx.app.voortgang, ctx.les.id);
        ctx.app.bewaar();
        scherm.zetOpdracht(t("houding.klaar"));
        ctx.later(() => ctx.volgende(), 1200);
      }
    },
  };
}
