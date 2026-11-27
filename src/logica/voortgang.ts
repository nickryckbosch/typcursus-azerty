// Het datamodel van de voortgang en de regels om lessen te openen.
// Opslaan en lezen gebeurt in opslag.ts.

import type { ToetsStat } from "./statistieken";
import { sterren } from "./typen";

export const VERSIE = 1;

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
}

export type ToetsenbordStatus = "ok" | "fout" | "onbekend";

export interface Voortgang {
  versie: number;
  lessen: Record<string, LesVoortgang>;
  toetsen: Record<string, ToetsStat>;
  instellingen: { voorlezen: boolean };
  toetsenbord: ToetsenbordStatus;
  /** leerkracht heeft alle lessen opengezet (om te testen) */
  allesOpen: boolean;
}

export function nieuweVoortgang(): Voortgang {
  return {
    versie: VERSIE,
    lessen: {},
    toetsen: {},
    instellingen: { voorlezen: false },
    toetsenbord: "onbekend",
    allesOpen: false,
  };
}

export function legeLesVoortgang(): LesVoortgang {
  return { afgewerkt: false, pogingen: 0, mislukt: 0, besteNauwkeurigheid: null, sterren: 0, snelheden: [] };
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
