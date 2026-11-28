// Het schermtoetsenbord: Belgisch AZERTY, drie letterrijen en de spatiebalk.
// Elke toets heeft onderaan een streep in de kleur van zijn vinger.
// event.code bepaalt welke fysieke toets oplicht; zo klopt het beeld ook als
// het toestel op een andere indeling staat.
// De regels voor het uitzicht staan in docs/stijlgids.md, deel 5.

import { kleurVanVinger, RIJEN, type Rij, type Toets } from "../logica/indeling";
import { t, type TekstSleutel } from "../content";
import { el } from "./dom";

export interface ToetsenbordWeergave {
  element: HTMLElement;
  /** toon de toets(en) die nu moeten komen (lege lijst: geen) */
  markeer(codes: string[]): void;
  /** laat de gemarkeerde toets(en) even sterker oplichten (na een fout) */
  benadruk(): void;
  /** laat een juist gedrukte toets kort oplichten */
  flits(code: string, juist: boolean): void;
  /**
   * Laat een toets oplichten in de volle kleur van haar vinger. Na een halve
   * seconde dooft ze weer, zodat alleen de gevraagde toets opvalt. Met
   * "blijft" brandt ze tot doof() (de twee bultjes in les 0).
   */
  lichtOp(code: string, blijft?: boolean): void;
  /** doof alle toetsen die met lichtOp branden */
  doof(): void;
  /**
   * Toon de toetsen die het kind bij naam leert (les 0, "Toetsenjacht"): Shift
   * links en rechts en Enter krijgen hun opschrift, en boven de Enter-toets
   * komt de Backspace-toets te staan, op haar plaats in de cijferrij. De rest
   * van de cijferrij blijft weg.
   */
  toonNaamtoetsen(aan: boolean): void;
  /** laat een hele rij kort oplichten */
  lichtRijOp(rij: Rij): void;
  /** toon een rij blijvend (hulp bij "Licht aan in het huis"); null: geen rij */
  toonRij(rij: Rij | null): void;
  /** toon of verberg dat het kind op Enter moet drukken */
  toonEnter(aan: boolean): void;
  /**
   * Toon de naam van elke rij (zolder, woonkamer, kelder) in de lege randtoets
   * links van die rij. Een intro zet dit aan met "rijnamen": true in de lesdata
   * (docs/beslissingen.md, 12p).
   */
  toonRijnamen(aan: boolean): void;
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
const RIJ_OPMAAK: { rij: Rij; voor: number; na: number; enter?: "boven" | "onder"; shift?: boolean }[] = [
  { rij: "zolder", voor: 66, na: 87, enter: "boven" },
  { rij: "woonkamer", voor: 84, na: 69, enter: "onder" },
  { rij: "kelder", voor: 56, na: 152, shift: true },
];
// De Backspace-toets ligt in de cijferrij, rechts boven de Enter-toets. Het
// schermtoetsenbord heeft geen cijferrij; alleen in "Toetsenjacht" (les 0)
// staat deze ene toets erbij. Elke rij is 820 breed.
const BACKSPACE = { inspringen: 715, breedte: 105 };

function label(toets: Toets): HTMLElement {
  // Kleine letters, zoals het kind ze leest en typt.
  return el("span", { class: "toets-label" }, toets.basis);
}

export function maakToetsenbord(geleerd: string[]): ToetsenbordWeergave {
  // Een toets kan uit meer dan een deel bestaan (de Enter-toets uit twee).
  const perCode = new Map<string, HTMLElement[]>();
  const naamToets = (naam: TekstSleutel) => el("span", { class: "toets-naam" }, t(naam));
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
    perCode.set(toets.code, [toetsEl]);
    return toetsEl;
  };

