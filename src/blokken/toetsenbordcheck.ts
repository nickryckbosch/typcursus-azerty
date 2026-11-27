// Toetsenbordcheck (les 0): staat het toestel op Belgisch AZERTY?
// Blokkeert niet: ook bij een fout mag het kind verder. De waarschuwing komt
// terug in de volgende lessen zolang het niet in orde is.

import { t } from "../content";
import type { ToetsenbordcheckBlok } from "../content/types";
import { stapA, stapZes, vraagIndelingOp, type Indeling } from "../logica/toetsenbordcheck";
import { el } from "../weergave/dom";
import type { BlokFunctie } from "./context";
import { enterHint, metFienEnJef, schud, verderKnop } from "./gedeeld";

type Stap = "bezig" | "drukA" | "druk6" | "klaar";

export const toetsenbordcheck: BlokFunctie<ToetsenbordcheckBlok> = (blok, ctx) => {
  let stap: Stap = "bezig";
  const vak = el("div", { class: "blok blok-check" });
  ctx.podium.append(vak);

  function toon(...inhoud: Node[]): void {
    vak.replaceChildren(el("h2", {}, blok.titel), ...inhoud);
  }

  function klaar(indeling: Indeling): void {
    stap = "klaar";
    const ok = indeling === "belgisch";
    ctx.app.voortgang.toetsenbord = ok ? "ok" : "fout";
    ctx.app.bewaar();
    ctx.toetsenbord.markeer([]);
    if (ok) {
      toon(metFienEnJef("blij", el("p", { class: "grote-tekst goed" }, t("check.ok"))), enterHint(ctx), verderKnop(ctx));
      ctx.zeg(t("check.ok"));
    } else {
      toon(
        metFienEnJef("nadenkend", el("p", { class: "grote-tekst" }, t("check.fout")), el("p", {}, t("check.verderMag"))),
        el(
          "details",
          { class: "leerkracht-uitleg", open: true },
          el("summary", {}, t("check.voorLeerkracht")),
          el("p", {}, t(indeling === "frans" ? "check.uitlegFrans" : "check.uitlegAnders")),
          el("p", {}, t("leerkracht.toetsenbordInstellen")),
        ),
        enterHint(ctx),
        verderKnop(ctx),
      );
      ctx.zeg(`${t("check.fout")} ${t("check.verderMag")}`);
    }
  }

  function vraagA(): void {
    stap = "drukA";
    toon(el("p", { class: "grote-tekst" }, t("check.drukA")), el("div", { class: "grote-toets" }, "A"));
    ctx.toetsenbord.markeer(["KeyQ"]);
    ctx.zeg(t("check.drukA"));
  }

  function vraag6(): void {
    stap = "druk6";
    toon(el("p", { class: "grote-tekst" }, t("check.druk6")), el("div", { class: "grote-toets" }, "6"));
    ctx.toetsenbord.markeer(["Digit6"]);
    ctx.zeg(t("check.druk6"));
  }

  toon(el("p", { class: "grote-tekst" }, t("check.bezig")));
  void vraagIndelingOp().then((indeling) => {
    if (stap !== "bezig") return;
    if (indeling) klaar(indeling);
    else vraagA();
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
          if (e.code === "KeyQ" && stapA(e.key) === "ok") vraag6();
          else klaar("qwerty");
        } else if (e.key.length === 1) {
          schud(vak);
        }
        return;
      }
      if (stap === "druk6") {
        if (e.code === "Digit6") {
          ctx.toetsenbord.flits(e.code, true);
          klaar(stapZes(e.key));
        } else if (e.key.length === 1) {
          schud(vak);
        }
      }
    },
  };
};
