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
  /** een prent bij de tekst, in de zone van de prent; "huis": het huis van "Licht aan in het huis" */
  prent?: "huis";
  /**
   * Een intro in stukken (les 1), in plaats van een tekst in een tekstballon:
   * bovenaan een of twee losse zinnen, Fien en Jef groot in het midden met elk
   * een eigen tekstballon, en onderaan een zin boven de knop Verder.
   * Heeft het blok "fien" en "jef", dan gebruikt de intro deze indeling.
   */
  boven?: string[];
  /** wat Fien zegt, in haar eigen tekstballon */
  fien?: string;
  /** wat Jef zegt, in zijn eigen tekstballon */
  jef?: string;
  /** de zin boven de knop Verder, bv. wat het kind vandaag leert */
  onder?: string;
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
  /**
   * De doelzin (K26): waar werkt het kind naartoe, en wat doet een goede toets.
   * Staat het hele spel in de tekstballon van Fien en Jef.
   */
  doel: string;
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
