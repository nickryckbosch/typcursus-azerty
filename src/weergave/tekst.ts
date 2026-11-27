// Teksten met een eenvoudige opmaak:
//   [spatie]  wordt een getekende toets, zoals op het toetsenbord
//   **zolder** wordt vet
// Zo kan een opdracht in de JSON-bestanden de toets tonen die het kind moet indrukken.

import { el } from "./dom";

const PATROON = /\[([^\]]+)\]|\*\*([^*]+)\*\*/g;

export function tekstMetToetsen(tekst: string): Node[] {
  const uit: Node[] = [];
  let vanaf = 0;
  for (const m of tekst.matchAll(PATROON)) {
    if (m.index > vanaf) uit.push(document.createTextNode(tekst.slice(vanaf, m.index)));
    uit.push(m[1] !== undefined ? el("span", { class: "toets-in-tekst" }, m[1]) : el("strong", {}, m[2]));
    vanaf = m.index + m[0].length;
  }
  if (vanaf < tekst.length) uit.push(document.createTextNode(tekst.slice(vanaf)));
  return uit;
}

/** Dezelfde tekst zonder opmaak, om voor te lezen. */
export function zonderOpmaak(tekst: string): string {
  return tekst.replace(PATROON, (_, toets: string | undefined, vet: string | undefined) => (toets ?? vet ?? "").replace("↵", "").trim());
}
