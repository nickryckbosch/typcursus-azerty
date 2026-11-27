// Les 0, eindoefening "Klaar voor de start": Fien en Jef zeggen "Voeten plat,
// rug recht!". Het kind drukt drie keer de spatiebalk in, telkens als Jef in
// zijn handen klapt. Er wordt niets gemeten.
//
// De opdracht staat groot bovenaan, met de spatiebalk getekend. Het signaal
// ("Klap!") staat op een vaste plek in het midden en verschijnt alleen; er
// verschuift niets.

import { t } from "../content";
import type { EindoefeningBlok } from "../content/types";
import { markeerAfgewerkt } from "../logica/voortgang";
import { el } from "../weergave/dom";
import type { BlokContext, BlokInstantie } from "./context";
import { oefenscherm, startVerborgen, toon } from "./oefenscherm";

const AANTAL = 3;

export function houding(blok: EindoefeningBlok, ctx: BlokContext): BlokInstantie {
  let geklapt = false;
  let aantal = 0;
  const scherm = oefenscherm(ctx, { kop: blok.titel, figuren: "blij" });
  const klap = startVerborgen(el("div", { class: "klap", "aria-hidden": "true" }, t("houding.klap")));
  const teller = el("p", { class: "teller" });
  scherm.veld.append(klap, teller);
  ctx.handen.toon(["duim"]);

  function zetTeller(): void {
    teller.textContent = t("houding.teller", { aantal, totaal: AANTAL });
  }

  function klapNu(): void {
    geklapt = true;
    toon(klap);
    ctx.toetsenbord.markeer(["Space"]);
  }

  zetTeller();
  scherm.zetOpdracht(t("houding.zeg"));
  ctx.later(() => {
    scherm.zetOpdracht(t("houding.opdracht"));
    ctx.later(klapNu, 2500);
  }, 2000);

  return {
    opToets(e) {
      if (e.code !== "Space" || !geklapt) return;
      ctx.toetsenbord.flits("Space", true);
      geklapt = false;
      toon(klap, false);
      ctx.toetsenbord.markeer([]);
      aantal++;
      zetTeller();
      if (aantal < AANTAL) {
        ctx.later(klapNu, 1200 + Math.random() * 1000);
      } else {
        markeerAfgewerkt(ctx.app.voortgang, ctx.les.id);
        ctx.app.bewaar();
        scherm.zetOpdracht(t("houding.klaar"));
        ctx.later(() => ctx.volgende(), 1200);
      }
    },
  };
}
