// Kleine onderdelen die meerdere blokken gebruiken.

import { t } from "../content";
import { el } from "../weergave/dom";
import { fien, jef } from "../weergave/figuren";
import type { BlokContext } from "./context";

export function verderKnop(ctx: BlokContext, tekst = t("knop.verder")): HTMLButtonElement {
  return el("button", { class: "knop knop-hoofd", type: "button", onclick: () => ctx.volgende() }, tekst);
}

/** Laat een element kort schudden (of flitsen bij "minder beweging", via CSS). */
export function schud(element: Element): void {
  element.classList.remove("schud");
  void (element as HTMLElement).offsetWidth;
  element.classList.add("schud");
  setTimeout(() => element.classList.remove("schud"), 400);
}

/** Fien en Jef links, de inhoud (bv. een tekstballon) rechts ernaast. */
export function metFienEnJef(...inhoud: Node[]): HTMLElement {
  return el("div", { class: "met-figuren" }, el("div", { class: "figuren zwaai" }, fien(), jef()), el("div", { class: "naast-figuren" }, ...inhoud));
}
