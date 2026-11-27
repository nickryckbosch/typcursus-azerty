// Metingen per toets (projectdocument 12 "Metingen per toets").
//
// Per poging van een oefening bewaren we een samenvatting per toets, geen
// losse aanslagen en geen getypte tekst.
//
// Definities:
// - Positie: elk teken in de oefentekst.
// - Meteen juist: op die positie meteen de juiste toets.
// - Fout: minstens een verkeerde toets op die positie. Een positie telt
//   hoogstens een fout, hoe vaak het kind ook verkeerd drukt. We bewaren wel
//   elke verkeerde toets die getypt werd ("verkeerd").
// - Nauwkeurigheid = posities meteen juist / posities. Dit is het getal voor
//   de 90%-regel en de sterren.
// - Tijd van een aanslag = keydown tot keydown. Ze telt alleen mee als
//   1. deze positie meteen juist was;
//   2. de vorige positie ook meteen juist was (geen vertraging na een fout);
//   3. het niet de eerste positie van een regel is;
//   4. de vorige toets niet dezelfde toets was (zoals in "fff");
//   5. de tijd tussen 40 en 4000 ms ligt (METING in instellingen.ts).
//   Een propere aanslag (regel 1 tot 4) boven 4000 ms telt niet voor de tijd,
//   maar wel apart als lange pauze.
// - Per toets bewaren we de mediaan van de tijden, niet het gemiddelde.
//
// Zelf geschreven; er is geen code van Keybr of een ander project gebruikt.

import { METING } from "./instellingen";
import type { TypOefening } from "./typen";

export interface ToetsMeting {
  /** hoe vaak de toets moest getypt worden (aantal posities) */
  aantal: number;
  /** posities waar het kind minstens een keer verkeerd drukte */
  fouten: number;
  /** welke toetsen het kind dan typte: getypte toets -> aantal keer */
  verkeerd: Record<string, number>;
  /** mediaan van de tijden die meetellen, in ms; null als er geen zijn */
  tijdMediaanMs: number | null;
  /** aantal tijden in de mediaan */
  tijdMetingen: number;
  /** propere aanslagen die langer dan de bovengrens duurden */
  langePauzes: number;
}

/** De samenvatting van een poging van een oefening. */
export interface PogingMeting {
  les: number;
  /** soort blok: "reeks", "eindoefening", "zoek-toets", "spel" of "extra" */
  blok: string;
  /** lokale datum en tijd, bv. "2026-12-01T09:15:00" */
  datum: string;
  posities: number;
  meteenJuist: number;
  toetsen: Record<string, ToetsMeting>;
}

/** Wat overblijft van pogingen die niet meer volledig bewaard worden: de tellingen per toets. */
export interface ToetsTotaal {
  aantal: number;
  fouten: number;
  verkeerd: Record<string, number>;
  langePauzes: number;
}

/** Wat de leerkracht per toets ziet. */
export interface ToetsOverzicht extends ToetsTotaal {
  /** mediaan van de tijdmedianen per poging (alleen de pogingen die nog volledig bewaard zijn) */
  tijdMediaanMs: number | null;
  tijdMetingen: number;
}

