// Intro: Fien en Jef vertellen wat er komt. De nieuwe toetsen en vingers lichten op.
//
// Twee indelingen (K27; docs/beslissingen.md, 12j en 12p):
// - een tekst in een tekstballon naast Fien en Jef (met in les 0 het huis erbij);
// - een intro in stukken (les 1): bovenaan een of twee losse zinnen, Fien en
//   Jef groot in het midden met elk een eigen tekstballon, en onderaan een zin
//   boven de knop Verder. De lesdata kiest: heeft het blok "fien" en "jef",
//   dan is het de tweede indeling.

import type { IntroBlok } from "../content/types";
import { toetsVoorTeken } from "../logica/indeling";
import { el } from "../weergave/dom";
import { fien, jef } from "../weergave/figuren";
import { t } from "../content";
import { maakHuis } from "../spellen/lichtaan";
import type { BlokFunctie } from "./context";
import { oefenscherm } from "./oefenscherm";

export const intro: BlokFunctie<IntroBlok> = (blok, ctx) => {
  const toetsen = ctx.les.nieuweToetsen.map((teken) => toetsVoorTeken(teken)?.toets).filter((x) => x !== undefined);
  ctx.toetsenbord.markeer(toetsen.map((x) => x.code));
  ctx.handen.toon(toetsen.map((x) => x.vinger));

  const inStukken = blok.fien !== undefined && blok.jef !== undefined;
  const metHuis = blok.prent === "huis";
  let voorlezen = blok.tekst ?? "";

  if (inStukken) {
    // Alles in de middenkolom: de zinnen, Fien en Jef met elk hun tekstballon
    // er vlak naast (het staartje wijst naar wie spreekt), de zin over vandaag
    // en de knop Verder.
    const scherm = oefenscherm(ctx, { opbouw: "midden", klasse: "blok-intro in-stukken" });
    const boven = blok.boven ?? [];
    scherm.veld.append(
      el("div", { class: "intro-boven" }, ...boven.map((zin) => el("p", {}, zin))),
      el(
        "div",
        { class: "intro-duo" },
        el("p", { class: "ballon staart-rechts" }, blok.fien),
        el("div", { class: "figuren" }, fien("zwaai", 210), jef("zwaai", 210)),
        el("p", { class: "ballon" }, blok.jef),
      ),
      ...(blok.onder ? [el("p", { class: "intro-onder" }, blok.onder)] : []),
    );
    scherm.toonEnter();
    voorlezen = [...boven, blok.fien, blok.jef, blok.onder].filter(Boolean).join(" ");
  } else {
    // Fien en Jef met hun tekstballon vlak ernaast, als een groep in het midden (K27).
    const scherm = oefenscherm(ctx, {
      figuren: "zwaai",
      opbouw: "midden",
      klasse: metHuis ? "blok-intro met-huis" : "blok-intro",
      figuurHoogte: 200,
    });
    // Een witregel in de lestekst ("\n\n") wordt een nieuwe alinea: zo leest een
    // langere tekst rustiger (test van 28 november).
    const alineas = (blok.tekst ?? "").split(/\n\s*\n/).map((a) => a.trim()).filter((a) => a !== "");
    const ballon = el("div", { class: "ballon" }, ...alineas.map((a) => el("p", { class: "grote-tekst" }, a)));
    if (metHuis) {
      // Les 0: het huis van "Licht aan in het huis" (alle ramen uit, het dak leeg),
      // zodat woord en beeld kloppen en het kind het huis al kent voor het spel.
      // De ballon staat naast Fien en Jef; het huis waarover ze praten, staat ernaast.
      scherm.veld.append(ballon, maakHuis(t("intro.huis")).svg);
      // De woorden zolder, woonkamer en kelder staan ook in de lege randtoets
      // links van elke rij op het schermtoetsenbord: zo ziet het kind welke rij
      // welke verdieping is. Alleen hier, en er knippert niets (K16).
      ctx.toetsenbord.toonRijNamen(true);
    } else {
      scherm.veld.append(ballon);
    }
    scherm.toonEnter();
  }
  ctx.zeg(voorlezen);

  return {
    opToets(e) {
      if (e.key === "Enter") ctx.volgende();
    },
    opruimen() {
      ctx.toetsenbord.toonRijNamen(false);
    },
  };
};