  const rijElementen = RIJ_OPMAAK.map(({ rij, voor, na, enter, shift }) => {
    const toetsen = RIJEN.find((r) => r.rij === rij)?.toetsen ?? [];
    // Rijen met een stuk van de Enter-toets: de hulprand (toonRij) stopt voor
    // de Enter-toets, want die hoort bij twee rijen (--na is haar breedte).
    const rijEl = el("div", enter ? { class: `tb-rij tb-rij-${rij} met-enter`, style: `--na:${na}` } : { class: `tb-rij tb-rij-${rij}` });
    // De randtoets links (Tab, de hoofdlettertoets, Shift) draagt de naam van de
    // rij; de naam is alleen te zien als toonRijnamen aan staat.
    const links = el(
      "div",
      { class: `toets toets-rand toets-rijnaam ${shift ? "toets-met-naam" : ""}`, style: `--w:${voor}` },
      el("span", { class: "rij-naam" }, t(`rij.${rij}` as TekstSleutel)),
      shift ? naamToets("toets.shift") : null,
    );
    if (shift) perCode.set("ShiftLeft", [links]);
    rijEl.append(links);
    for (const toets of toetsen) rijEl.append(toetsElement(toets, TOETS));
    if (enter) {
      const deel = el(
        "div",
        { class: `toets toets-rand toets-enter toets-enter-${enter}`, style: `--w:${na}` },
        enter === "boven" ? el("span", { class: "enter-label" }, "Enter ↵") : null,
      );
      enterDelen.push(deel);
      perCode.set("Enter", enterDelen);
      rijEl.append(deel);
    } else {
      const rechts = el("div", { class: `toets toets-rand ${shift ? "toets-met-naam" : ""}`, style: `--w:${na}` }, shift ? naamToets("toets.shift") : null);
      if (shift) perCode.set("ShiftRight", [rechts]);
      rijEl.append(rechts);
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

  // De rij met alleen de Backspace-toets: onzichtbaar (en zonder plaats) tot toonNaamtoetsen.
  const backspace = el("div", { class: "toets toets-rand toets-met-naam", style: `--w:${BACKSPACE.breedte}` }, naamToets("toets.backspace"));
  perCode.set("Backspace", [backspace]);
  const backspaceRij = el(
    "div",
    { class: "tb-rij tb-rij-backspace" },
    el("div", { class: "toets-leeg", style: `--w:${BACKSPACE.inspringen - 7}` }),
    backspace,
  );
  const element = el("div", { class: "toetsenbord", "aria-hidden": "true" }, backspaceRij, ...rijElementen, spatieRij);
  let gemarkeerd: HTMLElement[] = [];
  let nadrukTimer: number | undefined;
  const doofTimers = new Map<string, number>();
  const delen = (code: string) => perCode.get(code === "NumpadEnter" ? "Enter" : code) ?? [];

  return {
    element,
    markeer(codes) {
      for (const t of gemarkeerd) t.classList.remove("volgende", "nadruk");
      gemarkeerd = codes.flatMap((c) => delen(c));
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
      const toets = delen(code);
      for (const deel of toets) deel.classList.add("ingedrukt");
      setTimeout(() => toets.forEach((deel) => deel.classList.remove("ingedrukt")), 200);
    },
    lichtOp(code, blijft = false) {
      const toets = delen(code);
      for (const deel of toets) deel.classList.add("gedrukt");
      clearTimeout(doofTimers.get(code));
      doofTimers.delete(code);
      if (!blijft) {
        doofTimers.set(
          code,
          window.setTimeout(() => toets.forEach((deel) => deel.classList.remove("gedrukt")), 500),
        );
      }
    },
    doof() {
      for (const id of doofTimers.values()) clearTimeout(id);
      doofTimers.clear();
      for (const toets of perCode.values()) for (const deel of toets) deel.classList.remove("gedrukt");
    },
    toonNaamtoetsen(aan) {
      element.classList.toggle("met-naamtoetsen", aan);
    },
    toonEnter(aan) {
      for (const d of enterDelen) d.classList.toggle("enter-wacht", aan);
    },
    toonRijnamen(aan) {
      element.classList.toggle("met-rijnamen", aan);
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
