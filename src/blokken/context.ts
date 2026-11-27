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
  /** na een fout: toon de juiste toets en vinger, en laat ze even sterker oplichten */
  toonFout(teken: string | null): void;
  /**
   * Is de hulp altijd zichtbaar (K17, standaard), of pas na een fout of na
   * HULP_NA_MS wachten (instelling op het leerkrachtscherm)?
   */
  hulpAltijd: boolean;
  /** het nummer van dit blok in de les (vanaf 0) */
  blokNummer(): number;
  /** lees voor (als voorlezen aan staat) en onthoud voor "lees nog eens" */
  zeg(tekst: string): void;
  /** naar het volgende blok */
  volgende(): void;
  /** naar een bepaald blok (bv. eindoefening opnieuw) */
  gaNaar(index: number): void;
  indexVan(type: Blok["type"]): number;
  /** voeg aanslagen toe aan de statistieken per toets en bewaar */
  bewaarAanslagen(aanslagen: Aanslag[]): void;
  /** toon of verberg het schermtoetsenbord en de handen (bv. verbergen bij de afsluiter) */
  toonToetsenbord(aan: boolean): void;
  /** setTimeout die vanzelf stopt als het blok wisselt */
  later(fn: () => void, ms: number): void;
  /** wacht zo lang voor de hulp verschijnt, als de hulp niet altijd zichtbaar is */
  hulpNaMs: number;
  /** gegevens die blokken binnen deze les doorgeven (eindoefening naar afsluiter) */
  sessie: { resultaat?: EindResultaat };
}

export interface BlokInstantie {
  opToets?(e: KeyboardEvent): void;
  opruimen?(): void;
}

export type BlokFunctie<B extends Blok = Blok> = (blok: B, ctx: BlokContext) => BlokInstantie;
