// Intro: Fien en Jef vertellen wat er komt. De nieuwe toetsen en vingers lichten op.

import type { IntroBlok } from "../content/types";
import { toetsVoorTeken } from "../logica/indeling";
import { el } from "../weergave/dom";
import type { BlokFunctie } from "./context";
import { oefenscherm } from "./oefenscherm";

export const intro: BlokFunctie<IntroBlok> = (blok, ctx) => {
  const toetsen = ctx.les.nieuweToetsen.map((teken) => toetsVoorTeken(teken)?.toets).filter((x) => x !== undefined);
  ctx.toetsenbord.markeer(toetsen.map((x) => x.code));
  ctx.handen.toon(toetsen.map((x) => x.vinger));

  const scherm = oefenscherm(ctx, { figuren: "zwaai" });
  scherm.zetOpdracht(blok.titel, false);
  scherm.veld.append(el("div", { class: "ballon" }, el("p", { class: "grote-tekst" }, blok.tekst ?? "")));
  scherm.toonEnter();
  ctx.zeg(blok.tekst ?? "");

  return {
    opToets(e) {
      if (e.key === "Enter") ctx.volgende();
    },
  };
};
