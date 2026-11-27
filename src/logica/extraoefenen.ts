// Extra oefenen bij een les (K15): een beurt van 4 nieuw samengestelde
// oefenregels van ongeveer 15 tot 25 tekens.
//
// - De regels komen uit de lijsten van de les: groepjes (les 1 en 2), woorden
//   (les 3 tot 5) en zinnen (vanaf les 4).
// - Ongeveer drie kwart van de items komt uit de huidige les, de rest uit
//   vroegere lessen. In les 1 is er nog niets vroeger: dan komt alles uit les 1.
// - Nooit twee keer hetzelfde item na elkaar (ook niet over twee regels heen).
// - Elke regel voldoet aan de regels van regelcheck.ts. Zo niet: opnieuw
//   samenstellen. Lukt het na een aantal pogingen niet, dan nemen we een vaste
//   oefenregel van de les, zodat het scherm nooit vastloopt.
//
// Zelf geschreven, geen code van Keybr of een ander project. De toevalsfunctie
// wordt meegegeven, zodat de tests voorspelbaar zijn.

import type { Les } from "../content/types";
import { controleerRegel } from "./regelcheck";
import type { Toeval } from "./reeksen";

export const EXTRA = {
  aantalRegels: 4,
  minLengte: 15,
  maxLengte: 25,
  /** aandeel van de items dat uit de huidige les komt */
  aandeelHuidig: 0.75,
  /** aandeel van de regels dat met een zin begint, in een les met zinnen */
  aandeelZinRegels: 0.5,
  /** zo vaak proberen we een regel opnieuw samen te stellen */
  pogingen: 50,
} as const;

export type Herkomst = "huidig" | "vroeger";

export interface ExtraItem {
  tekst: string;
  uit: Herkomst;
}

export interface ExtraBeurt {
  regels: string[];
  /** per regel de items waaruit ze is samengesteld (voor de tests) */
  items: ExtraItem[][];
}

/** Heeft deze les lijsten om extra mee te oefenen? Les 0 heeft er geen. */
export function heeftExtraOefenen(les: Les): boolean {
  return les.groepjes.length + les.woorden.length + les.zinnen.length > 0;
}

function kies<T>(lijst: T[], rnd: Toeval): T {
  return lijst[Math.floor(rnd() * lijst.length) % lijst.length];
}

interface Bronnen {
  /** groepjes en woorden */
  kort: Record<Herkomst, string[]>;
  zinnen: Record<Herkomst, string[]>;
}

function bronnen(les: Les, vroegere: Les[]): Bronnen {
  const past = (x: string) => x.length <= EXTRA.maxLengte;
  return {
    kort: {
      huidig: [...les.groepjes, ...les.woorden].filter(past),
      vroeger: vroegere.flatMap((l) => [...l.groepjes, ...l.woorden]).filter(past),
    },
    zinnen: {
      huidig: les.zinnen.filter(past),
      vroeger: vroegere.flatMap((l) => l.zinnen).filter(past),
    },
  };
}

/** Kies een item: ongeveer drie kwart uit de huidige les, de rest uit vroegere lessen. */
function kiesItem(lijsten: Record<Herkomst, string[]>, rnd: Toeval): ExtraItem | null {
  const uit: Herkomst = lijsten.vroeger.length > 0 && (lijsten.huidig.length === 0 || rnd() >= EXTRA.aandeelHuidig) ? "vroeger" : "huidig";
  if (lijsten[uit].length === 0) return null;
  return { tekst: kies(lijsten[uit], rnd), uit };
}

/**
 * Stel een regel samen. Geeft null als het niet lukt (bv. te weinig items);
 * de aanroeper probeert dan opnieuw.
 */
function stelRegelSamen(b: Bronnen, vorige: string | null, rnd: Toeval): ExtraItem[] | null {
  const items: ExtraItem[] = [];
  let lengte = 0;
  let laatste = vorige;
  const voegToe = (item: ExtraItem | null): boolean => {
    if (!item || item.tekst === laatste) return false;
    const nieuw = lengte + item.tekst.length + (items.length > 0 ? 1 : 0);
    if (nieuw > EXTRA.maxLengte) return false;
    items.push(item);
    lengte = nieuw;
    laatste = item.tekst;
    return true;
  };

  // In een les met zinnen begint ongeveer de helft van de regels met een zin.
  const heeftZinnen = b.zinnen.huidig.length + b.zinnen.vroeger.length > 0;
  if (heeftZinnen && rnd() < EXTRA.aandeelZinRegels) voegToe(kiesItem(b.zinnen, rnd));

  // Vul aan met groepjes of woorden tot de regel lang genoeg is.
  for (let i = 0; i < 40 && lengte < EXTRA.minLengte; i++) voegToe(kiesItem(b.kort, rnd));
  if (lengte < EXTRA.minLengte) return null;
  // Soms nog een item erbij, zodat niet elke regel even lang is.
  if (rnd() < 0.5) voegToe(kiesItem(b.kort, rnd));
  return items;
}

/** Een vaste oefenregel van de les, als samenstellen niet lukt. */
function vasteRegel(les: Les, nummer: number): ExtraItem[] {
  const regels = les.online.flatMap((blok) => (blok.type === "reeks" ? blok.regels : []));
  const alles = regels.length > 0 ? regels : [...les.groepjes, ...les.woorden, ...les.zinnen];
  return [{ tekst: alles[nummer % alles.length] ?? "", uit: "huidig" }];
}

/**
 * Maak een beurt extra oefenen voor deze les.
 * @param vroegere de lessen voor deze les (hun lijsten vullen ongeveer een kwart)
 */
export function maakExtraBeurt(les: Les, vroegere: Les[], rnd: Toeval = Math.random): ExtraBeurt {
  const b = bronnen(les, vroegere);
  const beurt: ExtraBeurt = { regels: [], items: [] };
  let vorige: string | null = null;
  for (let r = 0; r < EXTRA.aantalRegels; r++) {
    let gekozen: ExtraItem[] | null = null;
    for (let poging = 0; poging < EXTRA.pogingen && !gekozen; poging++) {
      const items = stelRegelSamen(b, vorige, rnd);
      if (!items) continue;
      const regel = items.map((i) => i.tekst).join(" ");
      if (regel.length >= EXTRA.minLengte && regel.length <= EXTRA.maxLengte && controleerRegel(regel, les.geleerdeToetsen).ok) gekozen = items;
    }
    gekozen ??= vasteRegel(les, r);
    beurt.items.push(gekozen);
    beurt.regels.push(gekozen.map((i) => i.tekst).join(" "));
    vorige = gekozen[gekozen.length - 1].tekst;
  }
  return beurt;
}

export function maakExtraRegels(les: Les, vroegere: Les[], rnd: Toeval = Math.random): string[] {
  return maakExtraBeurt(les, vroegere, rnd).regels;
}
