// Teksten met een eenvoudige opmaak:
//   [spatie]  wordt een getekende toets, zoals op het toetsenbord
//   **zolder** wordt vet
//   ((Start)) wordt een klein getekend knopje, zoals de echte knop op het scherm
// Zo kan een opdracht in de JSON-bestanden de toets tonen die het kind moet indrukken.

import { el } from "./dom";

const PATROON = /\[([^\]]+)\]|\*\*([^*]+)\*\*|\(\(([^)]+)\)\)/g;

/**
 * @param beelden optioneel: zet een klein beeldje meteen na een woord in de tekst,
 *   bv. { lamp: () => lampIcoon() } zet het beeldje van de lamp na het woord "lamp".
 */
export function tekstMetToetsen(tekst: string, beelden: Record<string, () => Node> = {}): Node[] {
  const uit: Node[] = [];
  let vanaf = 0;
  for (const m of tekst.matchAll(PATROON)) {
    if (m.index > vanaf) uit.push(document.createTextNode(tekst.slice(vanaf, m.index)));
    if (m[1] !== undefined) uit.push(el("span", { class: "toets-in-tekst" }, m[1]));
    else if (m[3] !== undefined) uit.push(el("span", { class: "knop-in-tekst" }, m[3]));
    else uit.push(el("strong", {}, m[2]));
    vanaf = m.index + m[0].length;
  }
  if (vanaf < tekst.length) uit.push(document.createTextNode(tekst.slice(vanaf)));
  return Object.keys(beelden).length === 0 ? uit : uit.flatMap((n) => voegBeeldenToe(n, beelden));
}

function voegBeeldenToe(node: Node, beelden: Record<string, () => Node>): Node[] {
  if (node.nodeType !== Node.TEXT_NODE) return [node];
  const tekst = node.textContent ?? "";
  for (const [woord, maak] of Object.entries(beelden)) {
    const m = new RegExp(`\\b${woord}\\b`, "i").exec(tekst);
    if (!m) continue;
    const einde = m.index + m[0].length;
    return [
      document.createTextNode(tekst.slice(0, einde) + "\u00a0"),
      el("span", { class: "beeld-in-tekst", "aria-hidden": "true" }, maak()),
      document.createTextNode(tekst.slice(einde)),
    ];
  }
  return [node];
}

/** Dezelfde tekst zonder opmaak, om voor te lezen. */
export function zonderOpmaak(tekst: string): string {
  return tekst.replace(PATROON, (_, toets: string | undefined, vet: string | undefined, knop: string | undefined) => (toets ?? vet ?? knop ?? "").replace("↵", "").trim());
}
