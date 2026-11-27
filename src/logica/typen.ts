// De kern van het typen: een doeltekst, een cursor en alle aanslagen.
// Regel uit het ontwerp: bij een fout blijft de cursor staan tot de juiste
// toets getypt is. De fout telt mee in de nauwkeurigheid.

export interface Aanslag {
  /** het teken dat op die plaats moest komen */
  verwacht: string;
  /** het teken dat het kind typte (event.key) */
  getypt: string;
  juist: boolean;
  /** tijd sinds de vorige aanslag in milliseconden; null bij de eerste aanslag */
  tijdMs: number | null;
}

export interface TypOefening {
  doel: string;
  positie: number;
  aanslagen: Aanslag[];
  /** tijdstip van de vorige aanslag (ms), voor tijdMs */
  vorigeTijd: number | null;
  startTijd: number | null;
  eindTijd: number | null;
}

export function nieuweOefening(doel: string): TypOefening {
  return { doel, positie: 0, aanslagen: [], vorigeTijd: null, startTijd: null, eindTijd: null };
}

export function isKlaar(oef: TypOefening): boolean {
  return oef.positie >= oef.doel.length;
}

export function volgendTeken(oef: TypOefening): string | null {
  return isKlaar(oef) ? null : oef.doel[oef.positie];
}

/**
 * Verwerk een getypt teken. Juist: de cursor schuift op. Fout: de cursor
 * blijft staan. Geeft terug of het juist was en of de oefening nu klaar is.
 */
export function typ(oef: TypOefening, getypt: string, nu: number): { juist: boolean; klaar: boolean } {
  if (isKlaar(oef)) return { juist: false, klaar: true };
  const verwacht = oef.doel[oef.positie];
  const juist = getypt === verwacht;
  const tijdMs = oef.vorigeTijd === null ? null : Math.max(0, nu - oef.vorigeTijd);
  oef.aanslagen.push({ verwacht, getypt, juist, tijdMs });
  oef.vorigeTijd = nu;
  if (oef.startTijd === null) oef.startTijd = nu;
  if (juist) oef.positie++;
  const klaar = isKlaar(oef);
  if (klaar) oef.eindTijd = nu;
  return { juist, klaar };
}

/** Juiste aanslagen gedeeld door alle aanslagen, tussen 0 en 1. Zonder aanslagen: 1. */
export function nauwkeurigheid(aanslagen: Aanslag[]): number {
  if (aanslagen.length === 0) return 1;
  const juist = aanslagen.filter((a) => a.juist).length;
  return juist / aanslagen.length;
}

/**
 * Woorden per minuut, met de gewone afspraak: 5 tekens (spaties inbegrepen) = 1 woord.
 * Wordt bewaard voor de leerkracht, nooit getoond aan het kind.
 */
export function woordenPerMinuut(aantalTekens: number, duurMs: number): number {
  if (duurMs <= 0 || aantalTekens <= 0) return 0;
  return aantalTekens / 5 / (duurMs / 60000);
}

/** Sterren: 1 vanaf 90%, 2 vanaf 95%, 3 vanaf 98%. */
export function sterren(nauwk: number): 0 | 1 | 2 | 3 {
  // Kleine marge tegen afrondingsfouten (bv. 0.95 die 0.9499999 wordt).
  const n = nauwk + 1e-9;
  if (n >= 0.98) return 3;
  if (n >= 0.95) return 2;
  if (n >= 0.9) return 1;
  return 0;
}

export interface ToetsGebeurtenis {
  key: string;
  repeat?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

/**
 * Telt deze toetsaanslag mee als getypt teken? Niet voor Shift, Ctrl,
 * pijltjes, Backspace, dode toetsen enzovoort, en niet als een toets
 * ingedrukt blijft (repeat): dat zou anders een reeks fouten geven.
 */
export function teltAlsTeken(e: ToetsGebeurtenis): boolean {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return false;
  return [...e.key].length === 1;
}
