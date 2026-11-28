// Leerkrachtscherm (verborgen, Ctrl+Shift+L): toetsenbordinstelling,
// voortgang per les, probleemtoetsen, lesfiches en voortgang wissen.

import type { App, Scherm } from "../app";
import { t, type TekstSleutel } from "../content";
import { soortFout } from "../logica/foutsoort";
import { foutAandeel, meestVerkeerd, overzichtPerToets } from "../logica/metingen";
import { wisVoortgang } from "../logica/opslag";
import { nieuweVoortgang } from "../logica/voortgang";
import { el } from "../weergave/dom";
import { kop } from "../weergave/kop";
import { tekenTonen } from "../weergave/tekens";

function procent(x: number | null): string {
  return x === null ? "-" : `${Math.round(x * 100)}%`;
}

export function leerkrachtScherm(app: App, wortel: HTMLElement): Scherm {
  const v = app.voortgang;

  const toetsenbordStatus = el(
    "section",
    {},
    el("h2", {}, t("leerkracht.toetsenbordTitel")),
    el("p", {}, t(`leerkracht.toetsenbord.${v.toetsenbord}`)),
    el("p", {}, t("leerkracht.toetsenbordInstellen")),
  );

  const lesRijen = app.lessen.map((les) => {
    const lv = v.lessen[String(les.id)];
    const snelheid = lv && lv.snelheden.length > 0 ? lv.snelheden[lv.snelheden.length - 1].toFixed(1) : "-";
    return el(
      "tr",
      {},
      el("td", {}, t("les.nummer", { nummer: les.id })),
      el("td", {}, lv?.afgewerkt ? t("leerkracht.ja") : t("leerkracht.nee")),
      el("td", {}, String(lv?.pogingen ?? 0)),
      el("td", {}, procent(lv?.besteNauwkeurigheid ?? null)),
      el("td", {}, String(lv?.sterren ?? 0)),
      el("td", {}, snelheid),
    );
  });

  // Metingen per toets (projectdocument 12). Alleen voor de leerkracht: het kind ziet dit nooit.
  const toetsRijen = Object.entries(overzichtPerToets(v))
    .sort(([, a], [, b]) => foutAandeel(b) - foutAandeel(a) || b.aantal - a.aantal)
    .map(([teken, s]) => {
      const vaakst = meestVerkeerd(s.verkeerd);
      let verkeerd = "-";
      if (vaakst) {
        const soort = soortFout(teken, vaakst.toets);
        verkeerd = t("leerkracht.verkeerd", { toets: tekenTonen(vaakst.toets), aantal: vaakst.aantal });
        if (soort !== "ander") verkeerd += ` (${t(`leerkracht.fout.${soort}` as TekstSleutel)})`;
      }
      return el(
        "tr",
        {},
        el("td", {}, tekenTonen(teken)),
        el("td", {}, String(s.aantal)),
        el("td", {}, String(s.fouten)),
        el("td", {}, procent(foutAandeel(s))),
        el("td", {}, verkeerd),
        el("td", {}, s.tijdMediaanMs === null ? "-" : `${s.tijdMediaanMs} ms`),
        el("td", {}, String(s.langePauzes)),
      );
    });

  const tabel = (koppen: string[], rijen: HTMLElement[]) =>
    el("table", {}, el("thead", {}, el("tr", {}, ...koppen.map((k) => el("th", { scope: "col" }, k)))), el("tbody", {}, ...rijen));

  // Lesfiches: het klassikale deel van elke les, uit dezelfde JSON.
  const fiches = app.lessen.map((les) =>
    el(
      "details",
      { class: "lesfiche" },
      // Les 0 heeft geen eigen klassikale start (de oriëntatieles komt ervoor in de plaats): geen duur, geen lijst.
      el("summary", {}, `${t("les.nummer", { nummer: les.id })}: ${les.titel}${les.klassikaal.stappen.length > 0 ? ` (${les.klassikaal.duurMinuten} min)` : ""}`),
      el("p", {}, les.klassikaal.materiaal),
      el(
        "ol",
        { ...(les.klassikaal.stappen.length === 0 ? { hidden: true } : {}) },
        ...les.klassikaal.stappen.map((s) =>
          el(
            "li",
            {},
            el("strong", {}, `${s.titel} (${s.duurMinuten} min)`),
            el("p", {}, el("em", {}, t("leerkracht.jij")), " ", s.leerkracht),
            el("p", {}, el("em", {}, t("leerkracht.kinderen")), " ", s.kinderen),
          ),
        ),
      ),
      el("p", {}, el("strong", {}, t("leerkracht.tip")), " ", les.tipLeerkracht),
    ),
  );

  const allesOpenKnop = el(
    "button",
    {
      class: "knop",
      type: "button",
      onclick: () => {
        v.allesOpen = !v.allesOpen;
        app.bewaar();
        app.naarLeerkracht();
      },
    },
    t(v.allesOpen ? "leerkracht.allesDicht" : "leerkracht.allesOpen"),
  );

  // Hulp op het schermtoetsenbord: altijd zichtbaar (standaard, K17) of pas na een fout.
  const hulpKnop = el(
    "button",
    {
      class: "knop",
      type: "button",
      onclick: () => {
        v.instellingen.hulpPasNaFout = !v.instellingen.hulpPasNaFout;
        app.bewaar();
        app.naarLeerkracht();
      },
    },
    t(v.instellingen.hulpPasNaFout ? "leerkracht.hulpAltijdKnop" : "leerkracht.hulpNaFoutKnop"),
  );

  const bevestig = el("input", { type: "text", id: "wis-bevestig", autocomplete: "off", class: "invoer" });
  const wisMelding = el("p", { "aria-live": "polite" });
  const wisKnop = el(
    "button",
    {
      class: "knop knop-gevaar",
      type: "button",
      onclick: () => {
        if (bevestig.value.trim().toLowerCase() !== t("leerkracht.wisWoord")) {
          wisMelding.textContent = t("leerkracht.wisTypEerst");
          bevestig.focus();
          return;
        }
        wisVoortgang();
        app.voortgang = nieuweVoortgang();
        app.bewaar();
        app.naarLeerkracht();
      },
    },
    t("leerkracht.wis"),
  );

  wortel.append(
    el(
      "div",
      { class: "scherm scherm-leerkracht" },
      kop(app, t("leerkracht.titel")),
      el(
        "main",
        {},
        el("p", {}, t("leerkracht.uitleg")),
        toetsenbordStatus,
        el("section", {}, el("h2", {}, t("leerkracht.voortgangTitel")), tabel(
          [t("leerkracht.kolLes"), t("leerkracht.kolAf"), t("leerkracht.kolPogingen"), t("leerkracht.kolBeste"), t("leerkracht.kolSterren"), t("leerkracht.kolSnelheid")],
          lesRijen,
        ), el("p", { class: "klein" }, t("leerkracht.snelheidUitleg"))),
        el("section", {}, el("h2", {}, t("leerkracht.toetsenTitel")), toetsRijen.length === 0
          ? el("p", {}, t("leerkracht.geenToetsen"))
          : tabel(
              [t("leerkracht.kolToets"), t("leerkracht.kolAanslagen"), t("leerkracht.kolFouten"), t("leerkracht.kolFoutPct"), t("leerkracht.kolVerkeerd"), t("leerkracht.kolTijd"), t("leerkracht.kolPauzes")],
              toetsRijen,
            ),
          el("p", { class: "klein" }, t("leerkracht.toetsenUitleg"))),
        el("section", {}, el("h2", {}, t("leerkracht.fichesTitel")), ...fiches),
        el(
          "section",
          {},
          el("h2", {}, t("leerkracht.hulpTitel")),
          el("p", {}, t(v.instellingen.hulpPasNaFout ? "leerkracht.hulpNaFout" : "leerkracht.hulpAltijd")),
          hulpKnop,
        ),
        el("section", {}, el("h2", {}, t("leerkracht.testTitel")), el("p", {}, t("leerkracht.testUitleg")), allesOpenKnop),
        el(
          "section",
          { class: "gevaar" },
          el("h2", {}, t("leerkracht.wisTitel")),
          el("p", {}, t("leerkracht.wisUitleg")),
          el("label", { for: "wis-bevestig" }, t("leerkracht.wisLabel")),
          " ",
          bevestig,
          " ",
          wisKnop,
          wisMelding,
        ),
      ),
    ),
  );
  return {};
}
