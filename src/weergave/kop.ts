// De balk bovenaan elk scherm: links de knop "Lessen", in het midden de titel
// (in een les ook de balkjes voor de blokken), rechts de knoppen voor voorlezen.

import type { App } from "../app";
import { t } from "../content";
import { el, svg } from "./dom";
import { kanVoorlezen } from "./spraak";

function luidspreker(aan: boolean): SVGSVGElement {
  return svg(
    "svg",
    { class: "icoon", viewBox: "0 0 24 24", width: 18, height: 18, "aria-hidden": "true" },
    svg("path", { d: "M11 5L6 9H3v6h3l5 4V5z" }),
    aan ? svg("path", { d: "M15.5 8.5a5 5 0 0 1 0 7" }) : svg("path", { d: "M16 9l5 6M21 9l-5 6" }),
  );
}

/** De knop die voorlezen aan of uit zet. */
export function voorleesKnop(app: App, opAan?: () => void): HTMLButtonElement {
  const knop = el("button", { class: "knop knop-klein knop-voorlezen", type: "button" });
  const werkBij = () => {
    const aan = app.voortgang.instellingen.voorlezen;
    knop.setAttribute("aria-pressed", String(aan));
    knop.replaceChildren(luidspreker(aan), t(aan ? "voorlezen.aan" : "voorlezen.uit"));
  };
  knop.addEventListener("click", () => {
    app.zetVoorlezen(!app.voortgang.instellingen.voorlezen);
    werkBij();
    if (app.voortgang.instellingen.voorlezen) opAan?.();
  });
  werkBij();
  if (!kanVoorlezen()) knop.hidden = true;
  return knop;
}

/** midden: een titel (tekst) of een eigen element (titel met balkjes). */
export function kop(app: App, midden: string | Node, ...rechts: (Node | null)[]): HTMLElement {
  return el(
    "header",
    { class: "kop" },
    el(
      "button",
      { class: "knop knop-klein knop-terug", type: "button", title: t("knop.terugTitel"), onclick: () => app.naarStart() },
      svg("svg", { class: "icoon", viewBox: "0 0 24 24", width: 18, height: 18, "aria-hidden": "true" }, svg("path", { d: "M15 18l-6-6 6-6" })),
      t("knop.lessen"),
    ),
    el("div", { class: "kop-midden" }, typeof midden === "string" ? el("h1", { class: "kop-titel" }, midden) : midden),
    el("div", { class: "kop-rechts" }, ...rechts),
  );
}
