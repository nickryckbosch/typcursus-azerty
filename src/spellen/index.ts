// De spelletjes, op naam zoals in het veld "spel" van de lesinhoud.
// Afspraak voor alle spelletjes: geen tijd, geen punten, geen game-over;
// een fout kost niets en de juiste vinger licht op.

import type { BlokFunctie } from "../blokken/context";
import type { SpelBlok } from "../content/types";
import { beek } from "./beek";
import { lichtAan } from "./lichtaan";

export const SPELLEN: Record<string, BlokFunctie<SpelBlok>> = {
  "licht-aan": lichtAan,
  beek,
};
