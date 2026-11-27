// Afsluiter: "Goed gedaan!" met sterren. Is het doel niet gehaald, dan kan
// het kind de eindoefening meteen opnieuw doen. Hier valt niets te typen: het
// toetsenbord en de handen worden onzichtbaar, maar houden hun plaats.

import { t } from "../content";
import type { AfsluiterBlok } from "../content/types";
import { isLesOpen } from "../logica/voortgang";
import { el } from "../weergave/dom";
import { sterIcoon } from "../weergave/figuren";
import { isBeschikbaar } from ".";
import type { BlokFunctie } from "./context";
import { oefenscherm } from "./oefenscherm";

export const afsluiter: BlokFunctie<AfsluiterBlok> = (blok, ctx) => {
  const { app, les } = ctx;
  const resultaat = ctx.sessie.resultaat;
  ctx.toonToetsenbord(false);
  const volgorde = app.lessen.map((l) => l.id);
  const volgendeLes = app.lessen.find((l) => l.id > les.id);
  const volgendeOpen =
    volgendeLes !== undefined && isBeschikbaar(volgendeLes) && isLesOpen(app.voortgang, volgendeLes.id, volgorde);

  // Niet gehaald: aanmoedigend. Drie sterren: trots. Anders: blij.
  const uitdrukking = !resultaat ? "blij" : !resultaat.gehaald ? "aanmoedigend" : resultaat.sterren === 3 ? "trots" : "blij";
  const scherm = oefenscherm(ctx, { figuren: uitdrukking });

  const knoppen: HTMLButtonElement[] = [];
  const knop = (tekst: string, actie: () => void) => {
    knoppen.push(el("button", { class: knoppen.length === 0 ? "knop knop-hoofd" : "knop", type: "button", onclick: actie }, tekst));
  };

  if (resultaat) {
    scherm.zetKop(t("les.sterren", { aantal: resultaat.sterren }));
    scherm.veld.append(
      el(
        "div",
        { class: "sterren", role: "img", "aria-label": t("les.sterren", { aantal: resultaat.sterren }) },
        ...[1, 2, 3].map((i) => sterIcoon(i <= resultaat.sterren, 72)),
      ),
    );
    if (resultaat.gehaald) {
      scherm.zetOpdracht(blok.tekst ?? "");
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
  knop(t("knop.naarBegin"), () => app.naarStart());

  scherm.voet.replaceChildren(el("div", { class: "knoppen" }, ...knoppen));
  // Met Enter kies je de eerste knop; met Tab ga je naar de andere.
  knoppen[0].focus();

  return {};
};
