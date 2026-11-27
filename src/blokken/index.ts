// Welk bloktype wordt door welke code getekend. Een nieuw bloktype of spel
// toevoegen: schrijf de functie en zet ze hier (of in spellen/index.ts) in de lijst.

import type { Blok, Les } from "../content/types";
import { SPELLEN } from "../spellen";
import type { BlokFunctie } from "./context";
import { afsluiter } from "./afsluiter";
import { eindoefening } from "./eindoefening";
import { intro } from "./intro";
import { reeks } from "./reeks";
import { toetsenbordcheck } from "./toetsenbordcheck";
import { zoekToets } from "./zoektoets";

const BLOKKEN: Partial<Record<Blok["type"], BlokFunctie<never>>> = {
  intro,
  toetsenbordcheck,
  "zoek-toets": zoekToets,
  reeks,
  eindoefening,
  afsluiter,
};

export function blokFunctie(blok: Blok): BlokFunctie | undefined {
  if (blok.type === "spel") return SPELLEN[blok.spel] as BlokFunctie | undefined;
  return BLOKKEN[blok.type] as BlokFunctie | undefined;
}

/** Een les is beschikbaar als elk blok (en elk spel) al gebouwd is. */
export function isBeschikbaar(les: Les): boolean {
  return les.online.every((b) => blokFunctie(b) !== undefined);
}
