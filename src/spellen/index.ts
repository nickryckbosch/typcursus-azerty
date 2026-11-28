// De spelletjes, op naam zoals in het veld "spel" van de lesinhoud.
// Afspraak voor alle spelletjes: geen tijd, geen punten, geen game-over;
// een fout kost niets en de juiste vinger licht op.

import type { BlokFunctie } from "../blokken/context";
import type { SpelBlok } from "../content/types";
import { beek, voorlopigSpel } from "./beek";
import { lichtAan } from "./lichtaan";

export const SPELLEN: Record<string, BlokFunctie<SpelBlok>> = {
  "licht-aan": lichtAan,
  beek,
  // Voorlopig (zie beek.ts): de spellen van les 2 tot 5 gebruiken de stapstenen
  // van "Over de beek" tot ze hun eigen strook hebben.
  overgooien: voorlopigSpel,
  dijk: voorlopigSpel,
  slee: voorlopigSpel,
  egel: voorlopigSpel,
};

/** Is dit spel nog voorlopig (met de strook van de beek)? */
export function isVoorlopig(spel: string): boolean {
  return SPELLEN[spel] === voorlopigSpel;
}
