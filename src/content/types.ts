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
   * Een intro in stukken, in plaats van een tekst in een tekstballon. Elke les
   * mag deze vorm gebruiken (les 1 doet het):
   * bovenaan een of twee losse zinnen, Fien en Jef groot in het midden met elk
   * een eigen tekstballon, en onderaan een zin boven de knop Verder.
   * Heeft het blok "fien" en "jef", dan gebruikt de intro deze indeling.
   */
  tekstBoven?: string[];
  /** wat Fien zegt, in haar eigen tekstballon */
  fien?: string;
  /** wat Jef zegt, in zijn eigen tekstballon */
  jef?: string;
  /** de zin boven de knop Verder, bv. wat het kind vandaag leert */
  tekstOnder?: string;
  /**
   * Toon de namen van de rijen (zolder, woonkamer, kelder) in de randtoetsen
   * links op het schermtoetsenbord, zolang deze intro in beeld is.
   */
  rijnamen?: boolean;
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
  /** korte tip van Fien of Jef, in de tekstballon naast de oefenregels */
  tip?: string;
  beschrijving?: string;
}

export interface AfsluiterBlok extends BlokBasis {
  type: "afsluiter";
}

// ---------- De stappen van de oriëntatieles (les 0) ----------
// Elke stap is een beweging die de app kan nakijken, geen overhoring. Er wordt
// niets gemeten. Alle teksten staan in de lesdata. De opdracht staat in "tekst".

/** Goed zitten: de houding, met drie rustige kaartjes. Geen toetsen. */
export interface HoudingBlok extends BlokBasis {
  type: "houding";
  /** wat Fien en Jef zeggen, in hun tekstballon */
  zegt: string;
  kaartjes: { titel: string; tekst: string }[];
}

/** Een toets die het kind bij naam leert. De app herkent ze aan de toetscode. */
export type NaamToets = "spatie" | "enter" | "backspace" | "shift";

/** Toetsenjacht: zoek de toets die je ziet (spatiebalk, Enter, Backspace, Shift). */
export interface ToetsenjachtBlok extends BlokBasis {
  type: "toetsenjacht";
  /** de toetsen, in de volgorde van de eerste ronde; het schermtoetsenbord wijst ze dan aan */
  naamtoetsen: { toets: NaamToets; naam: string; zin: string }[];
  /** de tweede ronde: zonder hulp, tot na een fout. De laatste is nooit Enter. */
  herhaling: NaamToets[];
  /** na een verkeerde toets, op een vaste plek */
  fout: string;
  /** wat Fien en Jef op het einde zeggen */
  slot: string;
}

/** Voel de bultjes: druk met gesloten ogen de twee toetsen met een bultje in. */
export interface BultjesBlok extends BlokBasis {
  type: "bultjes";
  /** hoe vaak het kind de twee bultjes zoekt */
  aantal: number;
  /** tussen twee beurten, als beide bultjes gevonden zijn */
  gevonden: string;
  /** na een andere toets */
  fout: string;
  slot: string;
}

/** Links, rechts, duim: tik met de vinger die je ziet (de twee bultjes en de spatiebalk). */
export interface TikBlok extends BlokBasis {
  type: "tik";
  volgorde: ("links" | "rechts" | "duim")[];
  /** het woord op de kaart, per vinger */
  opKaart: { links: string; rechts: string; duim: string };
  /** de wijsvinger van de verkeerde hand */
  foutHand: string;
  /** een andere verkeerde toets */
  foutVinger: string;
  slot: string;
}

export type Blok =
  | IntroBlok
  | ToetsenbordcheckBlok
  | ZoekToetsBlok
  | ReeksBlok
  | SpelBlok
  | EindoefeningBlok
  | AfsluiterBlok
  | HoudingBlok
  | ToetsenjachtBlok
  | BultjesBlok
  | TikBlok;

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
