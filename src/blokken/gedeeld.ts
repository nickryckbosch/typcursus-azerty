// Kleine onderdelen die meerdere blokken gebruiken.

import { t } from "../content";
import { el } from "../weergave/dom";
import { fien, jef, type Uitdrukking } from "../weergave/figuren";
import type { BlokContext } from "./context";

/**
 * Fien en Jef links, de inhoud (bv. een tekstballon) rechts ernaast.
 * Ze staan stil: geen animatie (docs/stijlgids.md, deel 1).
 */
export function metFienEnJef(uitdrukking: Uitdrukking, ...inhoud: Node[]): HTMLElement {
  return el(
    "div",
    { class: "met-figuren" },
    el("div", { class: "figuren" }, fien(uitdrukking), jef(uitdrukking)),
    el("div", { class: "naast-figuren" }, ...inhoud),
  );
}

/**
 * "Druk op [Enter] om verder te gaan." De toets staat getekend in de tekst,
 * en de Enter-toets op het schermtoetsenbord licht op tot het volgende blok.
 */
export function enterHint(ctx: BlokContext, actie: () => void = () => ctx.volgende()): HTMLElement {
  ctx.toetsenbord.toonEnter(true);
  const [voor, na] = t("hint.enter").split("{toets}");
  return el(
    "div",
    { class: "enter-rij" },
    el("p", { class: "hint-enter" }, voor, el("span", { class: "toets-in-tekst" }, t("toets.enter")), na ?? ""),
    el("button", { class: "knop knop-hoofd", type: "button", onclick: actie }, t("knop.verder")),
  );
}
