// Fien en Jef, uitgeknipt uit het modelblad (docs/beelden/fien-en-jef-modelblad.png)
// met scripts/knip-figuren.py. Een nieuwe uitdrukking toevoegen: zet een zone in
// dat script, voer het uit, en voeg de naam toe aan Uitdrukking.

import { svg } from "./dom";

export type Uitdrukking = "zwaai" | "blij" | "trots" | "nadenkend" | "aanmoedigend";

const BEELDEN = import.meta.glob("../beelden/*.png", { eager: true, import: "default" }) as Record<string, string>;

function figuur(wie: "fien" | "jef", uitdrukking: Uitdrukking, hoogte: number): HTMLImageElement {
  const img = document.createElement("img");
  img.src = BEELDEN[`../beelden/${wie}-${uitdrukking}.png`];
  img.alt = wie === "fien" ? "Fien" : "Jef";
  img.className = `figuur figuur-${wie}`;
  img.style.height = `${hoogte}px`;
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
