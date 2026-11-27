// Fien en Jef als eenvoudige vormen. De echte prenten volgen later; dan
// vervang je alleen deze twee functies (bijvoorbeeld door een <img>).

import { svg } from "./dom";

export function fien(grootte = 84): SVGSVGElement {
  return svg(
    "svg",
    { class: "figuur figuur-fien", viewBox: "0 0 100 120", width: grootte, height: grootte * 1.2, role: "img", "aria-label": "Fien" },
    // haar: twee knotjes
    svg("circle", { cx: 26, cy: 22, r: 13, fill: "#2b1d14" }),
    svg("circle", { cx: 74, cy: 22, r: 13, fill: "#2b1d14" }),
    // lijf met de letter F
    svg("rect", { x: 22, y: 70, width: 56, height: 46, rx: 18, fill: "#0072B2" }),
    svg("text", { x: 50, y: 104, "text-anchor": "middle", "font-size": 28, "font-weight": 700, fill: "#fff" }, "F"),
    // hoofd
    svg("circle", { cx: 50, cy: 44, r: 28, fill: "#8d5a3b" }),
    svg("path", { d: "M24 38 Q50 6 76 38 Q66 26 50 26 Q34 26 24 38Z", fill: "#2b1d14" }),
    svg("circle", { cx: 40, cy: 46, r: 3.5, fill: "#111" }),
    svg("circle", { cx: 60, cy: 46, r: 3.5, fill: "#111" }),
    svg("path", { d: "M40 57 Q50 65 60 57", stroke: "#111", "stroke-width": 3, fill: "none", "stroke-linecap": "round" }),
  );
}

export function jef(grootte = 84): SVGSVGElement {
  return svg(
    "svg",
    { class: "figuur figuur-jef", viewBox: "0 0 100 120", width: grootte, height: grootte * 1.2, role: "img", "aria-label": "Jef" },
    // lijf met de letter J
    svg("rect", { x: 22, y: 70, width: 56, height: 46, rx: 18, fill: "#E69F00" }),
    svg("text", { x: 50, y: 104, "text-anchor": "middle", "font-size": 28, "font-weight": 700, fill: "#111" }, "J"),
    // hoofd met rood haar en pet
    svg("circle", { cx: 50, cy: 44, r: 28, fill: "#f2c9a5" }),
    svg("path", { d: "M22 40 Q24 14 50 14 Q76 14 78 40 Q70 30 50 30 Q30 30 22 40Z", fill: "#c4572b" }),
    svg("path", { d: "M24 30 Q50 4 76 30 L86 32 Q88 36 80 36 L24 36Z", fill: "#009E73" }),
    svg("circle", { cx: 40, cy: 46, r: 3.5, fill: "#111" }),
    svg("circle", { cx: 60, cy: 46, r: 3.5, fill: "#111" }),
    svg("circle", { cx: 34, cy: 54, r: 2, fill: "#c4572b" }),
    svg("circle", { cx: 66, cy: 54, r: 2, fill: "#c4572b" }),
    svg("path", { d: "M40 58 Q50 66 60 58", stroke: "#111", "stroke-width": 3, fill: "none", "stroke-linecap": "round" }),
  );
}

export function sterIcoon(gevuld: boolean, grootte = 56): SVGSVGElement {
  return svg(
    "svg",
    { class: `ster ${gevuld ? "ster-vol" : "ster-leeg"}`, viewBox: "0 0 24 24", width: grootte, height: grootte, "aria-hidden": "true" },
    svg("path", {
      d: "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z",
      "stroke-width": 1.6,
      "stroke-linejoin": "round",
    }),
  );
}
