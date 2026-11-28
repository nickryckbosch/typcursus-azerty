// Twee getekende handen (SVG), links en rechts van het toetsenbord.
// Vier afgeronde vingers, een handpalm die naar onder smaller wordt en een
// duim die schuin naar de spatiebalk wijst. Eerst tekenen we alle vormen met
// alleen een omtrek, daarna dezelfde vormen gevuld erbovenop: zo is de omtrek
// uit een stuk en lopen er geen lijnen door de hand.
// De vinger die moet typen krijgt de volle vingerkleur en een dikkere omtrek,
// de andere vingers de lichte kleur. Zo verschilt "vol" niet alleen in kleur
// (zie docs/stijlgids.md, deel 2).

import { kleurVanVinger, type Vinger } from "../logica/indeling";
import { svg } from "./dom";

export interface HandenWeergave {
  links: SVGSVGElement;
  rechts: SVGSVGElement;
  /** toon welke vinger(s) moeten typen; lege lijst: geen */
  toon(vingers: Vinger[]): void;
  /** laat de getoonde vinger(s) even sterker oplichten (na een fout) */
  benadruk(): void;
}

type HandVinger = "pink" | "ring" | "middel" | "wijs" | "duim";

// De linkerhand, van bovenaf gezien, vingers naar boven. De rechterhand is
// dezelfde tekening, gespiegeld. De duim staat eerst: hij ligt onder de palm.
const VINGERS: { naam: HandVinger; x: number; y: number; b: number; h: number; draai?: string }[] = [
  { naam: "duim", x: 92, y: 88, b: 24, h: 66, draai: "rotate(52 104 152)" },
  { naam: "pink", x: 16, y: 58, b: 22, h: 80 },
  { naam: "ring", x: 41, y: 30, b: 22, h: 108 },
  { naam: "middel", x: 66, y: 16, b: 22, h: 122 },
  { naam: "wijs", x: 91, y: 30, b: 22, h: 108 },
];

const PALM = "M 12 122 Q 12 106 28 106 L 100 106 Q 116 106 116 122 L 114 150 Q 110 182 80 182 L 48 182 Q 18 182 14 150 Z";

function vingerVorm(v: (typeof VINGERS)[number], klasse: string): SVGRectElement {
  return svg("rect", {
    class: klasse,
    x: v.x,
    y: v.y,
    width: v.b,
    height: v.h,
    rx: v.b / 2,
    ...(v.draai ? { transform: v.draai } : {}),
  });
}

function maakHand(kant: "linker" | "rechter", opschrift: string): { hand: SVGSVGElement; delen: Map<Vinger, SVGElement[]> } {
  const delen = new Map<Vinger, SVGElement[]>();
  const omtrek = svg("g", { class: "hand-omtrek" });
  const vulling = svg("g", { class: "hand-vulling" });
  for (const v of VINGERS) {
    const vinger: Vinger = v.naam === "duim" ? "duim" : (`${kant}${v.naam}` as Vinger);
    const rand = vingerVorm(v, "vinger-omtrek");
    const vlak = vingerVorm(v, `vinger-vlak kleur-${kleurVanVinger(vinger)}`);
    omtrek.append(rand);
    vulling.append(vlak);
    delen.set(vinger, [rand, vlak]);
  }
  omtrek.append(svg("path", { d: PALM }));
  vulling.append(svg("path", { class: "palm", d: PALM }));
  const inhoud = svg("g", kant === "rechter" ? { transform: "translate(160 0) scale(-1 1)" } : {}, omtrek, vulling);
  const hand = svg("svg", { class: `hand hand-${kant}`, viewBox: "0 0 160 190", role: "img", "aria-label": opschrift }, inhoud);
  return { hand, delen };
}

export function maakHanden(opschriftLinks: string, opschriftRechts: string): HandenWeergave {
  const l = maakHand("linker", opschriftLinks);
  const r = maakHand("rechter", opschriftRechts);
  const alle = [...l.delen.entries(), ...r.delen.entries()];
  let nadrukTimer: number | undefined;
  const zet = (klasse: string, test: (vinger: Vinger) => boolean) => {
    for (const [vinger, vormen] of alle) for (const vorm of vormen) vorm.classList.toggle(klasse, test(vinger));
  };
  let actief: Vinger[] = [];
  return {
    links: l.hand,
    rechts: r.hand,
    toon(vingers) {
      actief = vingers;
      zet("actief", (v) => vingers.includes(v));
      // Moet er een vinger typen, dan worden de andere vingers nog lichter
      // (test 28 november): licht tegenover donker, ook bij kleurenblindheid.
      for (const hand of [l.hand, r.hand]) hand.classList.toggle("met-actief", vingers.length > 0);
      zet("nadruk", () => false);
    },
    benadruk() {
      zet("nadruk", (v) => actief.includes(v));
      clearTimeout(nadrukTimer);
      nadrukTimer = window.setTimeout(() => zet("nadruk", () => false), 700);
    },
  };
}
