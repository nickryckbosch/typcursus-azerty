// Toetsenbordcheck (les 0): staat het toestel op Belgisch AZERTY?
// Blokkeert niet: ook bij een fout mag het kind verder. De waarschuwing komt
// terug in de volgende lessen zolang het niet in orde is.
//
// Elke toestand gebruikt de gedeelde bouwsteen slotscherm() (K27 fase 2): Fien
// in het midden, wat ze zegt in een tekstballon erboven, de knop Verder eronder.
// - de app kijkt: Fien denkt na;
// - het kind moet een toets zoeken: de toets staat groot naast Fien;
// - in orde: Fien steekt groot de duim op;
// - niet in orde: de uitleg voor de leerkracht staat naast Fien.
// Het toetsenbord blijft in beeld: het kind heeft het nodig.

import { t } from "../content";
import type { ToetsenbordcheckBlok } from "../content/types";
import { stapA, stapZes, vraagIndelingOp, type Indeling } from "../logica/toetsenbordcheck";
import { el } from "../weergave/dom";
import type { BlokFunctie } from "./context";
import { slotscherm, type SlotschermOpties } from "./oefenscherm";

type Stap = "bezig" | "drukA" | "druk6" | "klaar";

export const toetsenbordcheck: BlokFunctie<ToetsenbordcheckBlok> = (_blok, ctx) => {
  let stap: Stap = "bezig";

  /** Toon een toestand: altijd dezelfde opbouw, op dezelfde plek. */
  function toon(opties: Pick<SlotschermOpties, "figuren" | "zin" | "naast" | "knoppen">): void {
    ctx.podium.replaceChildren();
    slotscherm(ctx, { ...opties, wie: "fien", toetsenbord: true, focus: false, klasse: "blok-check" });
  }
  const verder = [{ tekst: t("knop.verder"), actie: () => ctx.volgende(), enter: true }];

  toon({ figuren: "nadenkend", zin: t("check.bezig") });

  function klaar(indeling: Indeling): void {
    stap = "klaar";
    const ok = indeling === "belgisch";
    ctx.app.voortgang.toetsenbord = ok ? "ok" : "fout";
    ctx.app.bewaar();
    ctx.toetsenbord.markeer([]);
    if (ok) {
      toon({ figuren: "duim", zin: t("check.ok"), knoppen: verder });
      return;
    }
    const uitleg = el(
      "details",
      { class: "leerkracht-uitleg", open: true },
      el("summary", {}, t("check.voorLeerkracht")),
      el("p", {}, t(indeling === "frans" ? "check.uitlegFrans" : "check.uitlegAnders")),
      el("p", {}, t("leerkracht.toetsenbordInstellen")),
    );
    toon({ figuren: "nadenkend", zin: `${t("check.fout")} ${t("check.verderMag")}`, naast: uitleg, knoppen: verder });
  }

  function vraag(tekst: string, teken: string, codes: string[], volgendeStap: Stap): void {
    stap = volgendeStap;
    // De toets die het kind moet drukken, groot naast Fien.
    toon({ figuren: "nadenkend", zin: tekst, naast: el("div", { class: "grote-toets" }, el("span", {}, teken)) });
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
