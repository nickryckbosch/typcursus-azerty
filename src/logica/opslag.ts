// Voortgang bewaren in localStorage, met een versienummer.
// Elke lees- en schrijfactie zit in try/catch: localStorage kan ontbreken
// (bv. in een privevenster op sommige toestellen), vol zijn, of kapotte
// gegevens bevatten. De app werkt dan gewoon verder, zonder te bewaren.

import { legeLesVoortgang, nieuweVoortgang, VERSIE, type Voortgang } from "./voortgang";
import { legeStat } from "./statistieken";

export const SLEUTEL = "typcursus-azerty";

export type Opslag = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function standaardOpslag(): Opslag | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function leesVoortgang(opslag: Opslag | null = standaardOpslag()): Voortgang {
  if (!opslag) return nieuweVoortgang();
  try {
    const tekst = opslag.getItem(SLEUTEL);
    if (!tekst) return nieuweVoortgang();
    return zetOm(JSON.parse(tekst));
  } catch {
    return nieuweVoortgang();
  }
}

export function bewaarVoortgang(v: Voortgang, opslag: Opslag | null = standaardOpslag()): boolean {
  if (!opslag) return false;
  try {
    opslag.setItem(SLEUTEL, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
}

export function wisVoortgang(opslag: Opslag | null = standaardOpslag()): boolean {
  if (!opslag) return false;
  try {
    opslag.removeItem(SLEUTEL);
    return true;
  } catch {
    return false;
  }
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function getal(x: unknown, standaard: number): number {
  return typeof x === "number" && Number.isFinite(x) ? x : standaard;
}

/**
 * Zet gelezen gegevens om naar het huidige formaat. Onbekende of kapotte
 * velden krijgen hun standaardwaarde. Komt er later een versie 2, dan komt
 * de omzetting van versie 1 naar 2 hier.
 */
export function zetOm(ruw: unknown): Voortgang {
  const v = nieuweVoortgang();
  if (!isObject(ruw) || ruw.versie !== VERSIE) return v;

  if (isObject(ruw.lessen)) {
    for (const [id, l] of Object.entries(ruw.lessen)) {
      if (!isObject(l)) continue;
      const leeg = legeLesVoortgang();
      v.lessen[id] = {
        afgewerkt: l.afgewerkt === true,
        pogingen: getal(l.pogingen, 0),
        mislukt: getal(l.mislukt, 0),
        besteNauwkeurigheid: typeof l.besteNauwkeurigheid === "number" ? l.besteNauwkeurigheid : null,
        sterren: getal(l.sterren, 0),
        snelheden: Array.isArray(l.snelheden) ? l.snelheden.filter((s) => typeof s === "number") : leeg.snelheden,
        bezigBij: typeof l.bezigBij === "number" && l.bezigBij > 0 ? l.bezigBij : null,
      };
    }
  }
  if (isObject(ruw.toetsen)) {
    for (const [teken, s] of Object.entries(ruw.toetsen)) {
      if (!isObject(s)) continue;
      const leeg = legeStat();
      v.toetsen[teken] = {
        aanslagen: getal(s.aanslagen, leeg.aanslagen),
        fouten: getal(s.fouten, leeg.fouten),
        totaleTijdMs: getal(s.totaleTijdMs, leeg.totaleTijdMs),
        getimed: getal(s.getimed, leeg.getimed),
      };
    }
  }
  if (isObject(ruw.instellingen)) {
    v.instellingen.voorlezen = ruw.instellingen.voorlezen === true;
    v.instellingen.hulpPasNaFout = ruw.instellingen.hulpPasNaFout === true;
  }
  if (ruw.toetsenbord === "ok" || ruw.toetsenbord === "fout") v.toetsenbord = ruw.toetsenbord;
  v.allesOpen = ruw.allesOpen === true;
  return v;
}
