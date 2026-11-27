// Toetsenbordcheck (les 0): staat het toestel op Belgisch AZERTY?
// Blokkeert niet: ook bij een fout mag het kind verder. De waarschuwing komt
// terug in de volgende lessen zolang het niet in orde is.

import { t } from "../content";
import type { ToetsenbordcheckBlok } from "../content/types";
import { stapA, stapZes, vraagIndelingOp, type Indeling } from "../logica/toetsenbordcheck";
import { el } from "../weergave/dom";
import type { BlokFunctie } from "./context";
import { oefenscherm, startVerborgen, toon } from "./oefenscherm";

type Stap = "bezig" | "drukA" | "druk6" | "klaar";

export const toetsenbordcheck: BlokFunctie<ToetsenbordcheckBlok> = (_blok, ctx) => {
  let stap: Stap = "bezig";
  const scherm = oefenscherm(ctx, { figuren: "nadenkend", klasse: "blok-check" });

  // De kaart met de toets en de uitleg staan er van bij het begin, op dezelfde
  // plek; alleen hun zichtbaarheid wisselt.
  const kaart = startVerborgen(el("div", { class: "grote-toets" }, el("span", {}, "A")));
  const uitlegFrans = el("p", {}, t("check.uitlegFrans"));
  const uitlegAnders = el("p", {}, t("check.uitlegAnders"));
  const uitleg = startVerborgen(
    el(
      "details",
      { class: "leerkracht-uitleg", open: true },
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

  function vraag(tekst: string, teken: string, codes: string[], volgendeStap: Stap): void {
    stap = volgendeStap;
    kaart.firstElementChild!.textContent = teken;
    toon(kaart);
    scherm.zetOpdracht(tekst);
    ctx.toetsenbord.markeer(codes);
  }

  void vraagIndelingOp().then((indeling) => {
    if (stap !== "bezig") return;
    if (indeling) klaar(indeling);
    else vraag(t("check.drukA"), "A", ["KeyQ"], "drukA");
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
          // Het schermtoetsenbord heeft geen cijferrij: de 6 staat groot op de kaart.
          if (e.code === "KeyQ" && stapA(e.key) === "ok") vraag(t("check.druk6"), "6", [], "druk6");
          else klaar("qwerty");
        }
        return;
      }
      if (stap === "druk6") {
        if (e.code === "Digit6") {
          ctx.toetsenbord.flits(e.code, true);
          klaar(stapZes(e.key));
        }
      }
    },
  };
};
