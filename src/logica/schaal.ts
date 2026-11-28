// Schalen als een dia (docs/beslissingen.md, 12p).
//
// De app is ontworpen voor een Chromebook: 1366 x 768. Is het venster groter,
// dan schaalt het hele scherm in dezelfde verhouding mee tot het venster gevuld
// is, zoals een dia in een presentatie. Thuis ziet een kind dus hetzelfde als op
// school, alleen groter.
//
// Nooit kleiner dan 1: in een kleiner venster (een Chromebook met de adresbalk
// en de tabbladen, dus minder dan 768 hoog) blijft alles zoals het was, en past
// de indeling zich aan de hoogte aan (12b).

export const ONTWERP = { breedte: 1366, hoogte: 768 };

/** De schaal voor een venster van deze maat: 1 of groter. */
export function schaalVoor(breedte: number, hoogte: number): number {
  const s = Math.min(breedte / ONTWERP.breedte, hoogte / ONTWERP.hoogte);
  return Number.isFinite(s) && s > 1 ? s : 1;
}
