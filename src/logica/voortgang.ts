// Het datamodel van de voortgang en de regels om lessen te openen.
// Opslaan en lezen gebeurt in opslag.ts.

import type { MetingenOpslag } from "./metingen";
import { sterren } from "./typen";

/**
 * Versie 2 (metingen per toets, projectdocument 12): de oude tellingen per toets
 * ("toetsen": elke verkeerde aanslag was een fout, gemiddelde tijd) zijn vervangen
 * door samenvattingen per poging ("metingen") en tellingen van oudere pogingen
 * ("metingenOuder": een fout telt een keer per positie). De betekenis van de
 * cijfers verandert, dus gaat het versienummer omhoog. Gegevens van versie 1
 * worden omgezet in opslag.ts; er gaat geen voortgang verloren.
 */
export const VERSIE = 2;

export const DOEL_NAUWKEURIGHEID = 0.9;

/** Na zoveel mislukte pogingen op rij wordt de eindoefening korter. */
export const POGINGEN_VOOR_KORT = 2;

export interface LesVoortgang {
  afgewerkt: boolean;
  pogingen: number;
  /** mislukte pogingen op rij sinds de laatste geslaagde */
  mislukt: number;
  besteNauwkeurigheid: number | null;
  sterren: number;
  /** woorden per minuut van de laatste pogingen (alleen voor de leerkracht) */
  snelheden: number[];
  /** bij welk blok het kind gestopt is (om later verder te gaan); null: niet bezig */
  bezigBij: number | null;
  /**
   * Het kind heeft de les een keer tot het einde gedaan (tot bij de afsluiter),
   * ook als het de 90% niet haalde. Vanaf dan is "Extra oefenen" open (K15).
   */
  eindeBereikt: boolean;
}

export type ToetsenbordStatus = "ok" | "fout" | "onbekend";

export interface Voortgang extends MetingenOpslag {
  versie: number;
  lessen: Record<string, LesVoortgang>;
  instellingen: {
    voorlezen: boolean;
    /**
     * Uit (standaard): de toets en de vinger die moeten komen, zijn altijd
     * zichtbaar (beslissing K17 voor les 0 tot 5). Aan: de hulp verschijnt pas
     * na een fout of na een paar seconden wachten. Zo kan K17 de hulp later
     * afbouwen zonder dat er code terug moet komen.
     */
    hulpPasNaFout: boolean;
  };
  toetsenbord: ToetsenbordStatus;
  /** leerkracht heeft alle lessen opengezet (om te testen) */
  allesOpen: boolean;
}

export function nieuweVoortgang(): Voortgang {
  return {
    versie: VERSIE,
    lessen: {},
    metingen: [],
    metingenOuder: {},
    instellingen: { voorlezen: false, hulpPasNaFout: false },
    toetsenbord: "onbekend",
    allesOpen: false,
  };
}

export function legeLesVoortgang(): LesVoortgang {
  return { afgewerkt: false, pogingen: 0, mislukt: 0, besteNauwkeurigheid: null, sterren: 0, snelheden: [], bezigBij: null, eindeBereikt: false };
}

export function lesVoortgang(v: Voortgang, lesId: number): LesVoortgang {
  return (v.lessen[String(lesId)] ??= legeLesVoortgang());
}

/** De eerste les is altijd open; elke volgende les als de vorige afgewerkt is. */
export function isLesOpen(v: Voortgang, lesId: number, volgorde: number[]): boolean {
  if (v.allesOpen) return true;
  const plaats = volgorde.indexOf(lesId);
  if (plaats <= 0) return plaats === 0;
  const vorige = v.lessen[String(volgorde[plaats - 1])];
  return vorige?.afgewerkt === true;
}

/** Krijgt het kind de korte eindoefening? Na twee mislukte pogingen op rij. */
export function moetKortZijn(v: Voortgang, lesId: number): boolean {
  return lesVoortgang(v, lesId).mislukt >= POGINGEN_VOOR_KORT;
}

/** Les zonder meting (les 0): afgewerkt zodra het kind er doorheen is. */
export function markeerAfgewerkt(v: Voortgang, lesId: number): void {
  lesVoortgang(v, lesId).afgewerkt = true;
}

export function registreerEindoefening(
  v: Voortgang,
  lesId: number,
  nauwk: number,
  wpm: number,
  doel: number = DOEL_NAUWKEURIGHEID,
): { gehaald: boolean; sterren: number } {
  const lv = lesVoortgang(v, lesId);
  const gehaald = nauwk + 1e-9 >= doel;
  const st = gehaald ? sterren(nauwk) : 0;
  lv.pogingen++;
  lv.snelheden = [...lv.snelheden, Math.round(wpm * 10) / 10].slice(-20);
  lv.besteNauwkeurigheid = Math.max(lv.besteNauwkeurigheid ?? 0, nauwk);
  if (gehaald) {
    lv.afgewerkt = true;
    lv.mislukt = 0;
    lv.sterren = Math.max(lv.sterren, st);
  } else {
    lv.mislukt++;
  }
  return { gehaald, sterren: st };
}

/**
 * Onthoud bij welk blok het kind is, zodat het na een onderbreking kan verdergaan.
 * Het eerste blok of de afsluiter: niets te onthouden (null).
 */
export function zetBezigBij(v: Voortgang, lesId: number, blok: number, aantalBlokken: number): void {
  lesVoortgang(v, lesId).bezigBij = blok > 0 && blok < aantalBlokken - 1 ? blok : null;
}

/** Bij welk blok kan het kind verdergaan? null: opnieuw beginnen. */
export function verderBij(v: Voortgang, lesId: number): number | null {
  return v.lessen[String(lesId)]?.bezigBij ?? null;
}

/**
 * De les die aan de beurt is: de eerste les in de volgorde die nog niet
 * gelukt is. null: alle lessen zijn klaar. (Voor de kaart "Verder waar je was".)
 */
export function lesAanDeBeurt(v: Voortgang, volgorde: number[]): number | null {
  return volgorde.find((id) => v.lessen[String(id)]?.afgewerkt !== true) ?? null;
}

/** Het kind is tot bij de afsluiter van de les geraakt. */
export function markeerEindeBereikt(v: Voortgang, lesId: number): void {
  lesVoortgang(v, lesId).eindeBereikt = true;
}

/**
 * Is "Extra oefenen" open voor deze les (K15)? Zodra het kind de les een keer
 * tot het einde gedaan heeft, ook zonder 90%. De volgende les gaat pas open
 * bij 90% op de eindoefening (isLesOpen). Een score bij extra oefenen telt
 * nooit mee voor de voortgang.
 */
export function isExtraOpen(v: Voortgang, lesId: number): boolean {
  const lv = v.lessen[String(lesId)];
  return lv?.eindeBereikt === true || lv?.afgewerkt === true;
}
