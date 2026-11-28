// Spel "Over de beek" (les 1), het eerste spel in het spelsjabloon (sjabloon.ts).
//
// Het kind typt drie regels van 12 tekens (f, j en de spatie: elk derde teken
// is een spatie). De regel staat groot in het midden, zoals bij de oefenregels.
// Elke goede toets legt een stapsteen in de beek op de strook onderaan: drie
// rijen van 12 stenen. Liggen ze er alle 36, dan staan Fien en Jef bij hun huis.
//
// Er beweegt niets tijdens het typen (docs/stijlgids.md, deel 1). Bij een fout
// krijgt de letter een stippelrand en lichten de juiste toets en vinger op.
// Geen tijd, geen punten.

import { t } from "../content";
import type { BlokFunctie } from "../blokken/context";
import type { SpelBlok } from "../content/types";
import { beekStenen } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken, type TypOefening } from "../logica/typen";
import { BEEK_FIGUREN, beekStrook } from "./beek-strook";
import { spelscherm } from "./sjabloon";

const STENEN = 12;
const RIJEN = 3;

export const beek: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const letters = blok.tekens.filter((x) => x !== " ");
  let rij = 0;
  let oef: TypOefening = nieuweOefening("");
  let klaar = false;
  let hulpTimer: number | undefined;
  /** de afgewerkte rijen: samen een poging voor de metingen per toets */
  const gedaan: TypOefening[] = [];

  const strook = beekStrook(STENEN * RIJEN, STENEN);
  const scherm = spelscherm(ctx, {
    opdracht: blok.tekst ?? blok.titel,
    doel: blok.doel,
    strook: strook.element,
    figuren: BEEK_FIGUREN,
    klasse: "spel-beek",
  });

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

  function teken(): void {
    scherm.toonRegel(oef);
    strook.zetStenen(rij * STENEN + oef.positie);
  }

  function nieuweRij(): void {
    oef = nieuweOefening(beekStenen(letters, STENEN).join(""));
    teken();
    toonOfWacht();
  }

  nieuweRij();

  return {
    opToets(e) {
      if (klaar) {
        if (e.key === "Enter") ctx.volgende();
        return;
      }
      if (!teltAlsTeken(e)) return;
      const { juist, klaar: rijKlaar } = typ(oef, e.key, performance.now());
      ctx.toetsenbord.flits(e.code, juist);
      if (!juist) {
        clearTimeout(hulpTimer);
        scherm.toonFout();
        ctx.toonFout(volgendTeken(oef));
        return;
      }
      if (!rijKlaar) {
        teken();
        toonOfWacht();
        return;
      }

      clearTimeout(hulpTimer);
      ctx.toonHulp(null);
      gedaan.push(oef);
      rij++;
      if (rij < RIJEN) {
        // Meteen een nieuwe rij: de volgende toets telt al voor de eerste steen.
        nieuweRij();
      } else {
        // Het einde: alle stenen liggen er, Fien en Jef staan bij hun huis.
        klaar = true;
        ctx.bewaarPoging(gedaan);
        strook.toonThuis();
        scherm.toonSlot(t("beek.klaar"), () => klaar && ctx.volgende());
      }
    },
    opruimen() {
      clearTimeout(hulpTimer);
    },
  };
};
