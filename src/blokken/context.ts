// Wat elk blok van een les krijgt om mee te werken.

import type { App } from "../app";
import type { Blok, Les } from "../content/types";
import type { Aanslag } from "../logica/typen";
import type { HandenWeergave } from "../weergave/handen";
import type { ToetsenbordWeergave } from "../weergave/toetsenbord";

export interface EindResultaat {
  nauwkeurigheid: number;
  gehaald: boolean;
  sterren: number;
  kort: boolean;
}

export interface BlokContext {
  app: App;
  les: Les;
  /** het grote vlak in het midden, waar het blok zich tekent */
  podium: HTMLElement;
  toetsenbord: ToetsenbordWeergave;
  handen: HandenWeergave;
  /** toon op toetsenbord en hand welke toets en vinger nodig zijn (null: niets tonen) */
  toonHulp(teken: string | null): void;
  /** lees voor (als voorlezen aan staat) en onthoud voor "lees nog eens" */
  zeg(tekst: string): void;
  /** naar het volgende blok */
  volgende(): void;
  /** naar een bepaald blok (bv. eindoefening opnieuw) */
  gaNaar(index: number): void;
  indexVan(type: Blok["type"]): number;
  /** voeg aanslagen toe aan de statistieken per toets en bewaar */
  bewaarAanslagen(aanslagen: Aanslag[]): void;
  /** setTimeout die vanzelf stopt als het blok wisselt */
  later(fn: () => void, ms: number): void;
  /** gegevens die blokken binnen deze les doorgeven (eindoefening naar afsluiter) */
  sessie: { resultaat?: EindResultaat };
}

export interface BlokInstantie {
  opToets?(e: KeyboardEvent): void;
  opruimen?(): void;
}

export type BlokFunctie<B extends Blok = Blok> = (blok: B, ctx: BlokContext) => BlokInstantie;
