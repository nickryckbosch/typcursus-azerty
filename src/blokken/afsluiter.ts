// Afsluiter: "Goed gedaan!" met sterren. Is het doel niet gehaald, dan kan
// het kind de eindoefening meteen opnieuw doen. Het is een slotscherm: Fien en
// Jef groot in het midden, hun zin in een tekstballon, de knoppen eronder.

import { t } from "../content";
import type { AfsluiterBlok } from "../content/types";
import { heeftExtraOefenen } from "../logica/extraoefenen";
import { isLesOpen, markeerEindeBereikt } from "../logica/voortgang";
import { el } from "../weergave/dom";
import { sterIcoon } from "../weergave/figuren";
import { slotscherm } from "./oefenscherm";
import { isBeschikbaar } from ".";
import type { BlokFunctie } from "./context";

export const afsluiter: BlokFunctie<AfsluiterBlok> = (blok, ctx) => {
  const { app, les } = ctx;
  const resultaat = ctx.sessie.resultaat;
  // Extra oefenen (K15): een korte afsluiter. Er telt niets mee voor de voortgang.
  // "Naar de lessen" is de hoofdknop: dat is de knop die Enter kiest.
  if (ctx.extra) {
    slotscherm(ctx, {
      figuren: "duim",
      zin: blok.tekst ?? "",
      klasse: "blok-extra-einde",
      knoppen: [
        { tekst: t("knop.naarLessen"), actie: () => app.naarStart() },
        { tekst: t("extra.nogEens"), actie: () => app.naarExtra(les) },
      ],
    });
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

  // De knoppen: eerst verzameld, dan geordend. De eerste is de hoofdknop (vol
  // blauw, die kiest Enter), de andere zijn lichte tweede knoppen (K27).
  // Is de les gelukt, dan is "Extra oefenen" de hoofdknop: wie sneller klaar
  // is, oefent extra tot het kwartier om is (Nick, 28 november 2026).
  const keuzes: { tekst: string; actie: () => void; extra?: boolean }[] = [];
  const knop = (tekst: string, actie: () => void, extra = false) => keuzes.push({ tekst, actie, extra });

  // De houding op het einde: duim omhoog, of aanmoedigen als het doel niet gehaald is.
  const nietGehaald = resultaat !== null && resultaat !== undefined && !resultaat.gehaald;
  // Wat Fien en Jef zeggen: het staat in hun tekstballon (K27 fase 2).
  let zin = blok.tekst ?? "";
  const boven: Node[] = [];

  if (resultaat) {
    boven.push(
      el(
        "div",
        { class: "sterren", role: "img", "aria-label": t("les.sterren", { aantal: resultaat.sterren }) },
        ...[1, 2, 3].map((i) => sterIcoon(i <= resultaat.sterren, 72)),
      ),
      el("p", { class: "sterren-tekst" }, t("les.sterren", { aantal: resultaat.sterren })),
    );
    if (resultaat.gehaald) {
      // Minder dan drie sterren: de app voegt zelf de uitnodiging toe, voor elke les.
      if (resultaat.sterren < 3) zin = `${zin} ${t("eind.nietAlleSterren")}`.trim();
      if (volgendeOpen) knop(t("knop.volgendeLes", { nummer: volgendeLes.id }), () => app.naarLes(volgendeLes));
      if (resultaat.sterren < 3) knop(t("knop.meerSterren"), () => ctx.gaNaar(ctx.indexVan("eindoefening")));
    } else {
      zin = t("eind.nietGehaald");
      knop(t("knop.opnieuw"), () => ctx.gaNaar(ctx.indexVan("eindoefening")));
    }
  } else if (volgendeOpen) {
    knop(t("knop.volgendeLes", { nummer: volgendeLes.id }), () => app.naarLes(volgendeLes));
  }
  if (heeftExtraOefenen(les)) knop(t("knop.extra"), () => app.naarExtra(les), true);
  knop(t("knop.naarBegin"), () => app.naarStart());

  // Niet gehaald: "Opnieuw" blijft vooraan. Anders gaat "Extra oefenen" vooraan.
  if (!nietGehaald) keuzes.sort((a, b) => Number(b.extra === true) - Number(a.extra === true));

  // Fien en Jef groot in het midden, hun zin erboven, de knoppen even breed eronder.
  slotscherm(ctx, {
    figuren: nietGehaald ? "aanmoedigend" : "duim",
    zin,
    boven,
    klasse: "blok-afsluiter",
    knoppen: keuzes,
  });

  return {};
};
