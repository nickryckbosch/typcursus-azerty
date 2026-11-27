// Oefenregels typen, gebruikt door "reeks" (oefenregels) en "eindoefening".
// De huidige regel staat groot, de volgende regels kleiner eronder (altijd
// twee regels hoog, ook als er geen volgende regels meer zijn: zo verspringt
// er niets). Bij een fout blijft de cursor staan en lichten toets en vinger op.
// Wacht het kind langer dan HULP_NA_MS, dan verschijnt de hulp ook.

import { t } from "../content";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken, type TypOefening } from "../logica/typen";
import { el } from "../weergave/dom";
import type { BlokContext, BlokInstantie } from "./context";
import { nieuweKaart, schud } from "./gedeeld";
import { oefenscherm } from "./oefenscherm";

const HULP_NA_MS = 3000;

export function typRegels(
  ctx: BlokContext,
  titel: string,
  regels: string[],
  opdracht: string,
  opKlaar: (oefeningen: TypOefening[]) => void,
): BlokInstantie {
  const oefeningen = regels.map((r) => nieuweOefening(r));
  let r = 0;
  let hulpTimer: number | undefined;
  let klaar = false;

  const scherm = oefenscherm(ctx, { breed: true });
  const huidige = el("div", { class: "typregel", "aria-hidden": "true" });
  const volgende = el("div", { class: "volgende-regels", "aria-hidden": "true" });
  const voorlezer = el("p", { class: "verborgen" });
  scherm.veld.append(huidige, volgende, voorlezer);
  scherm.zetOpdracht(opdracht);

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
    volgende.replaceChildren(
      ...[1, 2].map((n) => el("div", { class: "volgende-regel" }, regels[r + n] ?? " ")),
    );
    scherm.zetKop(`${titel} · ${t("reeks.regel", { nummer: r + 1, totaal: regels.length })}`);
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
      // Meteen de volgende regel (of het einde): de eerste toets van de nieuwe regel
      // telt al, dus moet het kind die regel ook meteen zien.
      if (r + 1 < regels.length) {
        r++;
        tekenRegel();
        nieuweKaart(huidige);
      } else {
        klaar = true;
        clearTimeout(hulpTimer);
        opKlaar(oefeningen);
      }
    },
    opruimen() {
      clearTimeout(hulpTimer);
    },
  };
}
