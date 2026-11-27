// Afsluiter: "Goed gedaan!" met sterren. Is het doel niet gehaald, dan kan
// het kind de eindoefening meteen opnieuw doen.

import { t } from "../content";
import type { AfsluiterBlok } from "../content/types";
import { isLesOpen } from "../logica/voortgang";
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
  // Niet gehaald: aanmoedigend. Drie sterren: trots. Anders: blij.
  const uitdrukking = !resultaat ? "blij" : !resultaat.gehaald ? "aanmoedigend" : resultaat.sterren === 3 ? "trots" : "blij";

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
  knop(t("knop.naarBegin"), () => app.naarStart());

  ctx.podium.append(el("div", { class: "blok blok-afsluiter" }, metFienEnJef(uitdrukking, ...inhoud), el("div", { class: "knoppen" }, ...knoppen)));
  ctx.zeg(resultaat && !resultaat.gehaald ? t("eind.nietGehaald") : blok.tekst ?? "");
  // Met Enter kies je de eerste knop; met Tab ga je naar de andere.
  knoppen[0].focus();

  return {};
};
