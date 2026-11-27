// Intro: Fien en Jef vertellen wat er komt. De nieuwe toetsen en vingers lichten op.

import type { IntroBlok } from "../content/types";
import { toetsVoorTeken } from "../logica/indeling";
import { el } from "../weergave/dom";
import { t } from "../content";
import { maakHuis } from "../spellen/lichtaan";
import type { BlokFunctie } from "./context";
import { oefenscherm } from "./oefenscherm";

export const intro: BlokFunctie<IntroBlok> = (blok, ctx) => {
  const toetsen = ctx.les.nieuweToetsen.map((teken) => toetsVoorTeken(teken)?.toets).filter((x) => x !== undefined);
  ctx.toetsenbord.markeer(toetsen.map((x) => x.code));
  ctx.handen.toon(toetsen.map((x) => x.vinger));

  // Fien en Jef links op hun vaste plaats, wat ze zeggen in een tekstballon ernaast.
  const scherm = oefenscherm(ctx, { figuren: "zwaai", klasse: blok.prent === "huis" ? "blok-intro met-huis" : "blok-intro" });
  const ballon = el("div", { class: "ballon" }, el("p", { class: "grote-tekst" }, blok.tekst ?? ""));
  if (blok.prent === "huis") {
    // Les 0: het huis van "Licht aan in het huis" (alle ramen uit, het dak leeg),
    // zodat woord en beeld kloppen en het kind het huis al kent voor het spel.
    scherm.veld.append(el("div", { class: "intro-prent" }, maakHuis(t("intro.huis")).svg, ballon));
  } else {
    scherm.veld.append(ballon);
  }
  scherm.toonEnter();
  ctx.zeg(blok.tekst ?? "");

  return {
    opToets(e) {
      if (e.key === "Enter") ctx.volgende();
    },
  };
};
