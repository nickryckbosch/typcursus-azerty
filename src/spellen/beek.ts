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
import { enterHint } from "../blokken/gedeeld";
import beekPrent from "../beelden/beek.webp";

const STENEN = 12;
const BEKEN = 3;

export const beek: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const letters = blok.tekens.filter((x) => x !== " ");
  let nummer = 0;
  let oef: TypOefening = nieuweOefening("");
  let tekens: string[] = [];
  let klaar = false;
  let wacht = false;
  let hulpTimer: number | undefined;

  const opdracht = blok.tekst ?? blok.titel;
  const rij = el("ol", { class: "stenen" });
  const teller = el("p", { class: "teller" });
  const einde = el("div", { class: "beek-einde", hidden: true });
  const prent = el("img", { class: "beek-prent", src: beekPrent, alt: t("beek.prent"), draggable: "false" });
  ctx.podium.append(
    el(
      "section",
      { class: "kaart blok-beek" },
      el("div", { class: "beek-boven" }, el("p", { class: "opdracht" }, opdracht), prent, einde),
      el("div", { class: "beek-onder" }, rij, teller),
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
    teller.textContent = `${t("beek.teller", { nummer: Math.min(nummer + 1, BEKEN), totaal: BEKEN })} · ${t("teller", {
      nummer: Math.min(oef.positie + 1, tekens.length),
      totaal: tekens.length,
    })}`;
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
      if (wacht || !teltAlsTeken(e)) return;
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
      ctx.bewaarAanslagen(oef.aanslagen);
      nummer++;
      if (nummer < BEKEN) {
        wacht = true;
        ctx.later(() => {
          wacht = false;
          nieuweBeek();
        }, 900);
      } else {
        // Het einde: Fien en Jef steken hun duim op.
        klaar = true;
        einde.hidden = false;
        einde.append(
          el("div", { class: "figuren" }, fien("duim", 96), jef("duim", 96)),
          el("div", { class: "beek-einde-tekst" }, el("p", { class: "ballon grote-tekst" }, t("beek.klaar")), enterHint(ctx)),
        );
        ctx.zeg(t("beek.klaar"));
      }
    },
    opruimen() {
      clearTimeout(hulpTimer);
    },
  };
};
