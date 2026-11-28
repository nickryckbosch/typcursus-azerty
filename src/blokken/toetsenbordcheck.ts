// Toetsenbordcheck (les 0): staat het toestel op Belgisch AZERTY?
// Blokkeert niet: ook bij een fout mag het kind verder. De waarschuwing komt
// terug in de volgende lessen zolang het niet in orde is.
//
// Alles staat in de middenkolom (K27 fase 2): de opdracht bovenaan, in het
// midden een vak waarin de toestanden op dezelfde plek staan (Fien of Jef, de
// toets om te drukken, of de uitleg voor de leerkracht), en de knop Verder
// eronder. Bij de uitkomst steekt Fien of Jef groot de duim op.

import { t } from "../content";
import type { ToetsenbordcheckBlok } from "../content/types";
import { stapA, stapZes, vraagIndelingOp, type Indeling } from "../logica/toetsenbordcheck";
import { el } from "../weergave/dom";
import { fienOfJef } from "../weergave/figuren";
import type { BlokFunctie } from "./context";
import { oefenscherm, startVerborgen, toon } from "./oefenscherm";

type Stap = "bezig" | "drukA" | "druk6" | "klaar";

export const toetsenbordcheck: BlokFunctie<ToetsenbordcheckBlok> = (_blok, ctx) => {
  let stap: Stap = "bezig";
  const scherm = oefenscherm(ctx, { opbouw: "kolom", klasse: "blok-check" });

  // De drie toestanden staan er van bij het begin, op dezelfde plek in het
  // midden; alleen hun zichtbaarheid wisselt (K20).
  // 1. Fien of Jef: denkt na terwijl de app kijkt, steekt de duim op als het in orde is.
  const figuurVak = el("div", { class: "check-figuur zacht" }, fienOfJef(ctx.blokNummer(), "nadenkend", 220));
  // 2. De toets die het kind moet drukken (als de app de indeling niet zelf kan lezen).
  const kaart = startVerborgen(el("div", { class: "grote-toets" }, el("span", {}, "A")));
  // 3. Niet in orde: Fien of Jef naast de uitleg voor de leerkracht.
  const uitlegFrans = el("p", {}, t("check.uitlegFrans"));
  const uitlegAnders = el("p", {}, t("check.uitlegAnders"));
  const uitleg = startVerborgen(
    el(
      "div",
      { class: "check-fout" },
      fienOfJef(ctx.blokNummer(), "nadenkend", 170),
      el(
        "details",
        { class: "leerkracht-uitleg", open: true },
        el("summary", {}, t("check.voorLeerkracht")),
        uitlegFrans,
        uitlegAnders,
        el("p", {}, t("leerkracht.toetsenbordInstellen")),
      ),
    ),
  );
  scherm.veld.append(el("div", { class: "stapel" }, figuurVak, kaart, uitleg));
  scherm.zetOpdracht(t("check.bezig"), false);

  function klaar(indeling: Indeling): void {
    stap = "klaar";
    const ok = indeling === "belgisch";
    ctx.app.voortgang.toetsenbord = ok ? "ok" : "fout";
    ctx.app.bewaar();
    ctx.toetsenbord.markeer([]);
    toon(kaart, false);
    if (ok) {
      // Dezelfde plek, een andere houding: de duim omhoog.
      figuurVak.replaceChildren(fienOfJef(ctx.blokNummer(), "duim", 220));
      toon(figuurVak);
      scherm.zetOpdracht(t("check.ok"));
    } else {
      toon(figuurVak, false);
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
    toon(figuurVak, false);
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
        // Een ingehouden Enter (herhaling van het vorige scherm) telt niet:
        // anders verdwijnt de uitkomst voor het kind ze kon lezen.
        if (e.key === "Enter" && !e.repeat) ctx.volgende();
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
