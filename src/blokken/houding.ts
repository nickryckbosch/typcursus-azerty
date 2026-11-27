// Les 0, eindoefening "Klaar voor de start": Fien en Jef zeggen "Voeten plat,
// rug recht!". Het kind drukt drie keer de spatiebalk in, telkens als Jef in
// zijn handen klapt. Er wordt niets gemeten.

import { t } from "../content";
import type { EindoefeningBlok } from "../content/types";
import { markeerAfgewerkt } from "../logica/voortgang";
import { el } from "../weergave/dom";
import { fien, jef } from "../weergave/figuren";
import type { BlokContext, BlokInstantie } from "./context";

const AANTAL = 3;

export function houding(blok: EindoefeningBlok, ctx: BlokContext): BlokInstantie {
  let geklapt = false;
  let aantal = 0;
  const klap = el("div", { class: "klap", "aria-hidden": "true" }, t("houding.klap"));
  const tekst = el("p", { class: "grote-tekst" }, t("houding.zeg"));
  const teller = el("p", { class: "teller" }, t("houding.teller", { aantal, totaal: AANTAL }));
  ctx.podium.append(
    el("div", { class: "blok blok-houding" }, el("h2", {}, blok.titel), el("div", { class: "figuren" }, fien(), jef(), klap), tekst, teller),
  );
  ctx.zeg(`${t("houding.zeg")} ${t("houding.uitleg")}`);
  ctx.handen.toon(["duim"]);

  function klapNu(): void {
    geklapt = true;
    klap.classList.add("aan");
    tekst.textContent = t("houding.druk");
    ctx.toetsenbord.markeer(["Space"]);
  }

  ctx.later(() => {
    tekst.textContent = t("houding.uitleg");
    ctx.later(klapNu, 2500);
  }, 2000);

  return {
    opToets(e) {
      if (e.code !== "Space" || !geklapt) return;
      ctx.toetsenbord.flits("Space", true);
      geklapt = false;
      klap.classList.remove("aan");
      ctx.toetsenbord.markeer([]);
      aantal++;
      teller.textContent = t("houding.teller", { aantal, totaal: AANTAL });
      if (aantal < AANTAL) {
        tekst.textContent = t("houding.wacht");
        ctx.later(klapNu, 1200 + Math.random() * 1000);
      } else {
        markeerAfgewerkt(ctx.app.voortgang, ctx.les.id);
        ctx.app.bewaar();
        tekst.textContent = t("houding.klaar");
        ctx.later(() => ctx.volgende(), 1200);
      }
    },
  };
}
