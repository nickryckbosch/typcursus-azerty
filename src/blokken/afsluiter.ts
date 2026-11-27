// Afsluiter: "Goed gedaan!" met sterren. Is het doel niet gehaald, dan kan
// het kind de eindoefening meteen opnieuw doen.

import { t } from "../content";
import type { AfsluiterBlok } from "../content/types";
import { heeftExtraOefenen } from "../logica/extraoefenen";
import { isLesOpen, markeerEindeBereikt } from "../logica/voortgang";
import { el } from "../weergave/dom";
import { sterIcoon } from "../weergave/figuren";
import { oefenscherm } from "./oefenscherm";
import { isBeschikbaar } from ".";
import type { BlokFunctie } from "./context";

export const afsluiter: BlokFunctie<AfsluiterBlok> = (blok, ctx) => {
  const { app, les } = ctx;
  const resultaat = ctx.sessie.resultaat;
  // Hier is niets te typen: het toetsenbord en de handen worden onzichtbaar,
  // maar houden hun plaats, zodat er niets verspringt.
  ctx.toonToetsenbord(false);

  // Extra oefenen (K15): een korte afsluiter. Er telt niets mee voor de voortgang.
  if (ctx.extra) {
    // K27: Fien en Jef en wat ze zeggen staan als een groep in het midden, de
    // knoppen eronder. De hoofdknop (vol blauw) is de knop die Enter kiest.
    const terug = el("button", { class: "knop knop-hoofd", type: "button", onclick: () => app.naarStart() }, t("knop.naarLessen"));
    const nogEens = el("button", { class: "knop knop-tweede", type: "button", onclick: () => app.naarExtra(les) }, t("extra.nogEens"));
    const scherm = oefenscherm(ctx, { figuren: "duim", opbouw: "midden", klasse: "blok-extra-einde" });
    const tekst = blok.tekst ?? "";
    scherm.veld.append(el("div", { class: "ballon" }, el("p", { class: "grote-tekst" }, tekst)));
    ctx.zeg(tekst);
    scherm.voet.replaceChildren(el("div", { class: "knoppen" }, terug, nogEens));
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

  // De houding op het einde: duim omhoog, of aanmoedigen als het doel niet gehaald is.
  const uitdrukking = resultaat && !resultaat.gehaald ? "aanmoedigend" : "duim";
  const scherm = oefenscherm(ctx, { figuren: uitdrukking, klasse: "blok-afsluiter" });

  if (resultaat) {
    scherm.veld.append(
      el(
        "div",
        { class: "sterren", role: "img", "aria-label": t("les.sterren", { aantal: resultaat.sterren }) },
        ...[1, 2, 3].map((i) => sterIcoon(i <= resultaat.sterren, 72)),
      ),
      el("p", { class: "sterren-tekst" }, t("les.sterren", { aantal: resultaat.sterren })),
    );
    if (resultaat.gehaald) {
      // Minder dan drie sterren: de app voegt zelf de uitnodiging toe, voor elke les.
      const tekst = resultaat.sterren < 3 ? `${blok.tekst ?? ""} ${t("eind.nietAlleSterren")}`.trim() : blok.tekst ?? "";
      scherm.zetOpdracht(tekst);
      if (volgendeOpen) knop(t("knop.volgendeLes", { nummer: volgendeLes.id }), () => app.naarLes(volgendeLes));
      if (resultaat.sterren < 3) knop(t("knop.meerSterren"), () => ctx.gaNaar(ctx.indexVan("eindoefening")));
    } else {
      scherm.zetOpdracht(t("eind.nietGehaald"));
      knop(t("knop.opnieuw"), () => ctx.gaNaar(ctx.indexVan("eindoefening")));
    }
  } else {
    scherm.zetOpdracht(blok.tekst ?? "");
    if (volgendeOpen) knop(t("knop.volgendeLes", { nummer: volgendeLes.id }), () => app.naarLes(volgendeLes));
  }
  if (heeftExtraOefenen(les)) knop(t("knop.extra"), () => app.naarExtra(les));
  knop(t("knop.naarBegin"), () => app.naarStart());

  scherm.voet.replaceChildren(el("div", { class: "knoppen" }, ...knoppen));
  // Met Enter kies je de eerste knop; met Tab ga je naar de andere.
  knoppen[0].focus();

  return {};
};
