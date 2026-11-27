// Twee getekende handen (SVG). Elke vinger heeft zijn kleur. De vinger die
// moet typen krijgt een dikke rand en een stip boven de vingertop, zodat het
// nooit alleen de kleur is die iets vertelt (belangrijk voor kleurenblinde kinderen).

import { kleurVanVinger, type Vinger } from "../logica/indeling";
import { svg } from "./dom";

export interface HandenWeergave {
  links: SVGSVGElement;
  rechts: SVGSVGElement;
  /** toon welke vinger(s) moeten typen; lege lijst: geen */
  toon(vingers: Vinger[]): void;
}

type HandVinger = "pink" | "ring" | "middel" | "wijs" | "duim";

// Vormen voor de linkerhand, van bovenaf gezien, vingers naar boven.
// De rechterhand is dezelfde tekening, gespiegeld.
const VINGERS: { naam: HandVinger; x: number; y: number; b: number; h: number; draai?: number }[] = [
  { naam: "pink", x: 14, y: 82, b: 30, h: 100 },
  { naam: "ring", x: 48, y: 42, b: 32, h: 130 },
  { naam: "middel", x: 84, y: 26, b: 32, h: 140 },
  { naam: "wijs", x: 120, y: 50, b: 32, h: 120 },
  { naam: "duim", x: 150, y: 112, b: 30, h: 92, draai: 38 },
];

function maakHand(kant: "linker" | "rechter", opschrift: string): { hand: SVGSVGElement; delen: Map<Vinger, SVGGElement> } {
  const delen = new Map<Vinger, SVGGElement>();
  const vingerGroep = svg("g");
  for (const v of VINGERS) {
    const vinger: Vinger = v.naam === "duim" ? "duim" : (`${kant}${v.naam}` as Vinger);
    const kleur = kleurVanVinger(vinger);
    const midden = v.x + v.b / 2;
    const g = svg(
      "g",
      {
        class: `hand-vinger kleur-${kleur}`,
        // de duim draait rond zijn onderkant, die onder de palm zit
        ...(v.draai ? { transform: `rotate(${v.draai} ${midden} ${v.y + v.h}) translate(-22 6)` } : {}),
      },
      svg("rect", { class: "vinger-vorm", x: v.x, y: v.y, width: v.b, height: v.h, rx: v.b / 2 }),
      svg("circle", { class: "vinger-stip", cx: midden, cy: v.y - 14, r: 9 }),
    );
    delen.set(vinger, g);
    vingerGroep.append(g);
  }
  const palm = svg("rect", { class: "palm", x: 12, y: 140, width: 144, height: 92, rx: 36 });
  const inhoud = svg("g", kant === "rechter" ? { transform: "translate(200 0) scale(-1 1)" } : {}, vingerGroep, palm);
  const hand = svg(
    "svg",
    { class: `hand hand-${kant}`, viewBox: "0 -10 200 270", role: "img", "aria-label": opschrift },
    inhoud,
    svg("text", { class: "hand-opschrift", x: 100, y: 255, "text-anchor": "middle" }, opschrift),
  );
  return { hand, delen };
}

export function maakHanden(opschriftLinks: string, opschriftRechts: string): HandenWeergave {
  const l = maakHand("linker", opschriftLinks);
  const r = maakHand("rechter", opschriftRechts);
  const alle = [...l.delen.entries(), ...r.delen.entries()];
  return {
    links: l.hand,
    rechts: r.hand,
    toon(vingers) {
      for (const [vinger, g] of alle) g.classList.toggle("actief", vingers.includes(vinger));
    },
  };
}
