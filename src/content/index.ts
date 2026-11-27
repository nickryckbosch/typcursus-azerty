// Laadt de lesinhoud en de teksten van de app. Alle tekst voor het kind
// staat in JSON in src/content/<taal>/, niet in de code. Een Franstalige
// versie krijgt later een map fr-BE met dezelfde bestanden.

import type { Les } from "./types";
import tekstenNl from "./nl-BE/teksten.json";

const lesBestanden = import.meta.glob("./nl-BE/les-*.json", { eager: true, import: "default" });

export const LESSEN: Les[] = Object.values(lesBestanden)
  .map((l) => l as Les)
  .sort((a, b) => a.id - b.id);

export type TekstSleutel = keyof typeof tekstenNl;

const TEKSTEN: Record<string, string> = tekstenNl;

/** Geef een tekst, met {naam} vervangen door de meegegeven waarden. */
export function t(sleutel: TekstSleutel, waarden: Record<string, string | number> = {}): string {
  const tekst = TEKSTEN[sleutel] ?? sleutel;
  return tekst.replace(/\{(\w+)\}/g, (_, naam: string) => String(waarden[naam] ?? `{${naam}}`));
}
