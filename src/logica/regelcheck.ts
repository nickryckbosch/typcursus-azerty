// De regels waaraan elke oefenregel moet voldoen (het "controlescript").
// De test op de lesinhoud (tests/inhoud.test.ts) en de generator voor extra
// oefenen (extraoefenen.ts) gebruiken allebei deze ene functie.
//
// 1. Alleen geleerde toetsen (plus de spatie, als die geleerd is).
// 2. Hoogstens vier aanslagen na elkaar met dezelfde vinger.
// 3. Hoogstens zeven letters na elkaar met dezelfde hand.
//
// De spatie onderbreekt een reeks: de duim typt ze, en daarna begint het
// tellen opnieuw. Zo mag "fff jjj" (drie keer dezelfde vinger, spatie, drie
// keer de andere), maar "fffff" niet.

import { handVanVinger, toetsVoorTeken } from "./indeling";

export const MAX_ZELFDE_VINGER = 4;
export const MAX_ZELFDE_HAND = 7;

export interface RegelControle {
  ok: boolean;
  /** waarom de regel niet goed is (alleen als ok false is) */
  reden?: string;
}

export function controleerRegel(regel: string, geleerd: Iterable<string>): RegelControle {
  const mag = new Set(geleerd);
  let vorigeVinger: string | null = null;
  let vorigeHand: string | null = null;
  let opVinger = 0;
  let opHand = 0;
  for (const teken of regel) {
    if (!mag.has(teken)) return { ok: false, reden: `"${teken}" is nog niet geleerd` };
    const gevonden = toetsVoorTeken(teken);
    if (!gevonden) return { ok: false, reden: `"${teken}" staat niet op het toetsenbord` };
    if (teken === " ") {
      vorigeVinger = vorigeHand = null;
      opVinger = opHand = 0;
      continue;
    }
    const vinger = gevonden.toets.vinger;
    const hand = handVanVinger(vinger);
    opVinger = vinger === vorigeVinger ? opVinger + 1 : 1;
    opHand = hand === vorigeHand ? opHand + 1 : 1;
    vorigeVinger = vinger;
    vorigeHand = hand;
    if (opVinger > MAX_ZELFDE_VINGER) return { ok: false, reden: `meer dan ${MAX_ZELFDE_VINGER} aanslagen na elkaar met dezelfde vinger` };
    if (opHand > MAX_ZELFDE_HAND) return { ok: false, reden: `meer dan ${MAX_ZELFDE_HAND} letters na elkaar met dezelfde hand` };
  }
  return { ok: true };
}
