// Spel "Over de beek" (les 1), het eerste spel in het spelsjabloon (sjabloon.ts).
//
// Het kind typt drie regels van 12 tekens (f, j en de spatie: elk derde teken
// is een spatie). De regel staat groot in het midden, zoals bij de oefenregels.
// Elke goede toets legt een stapsteen in de beek op de strook onderaan: drie
// rijen van 12 stenen. Liggen ze er alle 36, dan staan Fien en Jef bij hun huis.
//
// Voorlopig (28 november 2026) gebruiken ook de spellen van les 2 tot 5 deze
// strook, met hun eigen letters of woorden (voorlopigSpel hieronder). Zo kan
// een kind dat snel gaat al verder, en testen we of de lessen in elkaar
// passen. Elk spel krijgt later zijn eigen strook (K22).
//
// Er beweegt niets tijdens het typen (docs/stijlgids.md, deel 1). Bij een fout
// krijgt de letter een stippelrand en lichten de juiste toets en vinger op.
// Geen tijd, geen punten.

import { t } from "../content";
import type { BlokFunctie } from "../blokken/context";
import type { SpelBlok } from "../content/types";
import { beekStenen, woordRegels } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken, type TypOefening } from "../logica/typen";
import { BEEK_FIGUREN, beekStrook } from "./beek-strook";
import { spelscherm } from "./sjabloon";

const STENEN = 12;
const RIJEN = 3;

/**
 * Het spel met de stapstenen: het kind typt de regels, elke goede toets legt
 * een steen. `regels` zijn de regels die het kind typt, in volgorde.
 */
function stenenSpel(blok: SpelBlok, ctx: Parameters<BlokFunctie<SpelBlok>>[1], regels: string[], doel: string) {
  const totaal = regels.reduce((som, r) => som + r.length, 0);
  // Drie rijen stenen in het water, ook als de regels niet even lang zijn.
  const perRij = Math.ceil(totaal / RIJEN);
  let rij = 0;
  let gelegd = 0;
  let oef: TypOefening = nieuweOefening("");
  let klaar = false;
  let hulpTimer: number | undefined;
  /** de afgewerkte rijen: samen een poging voor de metingen per toets */
  const gedaan: TypOefening[] = [];

  const strook = beekStrook(totaal, perRij);
  const scherm = spelscherm(ctx, {
    opdracht: blok.tekst ?? blok.titel,
    doel,
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
    strook.zetStenen(gelegd + oef.positie);
  }

  function nieuweRij(): void {
    oef = nieuweOefening(regels[rij]);
    teken();
    toonOfWacht();
  }

  nieuweRij();

  return {
    opToets(e: KeyboardEvent) {
      if (klaar) {
        if (e.key === "Enter" && !e.repeat) ctx.volgende();
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
      gelegd += oef.doel.length;
      rij++;
      if (rij < regels.length) {
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
}

/** "Over de beek" (les 1): drie regels van 12 tekens, elk derde teken is een spatie. */
export const beek: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const letters = blok.tekens.filter((x) => x !== " ");
  const regels = Array.from({ length: RIJEN }, () => beekStenen(letters, STENEN).join(""));
  return stenenSpel(blok, ctx, regels, blok.doel);
};

/**
 * Voorlopig spel voor les 2 tot 5: de stapstenen van "Over de beek", met de
 * letters of de woorden van de les. Met letters: de eerste regel gebruikt
 * alleen de nieuwe letters, daarna alle letters van het spel. Met woorden:
 * drie regels van drie woorden. De titel en de doelzin zijn die van de beek
 * (blokken/index.ts, titelVan), want de prent is de beek.
 */
export const voorlopigSpel: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const woorden = blok.woorden ?? [];
  let regels: string[];
  if (woorden.length > 0) {
    regels = woordRegels(woorden, RIJEN, 3);
  } else {
    const letters = blok.tekens.filter((x) => x !== " ");
    const nieuw = letters.filter((x) => ctx.les.nieuweToetsen.includes(x));
    regels = Array.from({ length: RIJEN }, (_, i) => beekStenen(i === 0 && nieuw.length > 1 ? nieuw : letters, STENEN).join(""));
  }
  return stenenSpel(blok, ctx, regels, t("spel.voorlopig.doel"));
};
