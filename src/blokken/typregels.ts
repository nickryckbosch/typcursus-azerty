// Oefenregels typen, gebruikt door "reeks" (oefenregels) en "eindoefening".
// De huidige regel staat groot, de volgende regels kleiner eronder.
// Bij een fout blijft de cursor staan en lichten toets en vinger op.
// Wacht het kind langer dan HULP_NA_MS, dan verschijnt de hulp ook.

import { t } from "../content";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken, type TypOefening } from "../logica/typen";
import { el } from "../weergave/dom";
import type { BlokContext, BlokInstantie } from "./context";
import { schud } from "./gedeeld";

const HULP_NA_MS = 3000;

export function typRegels(
  ctx: BlokContext,
  regels: string[],
  opdracht: string,
  opKlaar: (oefeningen: TypOefening[]) => void,
): BlokInstantie {
  const oefeningen = regels.map((r) => nieuweOefening(r));
  let r = 0;
  let hulpTimer: number | undefined;
  let klaar = false;

  const teller = el("p", { class: "teller" });
  const huidige = el("div", { class: "typregel", "aria-hidden": "true" });
  const volgende = el("div", { class: "volgende-regels", "aria-hidden": "true" });
  const voorlezer = el("p", { class: "verborgen" });
  ctx.podium.append(
    el("div", { class: "blok blok-typen" }, el("p", { class: "opdracht" }, opdracht), teller, huidige, volgende, voorlezer),
  );

  function tekenRegel(): void {
    const oef = oefeningen[r];
    huidige.replaceChildren(
      ...[...oef.doel].map((teken, i) =>
        el(
          "span",
          {
            class: ["teken", teken === " " ? "is-spatie" : "", i < oef.positie ? "gedaan" : "", i === oef.positie ? "cursor" : ""].join(" "),
          },
          teken === " " ? " " : teken,
        ),
      ),
    );
    volgende.replaceChildren(...regels.slice(r + 1, r + 3).map((regel) => el("div", {}, regel)));
    teller.textContent = t("reeks.regel", { nummer: r + 1, totaal: regels.length });
    voorlezer.textContent = oef.doel;
  }

  function huidigTeken(): HTMLElement | null {
    return huidige.children[oefeningen[r].positie] as HTMLElement | null;
  }

  function startHulpTimer(): void {
    clearTimeout(hulpTimer);
    hulpTimer = window.setTimeout(() => ctx.toonHulp(volgendTeken(oefeningen[r])), HULP_NA_MS);
  }

  tekenRegel();
  startHulpTimer();
  ctx.zeg(opdracht);

  return {
    opToets(e) {
      if (klaar || !teltAlsTeken(e)) return;
      const oef = oefeningen[r];
      const { juist, klaar: regelKlaar } = typ(oef, e.key, performance.now());
      ctx.toetsenbord.flits(e.code, juist);
      if (!juist) {
        const c = huidigTeken();
        if (c) schud(c);
        ctx.toonHulp(volgendTeken(oef));
        return;
      }
      ctx.toonHulp(null);
      startHulpTimer();
      if (!regelKlaar) {
        const vorig = huidige.children[oef.positie - 1];
        vorig?.classList.remove("cursor");
        vorig?.classList.add("gedaan");
        huidigTeken()?.classList.add("cursor");
        return;
      }
      tekenRegel();
      if (r + 1 < regels.length) {
        r++;
        ctx.later(tekenRegel, 250);
      } else {
        klaar = true;
        clearTimeout(hulpTimer);
        ctx.later(() => opKlaar(oefeningen), 400);
      }
    },
    opruimen() {
      clearTimeout(hulpTimer);
    },
  };
}
