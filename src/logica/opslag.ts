// Voortgang bewaren in localStorage, met een versienummer.
// Elke lees- en schrijfactie zit in try/catch: localStorage kan ontbreken
// (bv. in een privevenster op sommige toestellen), vol zijn, of kapotte
// gegevens bevatten. De app werkt dan gewoon verder, zonder te bewaren.

import { legeLesVoortgang, nieuweVoortgang, VERSIE, type Voortgang } from "./voortgang";
import { leegTotaal, voegPogingToe, type PogingMeting } from "./metingen";

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

/** Een map "toets -> aantal", zonder kapotte waarden. */
function tellingen(x: unknown): Record<string, number> {
  const uit: Record<string, number> = {};
  if (!isObject(x)) return uit;
  for (const [toets, n] of Object.entries(x)) {
    if (typeof n === "number" && Number.isFinite(n) && n > 0) uit[toets] = n;
  }
  return uit;
}

function leesPoging(x: unknown): PogingMeting | null {
  if (!isObject(x) || !isObject(x.toetsen)) return null;
  const toetsen: PogingMeting["toetsen"] = {};
  for (const [toets, m] of Object.entries(x.toetsen)) {
    if (!isObject(m)) continue;
    toetsen[toets] = {
      aantal: getal(m.aantal, 0),
      fouten: getal(m.fouten, 0),
      verkeerd: tellingen(m.verkeerd),
      tijdMediaanMs: typeof m.tijdMediaanMs === "number" && Number.isFinite(m.tijdMediaanMs) ? m.tijdMediaanMs : null,
      tijdMetingen: getal(m.tijdMetingen, 0),
      langePauzes: getal(m.langePauzes, 0),
    };
  }
  return {
    les: getal(x.les, 0),
    blok: typeof x.blok === "string" ? x.blok : "",
    datum: typeof x.datum === "string" ? x.datum : "",
    posities: getal(x.posities, 0),
    meteenJuist: getal(x.meteenJuist, 0),
    toetsen,
  };
}

/**
 * Zet gelezen gegevens om naar het huidige formaat. Onbekende of kapotte
 * velden krijgen hun standaardwaarde.
 *
 * Versie 1 naar versie 2: lessen, instellingen en toetsenbord blijven zoals
 * ze zijn. De oude tellingen per toets worden omgezet naar "metingenOuder":
 * - aantal = de juiste aanslagen (elke positie eindigt met een juiste aanslag);
 * - fouten = de verkeerde aanslagen, maar hoogstens het aantal posities. Dat is
 *   een benadering: versie 1 telde elke verkeerde aanslag, versie 2 een fout
 *   per positie;
 * - welke toets er verkeerd getypt werd en de tijd zijn niet om te zetten
 *   (versie 1 bewaarde dat niet, of mat het anders) en beginnen opnieuw.
 */
export function zetOm(ruw: unknown): Voortgang {
  const v = nieuweVoortgang();
  if (!isObject(ruw) || (ruw.versie !== VERSIE && ruw.versie !== 1)) return v;

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
        // Oudere gegevens zonder dit veld: een les die gelukt is, is ook tot het einde gedaan.
        eindeBereikt: l.eindeBereikt === true || l.afgewerkt === true,
      };
    }
  }

  if (ruw.versie === 1) {
    // De oude tellingen per toets: { aanslagen, fouten, totaleTijdMs, getimed }.
    if (isObject(ruw.toetsen)) {
      for (const [teken, s] of Object.entries(ruw.toetsen)) {
        if (!isObject(s)) continue;
        const verkeerdeAanslagen = getal(s.fouten, 0);
        const aantal = Math.max(0, getal(s.aanslagen, 0) - verkeerdeAanslagen);
        if (aantal === 0) continue;
        v.metingenOuder[teken] = { ...leegTotaal(), aantal, fouten: Math.min(verkeerdeAanslagen, aantal) };
      }
    }
  } else {
    if (Array.isArray(ruw.metingen)) {
      // Is de lijst te lang (bv. na een lagere grens), dan schuiven de oudste door naar metingenOuder.
      for (const x of ruw.metingen) {
        const poging = leesPoging(x);
        if (poging) voegPogingToe(v, poging);
      }
    }
    if (isObject(ruw.metingenOuder)) {
      for (const [teken, t] of Object.entries(ruw.metingenOuder)) {
        if (!isObject(t)) continue;
        const bij = (v.metingenOuder[teken] ??= leegTotaal());
        bij.aantal += getal(t.aantal, 0);
        bij.fouten += getal(t.fouten, 0);
        bij.langePauzes += getal(t.langePauzes, 0);
        for (const [toets, n] of Object.entries(tellingen(t.verkeerd))) bij.verkeerd[toets] = (bij.verkeerd[toets] ?? 0) + n;
      }
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
