// De lamp van "Duim op de spatiebalk" (les 0): een getekende gloeilamp, in
// dezelfde stijl als het huis van "Licht aan" (omtrek #1F1F1F, afgeronde lijnen).
// Ze staat van bij het begin (uit) in beeld en gaat zichtbaar aan.
//   uit: donker glas (#3B4256), geen stralen
//   aan: lichtgeel glas (#FFEE99) met stralen errond
// De stralen zorgen dat je ook zonder op de kleur te letten ziet dat ze brandt.
// Dezelfde tekening staat klein in de opdracht, naast het woord "lamp".

import { el, svg } from "./dom";

const LIJN = "#1F1F1F";

/** Acht korte stralen in een boog boven en naast het glas (alleen zichtbaar als de lamp aan is). */
function stralen(): SVGGElement {
  const g = svg("g", { class: "lamp-stralen", stroke: LIJN, "stroke-width": 2.5, "stroke-linecap": "round" });
  for (let hoek = -180; hoek <= 0; hoek += 30) {
    const r = (hoek * Math.PI) / 180;
    const punt = (afstand: number) => `${(70 + Math.cos(r) * afstand).toFixed(1)} ${(64 + Math.sin(r) * afstand).toFixed(1)}`;
    g.append(svg("path", { d: `M${punt(50)}L${punt(62)}` }));
  }
  return g;
}

/** Maak een lamp. Zet de klasse "aan" op het element om ze te laten branden. */
export function lampTekening(klein = false): SVGSVGElement {
  return svg(
    "svg",
    { class: `lamp-tekening${klein ? " lamp-klein" : ""}`, viewBox: "0 -4 140 160", role: "img", "aria-label": "lamp" },
    stralen(),
    svg(
      "g",
      { stroke: LIJN, "stroke-width": 1.8, "stroke-linejoin": "round", "stroke-linecap": "round" },
      // het glas: een ronde bol die naar onder smaller wordt
      svg("path", {
        class: "lamp-glas",
        d: "M70 26c-22 0-38 16-38 37 0 14 7 23 14 31 4 5 6 9 6 14h36c0-5 2-9 6-14 7-8 14-17 14-31 0-21-16-37-38-37z",
      }),
      // een glans op het glas
      svg("path", { class: "lamp-glans", d: "M46 58c2-10 9-17 18-19", fill: "none", "stroke-width": 4 }),
      // het gloeidraadje
      svg("path", { class: "lamp-draad", d: "M60 108V86l5-8 5 8 5-8 5 8v22", fill: "none", "stroke-width": 1.6 }),
      // de fitting met twee ribbels en het contactpunt
      svg("rect", { x: 52, y: 108, width: 36, height: 24, rx: 5, fill: "#CFC7BA" }),
      svg("path", { d: "M52 116h36M52 124h36", fill: "none", "stroke-width": 1.6 }),
      svg("path", { d: "M62 132h16l-3 8h-10z", fill: LIJN }),
    ),
  );
}

export interface LampMetWachtzin {
  element: HTMLElement;
  /** zet de lamp (en het beeldje in de opdracht) aan of uit; de wachtzin verdwijnt als de lamp aangaat */
  zetAan(aan: boolean): void;
  /** het kind drukte te vroeg: toon "Wacht op de lamp." (telt niet als fout) */
  teVroeg(): void;
}

/**
 * De lamp met daaronder een vaste plek voor de zin "Wacht op de lamp.". Die
 * plek is er van bij het begin, zodat er niets verspringt als de zin verschijnt.
 * Gebruikt in "Duim op de spatiebalk" en "Klaar voor de start" (les 0).
 */
export function lampMetWachtzin(wachtzin: string, binnen: () => ParentNode): LampMetWachtzin {
  const zin = el("p", { class: "wachtzin zacht onzichtbaar", "aria-live": "polite" }, wachtzin);
  const element = el("div", { class: "lamp-plek" }, lampTekening(), zin);
  return {
    element,
    zetAan(aan) {
      for (const l of binnen().querySelectorAll(".lamp-tekening")) l.classList.toggle("aan", aan);
      if (aan) zin.classList.add("onzichtbaar");
    },
    teVroeg() {
      zin.classList.remove("onzichtbaar");
    },
  };
}
