// Het soort fout, afgeleid uit de toets die het kind typte in plaats van de
// juiste (projectdocument 12, hoofdstuk 3):
// - spiegelfout: dezelfde vinger op dezelfde plaats, maar met de andere hand
//   (bv. j in plaats van f). Tip: "andere hand".
// - buurfout: een toets die er fysiek direct naast, boven of onder ligt
//   (bv. g in plaats van f). Tip: "terug naar huis".
// - andere fout: de rest.
// Sommige paren zijn allebei (g en h, t en y, b en n liggen naast elkaar en
// zijn elkaars spiegelbeeld): dan geven we "spiegel-en-buur" terug.
//
// Alles wordt afgeleid uit de fysieke ligging van de toetsen (event.code via
// indeling.ts), niet uit een lijst met de hand.

import { RIJEN, toetsVoorTeken, type Rij } from "./indeling";

export type FoutSoort = "spiegel" | "buur" | "spiegel-en-buur" | "ander";

/**
 * Waar elke rij begint, in toetsbreedtes vanaf de linkerrand van het
 * toetsenbord (een ISO-toetsenbord zoals het Belgische): de rijen verspringen.
 * De spatiebalk ligt onder de kelder en is ongeveer 6 toetsen breed.
 */
const RIJ_LIGGING: Record<Rij, { hoogte: number; start: number; breedte: number }> = {
  dak: { hoogte: 0, start: 0, breedte: 1 },
  zolder: { hoogte: 1, start: 1.5, breedte: 1 },
  woonkamer: { hoogte: 2, start: 1.75, breedte: 1 },
  kelder: { hoogte: 3, start: 1.25, breedte: 1 },
  spatie: { hoogte: 4, start: 3.75, breedte: 6.25 },
};

interface Ligging {
  hoogte: number;
  links: number;
  rechts: number;
}

const LIGGING = new Map<string, Ligging>();
/** Voor de spiegeling: per letterrij de tien toetsen van de vingers, van links naar rechts. */
const SPIEGEL = new Map<string, string>();

for (const { rij, toetsen } of RIJEN) {
  const l = RIJ_LIGGING[rij];
  toetsen.forEach((toets, i) => {
    const links = l.start + i * l.breedte;
    LIGGING.set(toets.code, { hoogte: l.hoogte, links, rechts: links + l.breedte });
  });
  // De linkerhand typt vijf kolommen, de rechterhand de vijf ernaast. In de
  // kelder staat links nog de toets < (naast Shift): die telt niet mee.
  if (rij === "zolder" || rij === "woonkamer" || rij === "kelder") {
    const tien = toetsen.slice(rij === "kelder" ? 1 : 0).slice(0, 10);
    tien.forEach((toets, i) => SPIEGEL.set(toets.code, tien[9 - i].code));
  }
}

/** De code van de toets die het spiegelbeeld is (zelfde vinger, andere hand), of null. */
export function spiegelToets(code: string): string | null {
  return SPIEGEL.get(code) ?? null;
}

/** Liggen deze twee fysieke toetsen direct naast, boven of onder elkaar? */
export function zijnBuren(codeA: string, codeB: string): boolean {
  const a = LIGGING.get(codeA);
  const b = LIGGING.get(codeB);
  if (!a || !b || codeA === codeB) return false;
  const marge = 1e-9;
  if (a.hoogte === b.hoogte) return Math.abs(a.rechts - b.links) < marge || Math.abs(b.rechts - a.links) < marge;
  if (Math.abs(a.hoogte - b.hoogte) !== 1) return false;
  // Een rij hoger of lager: buren als ze elkaar raken (de toetsen overlappen in de breedte).
  return Math.min(a.rechts, b.rechts) - Math.max(a.links, b.links) > marge;
}

/**
 * Welk soort fout is het als het kind `getypt` typte waar `verwacht` moest komen?
 * Beide zijn tekens (zoals in de oefentekst en in event.key).
 */
export function soortFout(verwacht: string, getypt: string): FoutSoort {
  const a = toetsVoorTeken(verwacht)?.toets.code;
  const b = toetsVoorTeken(getypt)?.toets.code;
  if (!a || !b || a === b) return "ander";
  const spiegel = spiegelToets(a) === b;
  const buur = zijnBuren(a, b);
  if (spiegel && buur) return "spiegel-en-buur";
  if (spiegel) return "spiegel";
  if (buur) return "buur";
  return "ander";
}
