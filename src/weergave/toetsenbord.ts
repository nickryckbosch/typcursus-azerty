// Het schermtoetsenbord: Belgisch AZERTY, elke toets in de kleur van zijn vinger.
// event.code bepaalt welke fysieke toets oplicht; zo klopt het beeld ook als
// het toestel op een andere indeling staat.

import { kleurVanVinger, RIJEN, type Rij, type Toets } from "../logica/indeling";
import { el } from "./dom";

export interface ToetsenbordWeergave {
  element: HTMLElement;
  /** toon de toets(en) die nu moeten komen (lege lijst: geen) */
  markeer(codes: string[]): void;
  /** laat een gedrukte toets kort oplichten */
  flits(code: string, juist: boolean): void;
  /** laat een hele rij kort oplichten */
  lichtRijOp(rij: Rij): void;
  /** toon of verberg dat het kind op Enter moet drukken */
  toonEnter(aan: boolean): void;
}

// Brede toetsen aan de randen (Tab, CapsLock, Shift, ...): alleen om het
// toetsenbord herkenbaar te maken, ze doen niets. Uitzondering: de Enter-toets
// (zolder en woonkamer rechts, samen een grote toets zoals op een Belgisch
// toetsenbord) licht op als het kind op Enter moet drukken om verder te gaan.
const RANDEN: Record<Rij, { voor?: [string, number]; na?: [string, number] }> = {
  dak: { na: ["", 1.9] },
  zolder: { voor: ["", 1.5], na: ["enter-boven", 1.4] },
  woonkamer: { voor: ["", 1.8], na: ["enter-onder", 1.1] },
  kelder: { voor: ["", 1.3], na: ["", 2.5] },
  spatie: {},
};

function label(toets: Toets): HTMLElement {
  if (toets.code === "Space") return el("span", { class: "toets-label" });
  if (/^[a-z]$/.test(toets.basis)) return el("span", { class: "toets-label" }, toets.basis.toUpperCase());
  return el(
    "span",
    { class: "toets-label toets-label-dubbel" },
    el("span", {}, toets.shift),
    el("span", {}, toets.basis),
  );
}

export function maakToetsenbord(geleerd: string[]): ToetsenbordWeergave {
  const perCode = new Map<string, HTMLElement>();
  const perRij = new Map<Rij, HTMLElement>();
  const geleerdSet = new Set(geleerd);
  const enterDelen: HTMLElement[] = [];

  const rijElementen = RIJEN.map(({ rij, toetsen }) => {
    const rand = RANDEN[rij];
    const rijEl = el("div", { class: `tb-rij tb-rij-${rij}` });
    if (rand.voor) rijEl.append(el("div", { class: "toets toets-rand", style: `--b:${rand.voor[1]}` }));
    if (rij === "spatie") rijEl.append(el("div", { class: "toets-leeg", style: "--b:4.1" }));
    for (const toets of toetsen) {
      const kleur = kleurVanVinger(toets.vinger);
      const t = el(
        "div",
        {
          class: [
            "toets",
            `kleur-${kleur}`,
            geleerdSet.has(toets.basis) ? "geleerd" : "",
            toets.bultje ? "bultje" : "",
            toets.code === "Space" ? "spatiebalk" : "",
          ].join(" "),
          style: toets.code === "Space" ? "--b:6.4" : "--b:1",
          "data-code": toets.code,
        },
        label(toets),
      );
      perCode.set(toets.code, t);
      rijEl.append(t);
    }
    if (rand.na?.[0] === "enter-boven") {
      const boven = el("div", { class: "toets toets-enter toets-enter-boven", style: `--b:${rand.na[1]}` }, el("span", { class: "enter-label" }, "Enter \u21B5"));
      enterDelen.push(boven);
      perCode.set("Enter", boven);
      rijEl.append(boven);
    } else if (rand.na?.[0] === "enter-onder") {
      const onder = el("div", { class: "toets toets-enter toets-enter-onder", style: `--b:${rand.na[1]}` });
      enterDelen.push(onder);
      rijEl.append(onder);
    } else if (rand.na) {
      rijEl.append(el("div", { class: "toets toets-rand", style: `--b:${rand.na[1]}` }));
    }
    perRij.set(rij, rijEl);
    return rijEl;
  });

  const element = el("div", { class: "toetsenbord", "aria-hidden": "true" }, ...rijElementen);
  let gemarkeerd: HTMLElement[] = [];

  return {
    element,
    markeer(codes) {
      for (const t of gemarkeerd) t.classList.remove("volgende");
      gemarkeerd = codes.map((c) => perCode.get(c)).filter((t): t is HTMLElement => t !== undefined);
      for (const t of gemarkeerd) t.classList.add("volgende");
    },
    flits(code, juist) {
      const t = perCode.get(code);
      if (!t) return;
      const klas = juist ? "flits-juist" : "flits-fout";
      t.classList.remove("flits-juist", "flits-fout");
      void t.offsetWidth; // herstart de animatie
      t.classList.add(klas);
      setTimeout(() => t.classList.remove(klas), 350);
    },
    toonEnter(aan) {
      for (const d of enterDelen) d.classList.toggle("enter-wacht", aan);
    },
    lichtRijOp(rij) {
      const r = perRij.get(rij);
      if (!r) return;
      r.classList.add("rij-op");
      setTimeout(() => r.classList.remove("rij-op"), 1000);
    },
  };
}
