// Toetsenbordcheck (les 0): staat het toestel op Belgisch AZERTY?
// Blokkeert niet: ook bij een fout mag het kind verder. De waarschuwing komt
// terug in de volgende lessen zolang het niet in orde is.

import { t } from "../content";
import type { ToetsenbordcheckBlok } from "../content/types";
import { stapA, stapZes, vraagIndelingOp, type Indeling } from "../logica/toetsenbordcheck";
import { el } from "../weergave/dom";
import type { BlokFunctie } from "./context";
import { schud } from "./gedeeld";
import { oefenscherm, startVerborgen, toon } from "./oefenscherm";

type Stap = "bezig" | "drukA" | "druk6" | "klaar";

export const toetsenbordcheck: BlokFunctie<ToetsenbordcheckBlok> = (blok, ctx) => {
  let stap: Stap = "bezig";
  const scherm = oefenscherm(ctx, { kop: blok.titel, figuren: "nadenkend" });

  // Alles staat er van bij het begin, op dezelfde plek; alleen de zichtbaarheid wisselt.
  const kaart = startVerborgen(el("div", { class: "grote-toets" }, "A"));
  const uitlegFrans = el("p", {}, t("check.uitlegFrans"));
  const uitlegAnders = el("p", {}, t("check.uitlegAnders"));
  const uitleg = startVerborgen(
    el(
      "details",
      { class: "leerkracht-uitleg" },
      el("summary", {}, t("check.voorLeerkracht")),
      uitlegFrans,
      uitlegAnders,
      el("p", {}, t("leerkracht.toetsenbordInstellen")),
    ),
  );
  scherm.veld.append(el("div", { class: "stapel" }, kaart, uitleg));
  scherm.zetOpdracht(t("check.bezig"), false);

  function klaar(indeling: Indeling): void {
    stap = "klaar";
    const ok = indeling === "belgisch";
    ctx.app.voortgang.toetsenbord = ok ? "ok" : "fout";
    ctx.app.bewaar();
    ctx.toetsenbord.markeer([]);
    toon(kaart, false);
    scherm.zetFiguren(ok ? "blij" : "nadenkend");
    if (ok) {
      scherm.zetOpdracht(t("check.ok"));
    } else {
      uitlegFrans.hidden = indeling !== "frans";
      uitlegAnders.hidden = indeling === "frans";
      toon(uitleg);
      scherm.zetOpdracht(`${t("check.fout")} ${t("check.verderMag")}`);
    }
    scherm.toonEnter();
  }

  function vraag(tekst: string, teken: string, code: string, volgendeStap: Stap): void {
    stap = volgendeStap;
    kaart.textContent = teken;
    toon(kaart);
    scherm.zetOpdracht(tekst);
    ctx.toetsenbord.markeer([code]);
  }

  void vraagIndelingOp().then((indeling) => {
    if (stap !== "bezig") return;
    if (indeling) klaar(indeling);
    else vraag(t("check.drukA"), "A", "KeyQ", "drukA");
  });

  return {
    opToets(e) {
      if (stap === "klaar") {
        if (e.key === "Enter") ctx.volgende();
        return;
      }
      if (stap === "drukA") {
        if (e.code === "KeyQ" || e.code === "KeyA") {
          ctx.toetsenbord.flits(e.code, true);
          if (e.code === "KeyQ" && stapA(e.key) === "ok") vraag(t("check.druk6"), "6", "Digit6", "druk6");
          else klaar("qwerty");
        } else if (e.key.length === 1) {
          schud(kaart);
        }
        return;
      }
      if (stap === "druk6") {
        if (e.code === "Digit6") {
          ctx.toetsenbord.flits(e.code, true);
          klaar(stapZes(e.key));
        } else if (e.key.length === 1) {
          schud(kaart);
        }
      }
    },
  };
};
