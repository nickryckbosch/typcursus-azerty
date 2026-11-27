// Het formaat van een les. Zie docs/11-lessen-data.md voor de betekenis van elk veld.

export interface KlassikaleStap {
  titel: string;
  duurMinuten: number;
  optioneel?: boolean;
  leerkracht: string;
  kinderen: string;
}

interface BlokBasis {
  titel: string;
  duurMinuten: number;
  tekst?: string;
}

export interface IntroBlok extends BlokBasis {
  type: "intro";
}

export interface ToetsenbordcheckBlok extends BlokBasis {
  type: "toetsenbordcheck";
  blokkeert: boolean;
  beschrijving?: string;
}

export interface ZoekToetsBlok extends BlokBasis {
  type: "zoek-toets";
  toetsen: string[];
  nadruk?: string[];
  aantal: number;
}

export interface ReeksBlok extends BlokBasis {
  type: "reeks";
  regels: string[];
  /** korte tip van Fien of Jef, in de tekstballon naast de oefenregels */
  tip?: string;
}

export interface SpelBlok extends BlokBasis {
  type: "spel";
  spel: string;
  tekens: string[];
  woorden?: string[];
  rijen?: ("zolder" | "woonkamer" | "kelder")[];
  rondes?: number;
  beschrijving?: string;
}

export interface EindoefeningBlok extends BlokBasis {
  type: "eindoefening";
  regels: string[];
  regelsKort?: string[];
  doelNauwkeurigheid: number | null;
  soort?: "houding";
  /** korte tip van Fien of Jef, in de tekstballon naast de oefenregels */
  tip?: string;
  beschrijving?: string;
}

export interface AfsluiterBlok extends BlokBasis {
  type: "afsluiter";
}

export type Blok =
  | IntroBlok
  | ToetsenbordcheckBlok
  | ZoekToetsBlok
  | ReeksBlok
  | SpelBlok
  | EindoefeningBlok
  | AfsluiterBlok;

export interface Les {
  id: number;
  titel: string;
  /** wat Fien en Jef op het startscherm zeggen als deze les aan de beurt is */
  begroeting?: string;
  nieuweToetsen: string[];
  geleerdeToetsen: string[];
  doelen: string[];
  klassikaal: { duurMinuten: number; materiaal: string; stappen: KlassikaleStap[] };
  online: Blok[];
  groepjes: string[];
  woorden: string[];
  zinnen: string[];
  tipLeerkracht: string;
}

/** Een deel van het toetsenbordhuis: een tabblad op het startscherm. */
export interface Deel {
  nummer: number;
  titel: string;
  /** de nummers (id) van de lessen in dit deel, in volgorde */
  lessen: number[];
}