/** De middelste waarde; bij een even aantal het gemiddelde van de twee middelste. Leeg: null. */
export function mediaan(getallen: number[]): number | null {
  if (getallen.length === 0) return null;
  const s = [...getallen].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Lokale datum en tijd zonder tijdzone, bv. "2026-12-01T09:15:00". */
export function datumNu(nu: Date = new Date()): string {
  const twee = (n: number) => String(n).padStart(2, "0");
  return `${nu.getFullYear()}-${twee(nu.getMonth() + 1)}-${twee(nu.getDate())}T${twee(nu.getHours())}:${twee(nu.getMinutes())}:${twee(nu.getSeconds())}`;
}

function telOp(doel: Record<string, number>, bron: Record<string, number>): void {
  for (const [toets, n] of Object.entries(bron)) doel[toets] = (doel[toets] ?? 0) + n;
}

/**
 * Vat een poging samen. Elke TypOefening is een regel: de eerste positie van
 * elke regel heeft geen tijd (er is geen vorige aanslag).
 */
export function vatSamen(regels: TypOefening[], info: { les: number; blok: string; datum?: string }): PogingMeting {
  const toetsen: Record<string, ToetsMeting> = {};
  const tijden: Record<string, number[]> = {};
  let posities = 0;
  let meteenJuist = 0;

  for (const regel of regels) {
    let vorigeMeteenJuist = false;
    let vorigeToets: string | null = null; // null: eerste positie van de regel
    let foutOpDezePositie = false;
    for (const a of regel.aanslagen) {
      const t = (toetsen[a.verwacht] ??= { aantal: 0, fouten: 0, verkeerd: {}, tijdMediaanMs: null, tijdMetingen: 0, langePauzes: 0 });
      if (!a.juist) {
        // Een fout telt een keer per positie; elke verkeerde toets wordt wel onthouden.
        if (!foutOpDezePositie) t.fouten++;
        foutOpDezePositie = true;
        t.verkeerd[a.getypt] = (t.verkeerd[a.getypt] ?? 0) + 1;
        continue;
      }
      // De juiste toets: de positie is af.
      posities++;
      t.aantal++;
      const meteen = !foutOpDezePositie;
      if (meteen) meteenJuist++;
      const proper = meteen && vorigeMeteenJuist && vorigeToets !== null && vorigeToets !== a.verwacht && a.tijdMs !== null;
      if (proper && a.tijdMs !== null) {
        if (a.tijdMs > METING.maxTijdMs) t.langePauzes++;
        else if (a.tijdMs >= METING.minTijdMs) (tijden[a.verwacht] ??= []).push(a.tijdMs);
      }
      vorigeMeteenJuist = meteen;
      vorigeToets = a.verwacht;
      foutOpDezePositie = false;
    }
  }

  for (const [toets, lijst] of Object.entries(tijden)) {
    const m = mediaan(lijst);
    toetsen[toets].tijdMediaanMs = m === null ? null : Math.round(m);
    toetsen[toets].tijdMetingen = lijst.length;
  }
  return { les: info.les, blok: info.blok, datum: info.datum ?? datumNu(), posities, meteenJuist, toetsen };
}

/** Nauwkeurigheid van een poging: posities meteen juist / posities. Zonder posities: 1. */
export function nauwkeurigheidVan(poging: Pick<PogingMeting, "posities" | "meteenJuist">): number {
  return poging.posities === 0 ? 1 : poging.meteenJuist / poging.posities;
}

/** Waar de metingen bewaard worden (een deel van de voortgang). */
export interface MetingenOpslag {
  /** de laatste pogingen, oudste eerst (hoogstens METING.maxPogingen) */
  metingen: PogingMeting[];
  /** de tellingen per toets van oudere pogingen die niet meer volledig bewaard zijn */
  metingenOuder: Record<string, ToetsTotaal>;
}

export function leegTotaal(): ToetsTotaal {
  return { aantal: 0, fouten: 0, verkeerd: {}, langePauzes: 0 };
}

/**
 * Bewaar een poging. Zijn er meer dan het maximum, dan worden de oudste
 * opgeteld per toets (metingenOuder) en uit de lijst gehaald. Zo gaan de
 * tellingen nooit verloren en blijft localStorage klein.
 */
export function voegPogingToe(opslag: MetingenOpslag, poging: PogingMeting, maxPogingen: number = METING.maxPogingen): void {
  opslag.metingen.push(poging);
  while (opslag.metingen.length > maxPogingen) {
    const oud = opslag.metingen.shift()!;
    for (const [toets, m] of Object.entries(oud.toetsen)) {
      const totaal = (opslag.metingenOuder[toets] ??= leegTotaal());
      totaal.aantal += m.aantal;
      totaal.fouten += m.fouten;
      totaal.langePauzes += m.langePauzes;
      telOp(totaal.verkeerd, m.verkeerd);
    }
  }
}

/**
 * Het overzicht per toets voor de leerkracht: alles opgeteld, en als tijd de
 * mediaan van de tijdmedianen per poging.
 */
export function overzichtPerToets(opslag: MetingenOpslag): Record<string, ToetsOverzicht> {
  const uit: Record<string, ToetsOverzicht> = {};
  const medianen: Record<string, number[]> = {};
  const rij = (toets: string) => (uit[toets] ??= { ...leegTotaal(), tijdMediaanMs: null, tijdMetingen: 0 });
  for (const [toets, t] of Object.entries(opslag.metingenOuder)) {
    const r = rij(toets);
    r.aantal += t.aantal;
    r.fouten += t.fouten;
    r.langePauzes += t.langePauzes;
    telOp(r.verkeerd, t.verkeerd);
  }
  for (const poging of opslag.metingen) {
    for (const [toets, m] of Object.entries(poging.toetsen)) {
      const r = rij(toets);
      r.aantal += m.aantal;
      r.fouten += m.fouten;
      r.langePauzes += m.langePauzes;
      r.tijdMetingen += m.tijdMetingen;
      telOp(r.verkeerd, m.verkeerd);
      if (m.tijdMediaanMs !== null) (medianen[toets] ??= []).push(m.tijdMediaanMs);
    }
  }
  for (const [toets, lijst] of Object.entries(medianen)) {
    const m = mediaan(lijst);
    uit[toets].tijdMediaanMs = m === null ? null : Math.round(m);
  }
  return uit;
}

export function foutAandeel(t: Pick<ToetsTotaal, "aantal" | "fouten">): number {
  return t.aantal === 0 ? 0 : t.fouten / t.aantal;
}

/** De verkeerde toets die het vaakst getypt werd, of null. */
export function meestVerkeerd(verkeerd: Record<string, number>): { toets: string; aantal: number } | null {
  let beste: { toets: string; aantal: number } | null = null;
  for (const [toets, aantal] of Object.entries(verkeerd)) {
    if (!beste || aantal > beste.aantal) beste = { toets, aantal };
  }
  return beste;
}
