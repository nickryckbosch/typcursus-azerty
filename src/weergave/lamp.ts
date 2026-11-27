// De lamp van "Duim op de spatiebalk" (les 0): een duidelijk getekende gloeilamp.
// Uit: donker (#3B4256). Aan: lichtgeel (#FFEE99), met stralen erbij, zodat je
// ook zonder op de kleur te letten ziet dat ze brandt. Omtrek bruin (#4A2E1A),
// zoals het huis. Dezelfde tekening staat klein in de opdracht, naast het woord "lamp".

import { svg } from "./dom";

const OMTREK = "#4A2E1A";

function stralen(): SVGGElement {
  const g = svg("g", { class: "lamp-stralen", stroke: OMTREK, "stroke-width": 5, "stroke-linecap": "round" });
  for (const hoek of [-150, -120, -90, -60, -30, 0, 180]) {
    const r = (hoek * Math.PI) / 180;
    const x1 = 60 + Math.cos(r) * 50, y1 = 58 + Math.sin(r) * 50;
    const x2 = 60 + Math.cos(r) * 64, y2 = 58 + Math.sin(r) * 64;
    g.append(svg("line", { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1) }));
  }
  return g;
}

/** Maak een lamp. Zet de klasse "aan" op het element om ze te laten branden. */
export function lampTekening(klein = false): SVGSVGElement {
  return svg(
    "svg",
    { class: `lamp-tekening${klein ? " lamp-klein" : ""}`, viewBox: "-8 -10 136 158", role: "img", "aria-label": "lamp" },
    stralen(),
    svg(
      "g",
      { stroke: OMTREK, "stroke-width": 4, "stroke-linejoin": "round" },
      // de bol
      svg("path", {
        class: "lamp-bol",
        d: "M60 18 C36 18 22 36 22 56 C22 73 33 82 41 93 L43 102 L77 102 L79 93 C87 82 98 73 98 56 C98 36 84 18 60 18 Z",
      }),
      // de fitting
      svg("rect", { x: 42, y: 102, width: 36, height: 10, rx: 3, fill: "#B9B3A8" }),
      svg("rect", { x: 44, y: 112, width: 32, height: 10, rx: 3, fill: "#B9B3A8" }),
      svg("path", { d: "M49 122 L71 122 L66 132 L54 132 Z", fill: "#8A847A" }),
    ),
  );
}
