// Intro: Fien en Jef vertellen wat er komt. De nieuwe toetsen en vingers lichten op.

import { t } from "../content";
import type { IntroBlok } from "../content/types";
import { toetsVoorTeken } from "../logica/indeling";
import { el } from "../weergave/dom";
import type { BlokFunctie } from "./context";
import { metFienEnJef, verderKnop } from "./gedeeld";

export const intro: BlokFunctie<IntroBlok> = (blok, ctx) => {
  const toetsen = ctx.les.nieuweToetsen.map((teken) => toetsVoorTeken(teken)?.toets).filter((x) => x !== undefined);
  ctx.toetsenbord.markeer(toetsen.map((x) => x.code));
  ctx.handen.toon(toetsen.map((x) => x.vinger));

  ctx.podium.append(
    el(
      "div",
      { class: "blok blok-intro" },
      metFienEnJef(el("div", { class: "ballon" }, el("h2", {}, blok.titel), el("p", { class: "grote-tekst" }, blok.tekst ?? ""))),
      el("p", { class: "hint" }, t("hint.enter")),
      verderKnop(ctx),
    ),
  );
  ctx.zeg(blok.tekst ?? "");

  return {
    opToets(e) {
      if (e.key === "Enter") ctx.volgende();
    },
  };
};
