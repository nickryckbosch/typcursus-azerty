// Fien en Jef: losse tekeningen in docs/beelden/figuren/, omgezet met
// scripts/knip-figuren.py naar src/beelden/<wie>-<houding>.webp.
// Een nieuwe uitdrukking toevoegen: zet de twee tekeningen (fien en jef) in
// docs/beelden/figuren/, voeg de naam toe in dat script, voer het uit, en voeg
// de naam toe aan Uitdrukking.
//
// Fien en Jef staan altijd stil (docs/stijlgids.md, deel 1). Ze veranderen
// alleen van houding bij de start (zwaai) en op het einde (duim of aanmoedigend).

import { svg } from "./dom";

export type Uitdrukking = "zwaai" | "duim" | "blij" | "trots" | "nadenkend" | "aanmoedigend";

const BEELDEN = import.meta.glob("../beelden/*.webp", { eager: true, import: "default" }) as Record<string, string>;

function figuur(wie: "fien" | "jef", uitdrukking: Uitdrukking, hoogte: number): HTMLImageElement {
  const img = document.createElement("img");
  img.src = BEELDEN[`../beelden/${wie}-${uitdrukking}.webp`];
  img.alt = wie === "fien" ? "Fien" : "Jef";
  img.className = `figuur figuur-${wie} ${uitdrukking === "zwaai" ? "figuur-heel" : "figuur-gezicht"}`;
  // De hoogte is een maximum: in een lesscherm wordt de figuur kleiner als er weinig plaats is.
  img.style.setProperty("--h", `${hoogte}px`);
  img.draggable = false;
  return img;
}

/** Standaardhoogte: de hele figuur (zwaai) is groter dan een gezichtje. */
function standaardHoogte(uitdrukking: Uitdrukking): number {
  return uitdrukking === "zwaai" ? 170 : 110;
}

export function fien(uitdrukking: Uitdrukking = "zwaai", hoogte = standaardHoogte(uitdrukking)): HTMLImageElement {
  return figuur("fien", uitdrukking, hoogte);
}

export function jef(uitdrukking: Uitdrukking = "zwaai", hoogte = standaardHoogte(uitdrukking)): HTMLImageElement {
  return figuur("jef", uitdrukking, hoogte);
}

/** Een van de twee, om af te wisselen (bv. per blok): even = Jef, oneven = Fien. */
export function fienOfJef(nummer: number, uitdrukking: Uitdrukking, hoogte?: number): HTMLImageElement {
  return nummer % 2 === 0 ? jef(uitdrukking, hoogte) : fien(uitdrukking, hoogte);
}

/** Een vinkje ("klaar"). */
export function vinkje(grootte = 20): SVGSVGElement {
  return svg(
    "svg",
    { class: "vinkje", viewBox: "0 0 24 24", width: grootte, height: grootte, "aria-hidden": "true" },
    svg("path", { d: "M5 12l5 5L20 7" }),
  );
}

/** Een slotje ("op slot"). */
export function slotje(grootte = 18): SVGSVGElement {
  return svg(
    "svg",
    { class: "slot-icoon", viewBox: "0 0 24 24", width: grootte, height: grootte, "aria-hidden": "true" },
    svg("rect", { x: 5, y: 11, width: 14, height: 10, rx: 2 }),
    svg("path", { d: "M8 11V7a4 4 0 0 1 8 0v4" }),
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
