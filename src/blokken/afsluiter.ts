// Afsluiter: "Goed gedaan!" met sterren. Is het doel niet gehaald, dan kan
// het kind de eindoefening meteen opnieuw doen.

import { t } from "../content";
import type { AfsluiterBlok } from "../content/types";
import { heeftExtraOefenen } from "../logica/extraoefenen";
import { isLesOpen, markeerEindeBereikt } from "../logica/voortgang";
import { el } from "../weergave/dom";
import { sterIcoon } from "../weergave/figuren";
import { metFienEnJef } from "./gedeeld";
import { isBeschikbaar } from ".";
import type { BlokFunctie } from "./context";

export const afsluiter: BlokFunctie<AfsluiterBlok> = (blok, ctx) => {
  const { app, les } = ctx;
  const resultaat = ctx.sessie.resultaat;
  // Hier is niets te typen: zonder toetsenbord en handen is er meer plaats.
  ctx.toonToetsenbord(false);

  // Extra oefenen (K15): een korte afsluiter. Er telt niets mee voor de voortgang.
  if (ctx.extra) {
    const nogEens = el("button", { class: "knop knop-hoofd", type: "button", onclick: () => app.naarExtra(les) }, t("extra.nogEens"));
    const terug = el("button", { class: "knop", type: "button", onclick: () => app.naarStart() }, t("knop.naarLessen"));
    ctx.podium.append(
      el(
        "div",
        { class: "blok blok-extra-einde" },
        metFienEnJef("duim", el("div", { class: "ballon" }, el("p", { class: "grote-tekst" }, blok.tekst ?? ""))),
        el("div", { class: "knoppen" }, terug, nogEens),
      ),
    );
    ctx.zeg(blok.tekst ?? "");
    terug.focus();
    return {};
  }

  // Het kind is tot het einde van de les geraakt: vanaf nu is "Extra oefenen" open,
  // ook als de 90% niet gehaald is.
  markeerEindeBereikt(app.voortgang, les.id);
  app.bewaar();

  const volgorde = app.lessen.map((l) => l.id);
  const volgendeLes = app.lessen.find((l) => l.id > les.id);
  const volgendeOpen =
    volgendeLes !== undefined && isBeschikbaar(volgendeLes) && isLesOpen(app.voortgang, volgendeLes.id, volgorde);

  const knoppen: HTMLButtonElement[] = [];
  const knop = (tekst: string, actie: () => void) => {
    const k = el("button", { class: knoppen.length === 0 ? "knop knop-hoofd" : "knop", type: "button", onclick: actie }, tekst);
    knoppen.push(k);
    return k;
  };

  const inhoud: Node[] = [];
  // De houding op het einde: duim omhoog, of aanmoedigen als het doel niet gehaald is.
  const uitdrukking = resultaat && !resultaat.gehaald ? "aanmoedigend" : "duim";

  if (resultaat) {
    const sterren = el(
      "div",
      { class: "sterren", role: "img", "aria-label": t("les.sterren", { aantal: resultaat.sterren }) },
      ...[1, 2, 3].map((i) => sterIcoon(i <= resultaat.sterren, 72)),
    );
    inhoud.push(sterren, el("p", { class: "sterren-tekst" }, t("les.sterren", { aantal: resultaat.sterren })));
    if (resultaat.gehaald) {
      inhoud.push(el("p", { class: "grote-tekst" }, blok.tekst ?? ""));
      if (volgendeOpen) knop(t("knop.volgendeLes", { nummer: volgendeLes.id }), () => app.naarLes(volgendeLes));
      if (resultaat.sterren < 3) knop(t("knop.meerSterren"), () => ctx.gaNaar(ctx.indexVan("eindoefening")));
    } else {
      inhoud.push(el("p", { class: "grote-tekst" }, t("eind.nietGehaald")));
      knop(t("knop.opnieuw"), () => ctx.gaNaar(ctx.indexVan("eindoefening")));
    }
  } else {
    inhoud.push(el("p", { class: "grote-tekst" }, blok.tekst ?? ""));
    if (volgendeOpen) knop(t("knop.volgendeLes", { nummer: volgendeLes.id }), () => app.naarLes(volgendeLes));
  }
  if (heeftExtraOefenen(les)) knop(t("knop.extra"), () => app.naarExtra(les));
  knop(t("knop.naarBegin"), () => app.naarStart());

  ctx.podium.append(el("div", { class: "blok blok-afsluiter" }, metFienEnJef(uitdrukking, el("div", { class: "ballon" }, ...inhoud)), el("div", { class: "knoppen" }, ...knoppen)));
  ctx.zeg(resultaat && !resultaat.gehaald ? t("eind.nietGehaald") : blok.tekst ?? "");
  // Met Enter kies je de eerste knop; met Tab ga je naar de andere.
  knoppen[0].focus();

  return {};
};
