// Oefenbord voor het klassikale deel: toont alleen de laatst gedrukte toets,
// groot en in de kleur van de vinger, met de vinger op de hand. Geen punten.

import type { App, Scherm } from "../app";
import { t, type TekstSleutel } from "../content";
import { kleurVanVinger, toetsVoorCode } from "../logica/indeling";
import { el } from "../weergave/dom";
import { maakHanden } from "../weergave/handen";
import { kop } from "../weergave/kop";
import { tekenTonen } from "../weergave/tekens";
import { maakToetsenbord } from "../weergave/toetsenbord";

export function oefenbordScherm(app: App, wortel: HTMLElement): Scherm {
  // Op het oefenbord zijn alle letters "geleerd": alles is even duidelijk.
  const toetsenbord = maakToetsenbord([..."azertyuiopqsdfghjklmwxcvbn "]);
  const handen = maakHanden(t("hand.links"), t("hand.rechts"));
  const groot = el("div", { class: "oefenbord-toets" });
  const vinger = el("p", { class: "oefenbord-vinger", "aria-live": "polite" }, t("oefenbord.uitleg"));

  wortel.append(
    el(
      "div",
      { class: "scherm scherm-les scherm-oefenbord" },
      kop(app, t("oefenbord.titel")),
      el("main", { class: "podium" }, el("div", { class: "blok blok-oefenbord" }, groot, vinger)),
      el("footer", { class: "typzone" }, el("div", { class: "typzone-rij" }, handen.links, toetsenbord.element, handen.rechts)),
    ),
  );

  return {
    opToets(e) {
      const toets = toetsVoorCode(e.code);
      if (!toets || e.repeat) return;
      const getoond = e.key.length === 1 ? e.key : toets.basis;
      groot.textContent = tekenTonen(getoond);
      groot.className = `oefenbord-toets kleur-${kleurVanVinger(toets.vinger)} ${toets.code === "Space" ? "is-spatie" : ""}`;
      vinger.textContent = t(`vinger.${toets.vinger}` as TekstSleutel);
      toetsenbord.markeer([toets.code]);
      handen.toon([toets.vinger]);
    },
  };
}
