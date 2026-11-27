// Het schermtoetsenbord: Belgisch AZERTY, drie letterrijen en de spatiebalk.
// Elke toets heeft onderaan een streep in de kleur van zijn vinger.
// event.code bepaalt welke fysieke toets oplicht; zo klopt het beeld ook als
// het toestel op een andere indeling staat.
// De regels voor het uitzicht staan in docs/stijlgids.md, deel 5.

import { kleurVanVinger, RIJEN, type Rij, type Toets } from "../logica/indeling";
import { t } from "../content";
import { el } from "./dom";

export interface ToetsenbordWeergave {
  element: HTMLElement;
  /** toon de toets(en) die nu moeten komen (lege lijst: geen) */
  markeer(codes: string[]): void;
  /** laat de gemarkeerde toets(en) even sterker oplichten (na een fout) */
  benadruk(): void;
  /** laat een juist gedrukte toets kort oplichten */
  flits(code: string, juist: boolean): void;
  /** laat een hele rij kort oplichten */
  lichtRijOp(rij: Rij): void;
  /** toon een rij blijvend (hulp bij "Licht aan in het huis"); null: geen rij */
  toonRij(rij: Rij | null): void;
  /** toon of verberg dat het kind op Enter moet drukken */
  toonEnter(aan: boolean): void;
}

// Breedtes in dezelfde eenheid als het ontwerp: een lettertoets is 48 breed,
// de ruimte tussen twee toetsen 7. Elke rij is zo precies 820 breed.
const TOETS = 48;
const SPATIE = { inspringen: 228, breedte: 268 };

// De randtoetsen (Tab, zoektoets, Shift, Enter): vaag en zonder opschrift,
// alleen om het toetsenbord herkenbaar te maken. Uitzondering: de Enter-toets
// (twee delen die samen een grote toets vormen, zoals op een Belgisch
// toetsenbord) licht op als het kind op Enter moet drukken om verder te gaan.
// Geen cijferrij: die leren de kinderen pas veel later.
const RIJ_OPMAAK: { rij: Rij; voor: number; na: number; enter?: "boven" | "onder" }[] = [
  { rij: "zolder", voor: 66, na: 87, enter: "boven" },
  { rij: "woonkamer", voor: 84, na: 69, enter: "onder" },
  { rij: "kelder", voor: 56, na: 152 },
];

function label(toets: Toets): HTMLElement {
  // Kleine letters, zoals het kind ze leest en typt.
  return el("span", { class: "toets-label" }, toets.basis);
}

export function maakToetsenbord(geleerd: string[]): ToetsenbordWeergave {
  const perCode = new Map<string, HTMLElement>();
  const perRij = new Map<Rij, HTMLElement>();
  const geleerdSet = new Set(geleerd);
  const enterDelen: HTMLElement[] = [];

  const toetsElement = (toets: Toets, breedte: number): HTMLElement => {
    const toetsEl = el(
      "div",
      {
        class: [
          "toets",
          `kleur-${kleurVanVinger(toets.vinger)}`,
          geleerdSet.has(toets.basis) ? "geleerd" : "",
          toets.bultje ? "bultje" : "",
          toets.code === "Space" ? "spatiebalk" : "",
        ].join(" "),
        style: `--w:${breedte}`,
        "data-code": toets.code,
      },
      toets.code === "Space" ? t("teken.spatie") : label(toets),
    );
    perCode.set(toets.code, toetsEl);
    return toetsEl;
  };

  const rijElementen = RIJ_OPMAAK.map(({ rij, voor, na, enter }) => {
    const toetsen = RIJEN.find((r) => r.rij === rij)?.toetsen ?? [];
    const rijEl = el("div", { class: `tb-rij tb-rij-${rij}` });
    rijEl.append(el("div", { class: "toets toets-rand", style: `--w:${voor}` }));
    for (const toets of toetsen) rijEl.append(toetsElement(toets, TOETS));
    if (enter) {
      const deel = el(
        "div",
        { class: `toets toets-rand toets-enter toets-enter-${enter}`, style: `--w:${na}` },
        enter === "boven" ? el("span", { class: "enter-label" }, "Enter ↵") : null,
      );
      enterDelen.push(deel);
      if (enter === "boven") perCode.set("Enter", deel);
      rijEl.append(deel);
    } else {
      rijEl.append(el("div", { class: "toets toets-rand", style: `--w:${na}` }));
    }
    perRij.set(rij, rijEl);
    return rijEl;
  });

  const spatie = RIJEN.find((r) => r.rij === "spatie")!.toetsen[0];
  const spatieRij = el(
    "div",
    { class: "tb-rij tb-rij-spatie" },
    el("div", { class: "toets-leeg", style: `--w:${SPATIE.inspringen - 7}` }),
    toetsElement(spatie, SPATIE.breedte),
  );
  perRij.set("spatie", spatieRij);

  const element = el("div", { class: "toetsenbord", "aria-hidden": "true" }, ...rijElementen, spatieRij);
  let gemarkeerd: HTMLElement[] = [];
  let nadrukTimer: number | undefined;

  return {
    element,
    markeer(codes) {
      for (const t of gemarkeerd) t.classList.remove("volgende", "nadruk");
      gemarkeerd = codes.map((c) => perCode.get(c)).filter((t): t is HTMLElement => t !== undefined);
      for (const t of gemarkeerd) t.classList.add("volgende");
    },
    benadruk() {
      const nu = gemarkeerd;
      for (const t of nu) t.classList.add("nadruk");
      clearTimeout(nadrukTimer);
      nadrukTimer = window.setTimeout(() => nu.forEach((t) => t.classList.remove("nadruk")), 700);
    },
    flits(code, juist) {
      // Alleen een juiste toets licht op. Bij een fout lichten de juiste toets
      // en vinger op (zie benadruk), niet de toets die het kind drukte.
      if (!juist) return;
      const t = perCode.get(code);
      if (!t) return;
      t.classList.add("ingedrukt");
      setTimeout(() => t.classList.remove("ingedrukt"), 200);
    },
    toonEnter(aan) {
      for (const d of enterDelen) d.classList.toggle("enter-wacht", aan);
    },
    toonRij(rij) {
      for (const [r, el] of perRij) el.classList.toggle("rij-hulp", r === rij);
    },
    lichtRijOp(rij) {
      const r = perRij.get(rij);
      if (!r) return;
      r.classList.add("rij-op");
      setTimeout(() => r.classList.remove("rij-op"), 1000);
    },
  };
}
