// De balk bovenaan elk scherm: terug-knop, titel en de knop voor voorlezen.

import type { App } from "../app";
import { t } from "../content";
import { el } from "./dom";
import { kanVoorlezen } from "./spraak";

export function voorleesKnop(app: App, opAan?: () => void): HTMLButtonElement {
  const knop = el("button", { class: "knop knop-voorlezen", type: "button" });
  const werkBij = () => {
    const aan = app.voortgang.instellingen.voorlezen;
    knop.setAttribute("aria-pressed", String(aan));
    knop.replaceChildren(
      el("span", { class: "luidspreker", "aria-hidden": "true" }, aan ? "\u{1F50A}" : "\u{1F508}"),
      " ",
      t(aan ? "voorlezen.aan" : "voorlezen.uit"),
    );
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

export function kop(app: App, titel: string, ...extra: (Node | null)[]): HTMLElement {
  return el(
    "header",
    { class: "kop" },
    el("button", { class: "knop knop-terug", type: "button", onclick: () => app.naarStart() }, t("knop.terug")),
    el("h1", { class: "kop-titel" }, titel),
    ...extra,
  );
}
