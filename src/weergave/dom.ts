// Kleine hulpfuncties om HTML- en SVG-elementen te maken, zonder framework.

type Kind = Node | string | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  eigenschappen: Record<string, string | number | boolean | EventListener | undefined> = {},
  ...kinderen: Kind[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [naam, waarde] of Object.entries(eigenschappen)) {
    if (waarde === undefined || waarde === false) continue;
    if (naam.startsWith("on") && typeof waarde === "function") {
      e.addEventListener(naam.slice(2), waarde);
    } else if (naam === "class") {
      e.className = String(waarde);
    } else {
      e.setAttribute(naam, waarde === true ? "" : String(waarde));
    }
  }
  voegToe(e, kinderen);
  return e;
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributen: Record<string, string | number> = {},
  ...kinderen: Kind[]
): SVGElementTagNameMap[K] {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [naam, waarde] of Object.entries(attributen)) e.setAttribute(naam, String(waarde));
  voegToe(e, kinderen);
  return e;
}

function voegToe(e: Element, kinderen: Kind[]): void {
  for (const k of kinderen) {
    if (k === null || k === undefined || k === false) continue;
    e.append(typeof k === "string" ? document.createTextNode(k) : k);
  }
}

export function wacht(ms: number): Promise<void> {
  return new Promise((klaar) => setTimeout(klaar, ms));
}

export function minderBeweging(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
