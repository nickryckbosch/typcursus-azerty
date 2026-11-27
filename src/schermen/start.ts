// Startscherm: de lessen als tegels, het oefenbord en de knop voor voorlezen.

import type { App, Scherm } from "../app";
import { t } from "../content";
import { isBeschikbaar } from "../blokken";
import { isLesOpen, legeLesVoortgang } from "../logica/voortgang";
import { el } from "../weergave/dom";
import { fien, jef, sterIcoon } from "../weergave/figuren";
import { voorleesKnop } from "../weergave/kop";

export function startScherm(app: App, wortel: HTMLElement): Scherm {
  const volgorde = app.lessen.map((l) => l.id);

  const tegels = app.lessen.map((les) => {
    const beschikbaar = isBeschikbaar(les);
    const open = beschikbaar && isLesOpen(app.voortgang, les.id, volgorde);
    const lv = app.voortgang.lessen[String(les.id)] ?? legeLesVoortgang();
    const heeftMeting = les.online.some((b) => b.type === "eindoefening" && b.doelNauwkeurigheid !== null);
    const status = !beschikbaar
      ? t("les.binnenkort")
      : !open
        ? t("les.slot")
        : lv.bezigBij !== null
          ? t("les.bezig", { nummer: lv.bezigBij + 1, totaal: les.online.length })
          : lv.afgewerkt
            ? t("les.af")
            : t("les.open");

    return el(
      "li",
      {},
      el(
        "button",
        {
          class: `tegel ${open ? "tegel-open" : "tegel-dicht"} ${lv.afgewerkt ? "tegel-af" : ""}`,
          type: "button",
          disabled: !open,
          onclick: () => app.naarLes(les),
        },
        el("span", { class: "tegel-nummer" }, t("les.nummer", { nummer: les.id })),
        el("span", { class: "tegel-titel" }, les.titel),
        el(
          "span",
          { class: "tegel-status" },
          !open ? el("span", { class: "slotje", "aria-hidden": "true" }, "\u{1F512}") : null,
          status,
        ),
        lv.afgewerkt && heeftMeting
          ? el(
              "span",
              { class: "tegel-sterren", "aria-label": t("les.sterren", { aantal: lv.sterren }) },
              ...[1, 2, 3].map((i) => sterIcoon(i <= lv.sterren, 26)),
            )
          : null,
      ),
    );
  });

  wortel.append(
    el(
      "div",
      { class: "scherm scherm-start" },
      el(
        "header",
        { class: "start-kop" },
        el("div", { class: "figuren" }, fien("zwaai", 130), jef("zwaai", 130)),
        el("div", {}, el("h1", {}, t("app.titel")), el("p", { class: "startzin" }, t("startzin"))),
        el("div", { class: "start-knoppen" }, voorleesKnop(app), el("button", { class: "knop", type: "button", onclick: () => app.naarOefenbord() }, t("knop.oefenbord"))),
      ),
      el("main", {}, el("h2", { class: "verborgen" }, t("start.lessen")), el("ol", { class: "tegels" }, ...tegels)),
    ),
  );

  // Zet de focus op de eerste les die open en nog niet af is: Enter start ze meteen.
  const eerste = wortel.querySelector<HTMLButtonElement>(".tegel-open:not(.tegel-af)") ?? wortel.querySelector<HTMLButtonElement>(".tegel-open");
  eerste?.focus();
  return {};
}
