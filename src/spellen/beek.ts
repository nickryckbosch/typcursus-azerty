// Spel "Over de beek" (les 1). Fien en Jef springen van steen naar steen.
// Op elke steen staat een letter; elke derde steen is een lange platte steen
// voor de spatie. Juist: ze springen. Fout: de steen wiebelt en de juiste
// vinger licht op; niemand valt in het water. Drie beken. Geen tijd, geen punten.

import { t } from "../content";
import type { BlokFunctie } from "../blokken/context";
import type { SpelBlok } from "../content/types";
import { beekStenen } from "../logica/reeksen";
import { nieuweOefening, teltAlsTeken, typ, volgendTeken, type TypOefening } from "../logica/typen";
import { el } from "../weergave/dom";
import { fien, jef } from "../weergave/figuren";
import { tekenTonen } from "../weergave/tekens";
import { nieuweKaart, schud } from "../blokken/gedeeld";
import { oefenscherm } from "../blokken/oefenscherm";

const STENEN = 12;
const BEKEN = 3;
const HULP_NA_MS = 3000;

export const beek: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const letters = blok.tekens.filter((x) => x !== " ");
  let nummer = 0;
  let oef: TypOefening = nieuweOefening("");
  let stenen: HTMLElement[] = [];
  let klaar = false;
  let hulpTimer: number | undefined;

  const rij = el("div", { class: "stenen" });
  const springers = el("div", { class: "springers" }, fien("blij", 80), jef("blij", 80));
  const water = el(
    "div",
    { class: "beek" },
    el("div", { class: "oever oever-links" }),
    rij,
    el("div", { class: "oever oever-rechts" }, el("div", { class: "huisje", "aria-hidden": "true" })),
    springers,
  );
  const scherm = oefenscherm(ctx, { breed: true });
  scherm.element.classList.add("blok-beek");
  scherm.veld.append(water);
  scherm.zetOpdracht(t("beek.opdracht"));

  function zetSpringers(): void {
    // Op de oever (voor de eerste steen) of op de laatst gesprongen steen.
    const doel = oef.positie === 0 ? water.querySelector<HTMLElement>(".oever-links") : stenen[oef.positie - 1];
    if (!doel) return;
    const links = doel.offsetLeft + doel.offsetWidth / 2 - springers.offsetWidth / 2;
    springers.style.transform = `translateX(${links}px)`;
  }

  function markeerVolgende(): void {
    stenen.forEach((s, i) => s.classList.toggle("volgende", i === oef.positie));
  }

  function startHulpTimer(): void {
    clearTimeout(hulpTimer);
    hulpTimer = window.setTimeout(() => ctx.toonHulp(volgendTeken(oef)), HULP_NA_MS);
  }

  function nieuweBeek(): void {
    const tekens = beekStenen(letters, STENEN);
    oef = nieuweOefening(tekens.join(""));
    stenen = tekens.map((x) => el("div", { class: x === " " ? "steen steen-plat" : "steen" }, tekenTonen(x)));
    rij.replaceChildren(...stenen);
    scherm.zetKop(`${blok.titel} \u00b7 ${t("beek.teller", { nummer: nummer + 1, totaal: BEKEN })}`);
    markeerVolgende();
    requestAnimationFrame(zetSpringers);
    startHulpTimer();
  }

  nieuweBeek();

  return {
    opToets(e) {
      if (klaar) {
        if (e.key === "Enter") ctx.volgende();
        return;
      }
      if (!teltAlsTeken(e)) return;
      const { juist, klaar: overgestoken } = typ(oef, e.key, performance.now());
      ctx.toetsenbord.flits(e.code, juist);
      if (!juist) {
        schud(stenen[oef.positie]);
        ctx.toonHulp(volgendTeken(oef));
        return;
      }
      ctx.toonHulp(null);
      zetSpringers();
      markeerVolgende();
      startHulpTimer();
      if (!overgestoken) return;

      clearTimeout(hulpTimer);
      ctx.bewaarAanslagen(oef.aanslagen);
      nummer++;
      if (nummer < BEKEN) {
        // Meteen een nieuwe beek: de volgende toets telt al voor de eerste steen.
        nieuweBeek();
        nieuweKaart(rij);
      } else {
        klaar = true;
        scherm.zetOpdracht(t("beek.klaar"));
        scherm.toonEnter();
      }
    },
    opruimen() {
      clearTimeout(hulpTimer);
    },
  };
};
