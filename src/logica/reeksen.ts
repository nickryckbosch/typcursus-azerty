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
 * andere toetsen.
 */
export function zoekReeks(toetsen: string[], nadruk: string[] | undefined, aantal: number, rnd: Toeval = Math.random): string[] {
  const veel = nadruk && nadruk.length > 0 ? nadruk : toetsen;
  const rest = toetsen.filter((t) => !veel.includes(t));
  const uit: string[] = [];
  for (let i = 0; i < aantal; i++) {
    const uitNadruk = rest.length === 0 || rnd() < 2 / 3;
    let lijst = uitNadruk ? veel : rest;
    // Zou dit de derde keer op rij hetzelfde teken geven, kies dan uit de andere groep.
    const n = uit.length;
    if (lijst.length === 1 && n >= 2 && uit[n - 1] === lijst[0] && uit[n - 2] === lijst[0]) {
      lijst = uitNadruk ? (rest.length > 0 ? rest : veel) : veel;
    }
    uit.push(kiesZonderDrieOpRij(lijst, uit, rnd));
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
