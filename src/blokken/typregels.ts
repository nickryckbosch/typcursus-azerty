// Oefenregels typen, gebruikt door "reeks" (oefenregels), "eindoefening" en
// extra oefenen. Links staat een stilstaand figuurtje met een korte tip in een
// tekstballon. In de witte kaart: de opdracht, "Regel 2 van 4", de afgewerkte
// regel grijs met een vinkje, de huidige regel groot en de volgende regels.
// Bij een fout blijft de cursor staan en lichten de juiste toets en vinger op.
// Er beweegt niets (docs/stijlgids.md, deel 1).

import { t } from "../content";
import { kleurVanVinger, toetsVoorTeken } from "../logica/indeling";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken, type TypOefening } from "../logica/typen";
import { el } from "../weergave/dom";
import { fienOfJef, vinkje } from "../weergave/figuren";
import type { BlokContext, BlokInstantie } from "./context";

export function typRegels(
  ctx: BlokContext,
  regels: string[],
  opdracht: string,
  opKlaar: (oefeningen: TypOefening[]) => void,
  tip?: string,
): BlokInstantie {
  const oefeningen = regels.map((r) => nieuweOefening(r));
  let r = 0;
  let hulpTimer: number | undefined;
  let klaar = false;

  const teller = el("p", { class: "teller" });
  const vorigeTekst = el("span", {});
  const vorige = el("p", { class: "regel-klaar", "aria-hidden": "true" }, vinkje(), vorigeTekst);
  const huidige = el("div", { class: "typregel", "aria-hidden": "true" });
  const volgende = el("div", { class: "volgende-regels", "aria-hidden": "true" });
  const voorlezer = el("p", { class: "verborgen" });
  ctx.podium.append(
    el(
      "div",
      { class: "blok-typen" },
      tip
        ? el(
            "aside",
            { class: "tip-zijde" },
            el("p", { class: "ballon staart-onder tip" }, tip),
            fienOfJef(ctx.blokNummer(), "duim", 150),
          )
        : null,
      el(
        "section",
        { class: "kaart typkaart" },
        el("div", { class: "typkaart-kop" }, el("p", { class: "opdracht" }, opdracht), teller),
        vorige,
        huidige,
        volgende,
        voorlezer,
      ),
    ),
  );

  function cursorKlasse(teken: string): string {
    const gevonden = toetsVoorTeken(teken);
    return gevonden ? `cursor kleur-${kleurVanVinger(gevonden.toets.vinger)}` : "cursor";
  }

  function tekenRegel(): void {
    const oef = oefeningen[r];
    huidige.replaceChildren(
      ...[...oef.doel].map((teken, i) =>
        el(
          "span",
          {
            class: ["teken", teken === " " ? "is-spatie" : "", i < oef.positie ? "gedaan" : "", i === oef.positie ? cursorKlasse(teken) : ""].join(" "),
          },
          teken === " " ? "\u00A0" : teken,
        ),
      ),
    );
    vorige.classList.toggle("onzichtbaar", r === 0);
    vorigeTekst.textContent = r > 0 ? regels[r - 1] : "\u00A0";
    volgende.replaceChildren(...regels.slice(r + 1, r + 3).map((regel) => el("div", {}, regel)));
    teller.textContent = t("reeks.regel", { nummer: r + 1, totaal: regels.length });
    voorlezer.textContent = oef.doel;
  }

  function huidigTeken(): HTMLElement | null {
    return huidige.children[oefeningen[r].positie] as HTMLElement | null;
  }

  /** Hulp altijd zichtbaar (standaard), of pas na een tijdje wachten (instelling). */
  function toonOfWacht(): void {
    clearTimeout(hulpTimer);
    const teken = volgendTeken(oefeningen[r]);
    if (ctx.hulpAltijd) {
      ctx.toonHulp(teken);
    } else {
      ctx.toonHulp(null);
      hulpTimer = window.setTimeout(() => ctx.toonHulp(volgendTeken(oefeningen[r])), ctx.hulpNaMs);
    }
  }

  tekenRegel();
  toonOfWacht();
  ctx.zeg(opdracht);

  return {
    opToets(e) {
      if (klaar || !teltAlsTeken(e)) return;
      const oef = oefeningen[r];
      const { juist, klaar: regelKlaar } = typ(oef, e.key, performance.now());
      ctx.toetsenbord.flits(e.code, juist);
      if (!juist) {
        clearTimeout(hulpTimer);
        ctx.toonFout(volgendTeken(oef));
        return;
      }
      if (!regelKlaar) {
        const vorig = huidige.children[oef.positie - 1];
        if (vorig) vorig.className = `teken gedaan ${vorig.classList.contains("is-spatie") ? "is-spatie" : ""}`;
        const nu = huidigTeken();
        const teken = volgendTeken(oef);
        if (nu && teken !== null) nu.className = `teken ${teken === " " ? "is-spatie" : ""} ${cursorKlasse(teken)}`;
        toonOfWacht();
        return;
      }
      if (r + 1 < regels.length) {
        r++;
        tekenRegel();
        toonOfWacht();
      } else {
        klaar = true;
        clearTimeout(hulpTimer);
        tekenRegel();
        ctx.toonHulp(null);
        ctx.later(() => opKlaar(oefeningen), 400);
      }
    },
    opruimen() {
      clearTimeout(hulpTimer);
    },
  };
}
