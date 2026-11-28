// Willekeurige reeksen voor de oefeningen en spelletjes.
// De toevalsfunctie wordt meegegeven, zodat de tests voorspelbaar zijn.

import type { Rij } from "./indeling";

export type Toeval = () => number;

function kies<T>(lijst: T[], rnd: Toeval): T {
  return lijst[Math.floor(rnd() * lijst.length) % lijst.length];
}

export function schud<T>(lijst: T[], rnd: Toeval): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1)) % (i + 1);
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/**
 * Kies een teken, maar nooit drie keer na elkaar hetzelfde (als er keuze is).
 */
function kiesZonderDrieOpRij(lijst: string[], vorige: string[], rnd: Toeval): string {
  const n = vorige.length;
  const verboden = n >= 2 && vorige[n - 1] === vorige[n - 2] ? vorige[n - 1] : null;
  const keuze = verboden === null ? lijst : lijst.filter((t) => t !== verboden);
  return kies(keuze.length > 0 ? keuze : lijst, rnd);
}

/**
 * Reeks voor "zoek-toets": ongeveer twee derde uit `nadruk`, de rest uit de
 * andere toetsen. Nooit twee keer na elkaar dezelfde toets (als er keuze is):
 * een kaart die niet verandert, lijkt een toets die niet telde (test van 28
 * november 2026: een kind en een volwassene merkten de herhaling niet op).
 */
export function zoekReeks(toetsen: string[], nadruk: string[] | undefined, aantal: number, rnd: Toeval = Math.random): string[] {
  const veel = nadruk && nadruk.length > 0 ? nadruk : toetsen;
  const rest = toetsen.filter((t) => !veel.includes(t));
  const uit: string[] = [];
  for (let i = 0; i < aantal; i++) {
    const vorige = uit[uit.length - 1];
    const uitNadruk = rest.length === 0 || rnd() < 2 / 3;
    const eerst = (uitNadruk ? veel : rest).filter((t) => t !== vorige);
    const anders = (uitNadruk ? rest : veel).filter((t) => t !== vorige);
    const lijst = eerst.length > 0 ? eerst : anders.length > 0 ? anders : toetsen;
    uit.push(kies(lijst, rnd));
  }
  return uit;
}

/**
 * Rondes voor "Licht aan in het huis": de eerste drie in vaste volgorde
 * (woonkamer, zolder, kelder), daarna willekeurig. Elke verdieping heeft
 * drie ramen, dus elke rij komt in totaal even vaak voor.
 */
export function lichtAanRondes(rijen: Rij[], rondes: number, rnd: Toeval = Math.random): Rij[] {
  const vast: Rij[] = (["woonkamer", "zolder", "kelder"] as Rij[]).filter((r) => rijen.includes(r));
  const perRij = Math.ceil(rondes / rijen.length);
  const rest: Rij[] = [];
  for (const r of rijen) {
    const al = vast.filter((v) => v === r).length;
    for (let i = al; i < perRij; i++) rest.push(r);
  }
  return [...vast, ...schud(rest, rnd)].slice(0, rondes);
}

/**
 * Stenen voor "Over de beek": elke derde steen is een lange platte steen
 * voor de spatie, de andere stenen krijgen een letter.
 */
export function beekStenen(letters: string[], aantal: number, rnd: Toeval = Math.random): string[] {
  const uit: string[] = [];
  const alleenLetters: string[] = [];
  for (let i = 0; i < aantal; i++) {
    if (i % 3 === 2) {
      uit.push(" ");
    } else {
      const l = kiesZonderDrieOpRij(letters, alleenLetters, rnd);
      alleenLetters.push(l);
      uit.push(l);
    }
  }
  return uit;
}

/**
 * Regels met woorden voor een spel in het spelsjabloon: `aantalRegels` regels
 * van `perRegel` woorden, elk woord hoogstens een keer (als de lijst lang
 * genoeg is). Elke regel eindigt op een spatie, zoals bij "Over de beek": wie
 * uit gewoonte een spatie typt na het laatste woord, maakt zo geen fout.
 */
export function woordRegels(woorden: string[], aantalRegels: number, perRegel: number, rnd: Toeval = Math.random): string[] {
  let voorraad: string[] = [];
  const regels: string[] = [];
  for (let r = 0; r < aantalRegels; r++) {
    const regel: string[] = [];
    for (let w = 0; w < perRegel; w++) {
      if (voorraad.length === 0) voorraad = schud(woorden, rnd);
      regel.push(voorraad.pop()!);
    }
    regels.push(`${regel.join(" ")} `);
  }
  return regels;
}
