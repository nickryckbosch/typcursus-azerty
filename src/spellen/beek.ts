// Spel "Over de beek" (les 1). Bovenaan staat een vaste prent: Fien en Jef
// aan de ene kant van de beek, hun huis aan de overkant. De vooruitgang staat
// eronder: een rij van 12 stenen. Op elke steen staat een letter; elke derde
// steen is breder en is voor de spatie. Afgewerkte stenen zijn grijs met een
// vinkje, de steen die aan de beurt is, is groot met een blauwe rand.
//
// Er beweegt niets (docs/stijlgids.md, deel 1): de prent verspringt niet, de
// stenen wiebelen niet. Bij een fout lichten alleen de juiste toets en vinger
// op. Fien en Jef steken pas op het einde hun duim op. Drie beken. Geen tijd,
// geen punten.

import { t } from "../content";
import type { BlokFunctie } from "../blokken/context";
import type { SpelBlok } from "../content/types";
import { beekStenen } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken, type TypOefening } from "../logica/typen";
import { el } from "../weergave/dom";
import { fien, jef, vinkje } from "../weergave/figuren";
import { tekenTonen } from "../weergave/tekens";
import { maakVoortgang, startVerborgen, toon } from "../blokken/oefenscherm";
import beekPrent from "../beelden/beek.webp";

const STENEN = 12;
const BEKEN = 3;

export const beek: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const letters = blok.tekens.filter((x) => x !== " ");
  let nummer = 0;
  let oef: TypOefening = nieuweOefening("");
  let tekens: string[] = [];
  let klaar = false;
  let hulpTimer: number | undefined;
  /** de afgewerkte beken: samen een poging voor de metingen per toets */
  const gedaan: TypOefening[] = [];

  const opdracht = blok.tekst ?? blok.titel;
  const rij = el("ol", { class: "stenen" });
  const voortgang = maakVoortgang();
  // Het einde staat er van bij het begin (onzichtbaar): Fien en Jef met hun duim
  // omhoog, "Droge voeten!" en de Enter-regel. Het verschijnt alleen.
  const [voor, na] = t("hint.enter").split("{toets}");
  const einde = startVerborgen(
    el(
      "div",
      { class: "beek-einde" },
      el("div", { class: "figuren" }, fien("duim", 96), jef("duim", 96)),
      el(
        "div",
        { class: "beek-einde-tekst" },
        el("p", { class: "ballon grote-tekst" }, t("beek.klaar")),
        el(
          "div",
          { class: "enter-rij" },
          el("p", { class: "hint-enter" }, voor, el("span", { class: "toets-in-tekst" }, t("toets.enter")), na ?? ""),
          el("button", { class: "knop knop-hoofd", type: "button", tabindex: "-1", onclick: () => klaar && ctx.volgende() }, t("knop.verder")),
        ),
      ),
    ),
  );
  const prent = el("img", { class: "beek-prent", src: beekPrent, alt: t("beek.prent"), draggable: "false" });
  ctx.podium.append(
    el(
      "section",
      { class: "kaart blok-beek" },
      el("div", { class: "beek-boven" }, el("p", { class: "opdracht" }, opdracht), prent, einde),
      el("div", { class: "beek-onder" }, rij),
      voortgang.element,
    ),
  );
  ctx.zeg(opdracht);

  function tekenStenen(): void {
    rij.replaceChildren(
      ...tekens.map((x, i) => {
        const toestand = i < oef.positie ? "klaar" : i === oef.positie ? "nu" : "later";
        return el(
          "li",
          { class: `steen steen-${toestand} ${x === " " ? "steen-spatie" : ""}`, "aria-current": toestand === "nu" ? "step" : undefined },
          toestand === "klaar" ? vinkje(14) : null,
          tekenTonen(x),
        );
      }),
    );
    // De stenen tonen zelf hoe ver je bent; onderaan staan alleen drie bolletjes voor de beken.
    voortgang.zetBolletjes(nummer, BEKEN);
  }

  /** Hulp altijd zichtbaar (standaard), of pas na een tijdje wachten (instelling). */
  function toonOfWacht(): void {
    clearTimeout(hulpTimer);
    if (ctx.hulpAltijd) {
      ctx.toonHulp(volgendTeken(oef));
    } else {
      ctx.toonHulp(null);
      hulpTimer = window.setTimeout(() => ctx.toonHulp(volgendTeken(oef)), ctx.hulpNaMs);
    }
  }

  function nieuweBeek(): void {
    tekens = beekStenen(letters, STENEN);
    oef = nieuweOefening(tekens.join(""));
    tekenStenen();
    toonOfWacht();
  }

  nieuweBeek();

  return {
    opToets(e) {
      if (klaar) {
        if (e.key === "Enter") ctx.volgende();
        return;
      }
      if (!teltAlsTeken(e)) return;
      const { juist, klaar: overgestoken } = typ(oef, e.key, performance.now());
      ctx.toetsenbord.flits(e.code, juist);
      if (!juist) {
        clearTimeout(hulpTimer);
        ctx.toonFout(volgendTeken(oef));
        return;
      }
      tekenStenen();
      if (!overgestoken) {
        toonOfWacht();
        return;
      }

      clearTimeout(hulpTimer);
      ctx.toonHulp(null);
      gedaan.push(oef);
      nummer++;
      if (nummer < BEKEN) {
        // Meteen een nieuwe beek: de volgende toets telt al voor de eerste steen.
        nieuweBeek();
      } else {
        // Het einde: Fien en Jef steken hun duim op.
        klaar = true;
        ctx.bewaarPoging(gedaan);
        voortgang.zetBolletjes(BEKEN, BEKEN);
        ctx.toetsenbord.toonEnter(true);
        toon(einde);
        einde.querySelector("button")?.removeAttribute("tabindex");
        ctx.zeg(t("beek.klaar"));
      }
    },
    opruimen() {
      clearTimeout(hulpTimer);
    },
  };
};
