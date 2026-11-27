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
  const scherm = oefenscherm(ctx, { figuren: "blij", klasse: "blok-houding" });
  const lamp = lampMetWachtzin(t("lamp.wacht"), () => scherm.element);
  scherm.veld.append(lamp.element);
  ctx.handen.toon(["duim"]);

  function lampAan(): void {
    aan = true;
    lamp.zetAan(true);
    ctx.toetsenbord.markeer(["Space"]);
  }

  scherm.voortgang.zetBalk(0, AANTAL);
  scherm.zetOpdracht(t("houding.zeg"));
  ctx.later(() => {
    gestart = true;
    scherm.zetOpdracht(t("houding.opdracht"), true, { lamp: () => lampTekening(true) });
    lamp.zetAan(false);
    ctx.later(lampAan, 2500);
  }, 2000);

  return {
    opToets(e) {
      if (e.code !== "Space") return;
      if (!aan) {
        if (gestart && aantal < AANTAL) lamp.teVroeg();
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
