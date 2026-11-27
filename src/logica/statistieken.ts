// Statistieken per toets: aantal aanslagen, fouten en gemiddelde tijd.
// Basis voor latere oefeningen op probleemtoetsen.

import type { Aanslag } from "./typen";

export interface ToetsStat {
  aanslagen: number;
  fouten: number;
  /** som van de tijden van juiste aanslagen die meetellen voor het gemiddelde */
  totaleTijdMs: number;
  /** aantal aanslagen in totaleTijdMs */
  getimed: number;
}

/** Een pauze langer dan dit (kind kijkt weg, leerkracht praat) telt niet mee in de gemiddelde tijd. */
export const MAX_TIJD_MS = 5000;

export function legeStat(): ToetsStat {
  return { aanslagen: 0, fouten: 0, totaleTijdMs: 0, getimed: 0 };
}

/**
 * Tel aanslagen op bij de statistieken. Ze worden geteld bij het teken dat
 * verwacht werd: typt het kind j waar f moest komen, dan is dat een fout op de f.
 */
export function voegAanslagenToe(stats: Record<string, ToetsStat>, aanslagen: Aanslag[]): void {
  for (const a of aanslagen) {
    const s = (stats[a.verwacht] ??= legeStat());
    s.aanslagen++;
    if (!a.juist) s.fouten++;
    if (a.juist && a.tijdMs !== null && a.tijdMs <= MAX_TIJD_MS) {
      s.totaleTijdMs += a.tijdMs;
      s.getimed++;
    }
  }
}

export function gemiddeldeTijd(s: ToetsStat): number | null {
  return s.getimed === 0 ? null : s.totaleTijdMs / s.getimed;
}

export function foutAandeel(s: ToetsStat): number {
  return s.aanslagen === 0 ? 0 : s.fouten / s.aanslagen;
}

/** Toetsen gesorteerd van moeilijk naar makkelijk (meeste fouten eerst). */
export function probleemToetsen(stats: Record<string, ToetsStat>, minAanslagen = 10): string[] {
  return Object.entries(stats)
    .filter(([, s]) => s.aanslagen >= minAanslagen)
    .sort(([, a], [, b]) => foutAandeel(b) - foutAandeel(a))
    .map(([teken]) => teken);
}
