// Het lesscherm: bovenaan de stapjes, in het midden het blok, onderaan het
// schermtoetsenbord tussen de twee getekende handen.

import type { App, Scherm } from "../app";
import { t, type TekstSleutel } from "../content";
import type { Les } from "../content/types";
import { blokFunctie } from "../blokken";
import { oefenscherm } from "../blokken/oefenscherm";
import { tekstMetToetsen, zonderOpmaak } from "../weergave/tekst";
import { verderBij, zetBezigBij } from "../logica/voortgang";
import type { BlokContext, BlokInstantie } from "../blokken/context";
import { toetsVoorTeken } from "../logica/indeling";
import { voegAanslagenToe } from "../logica/statistieken";
import { vraagIndelingOp } from "../logica/toetsenbordcheck";
import { el } from "../weergave/dom";
import { maakHanden } from "../weergave/handen";
import { kop, voorleesKnop } from "../weergave/kop";
import { spreek } from "../weergave/spraak";
import { tekenNaam } from "../weergave/tekens";
import { maakToetsenbord } from "../weergave/toetsenbord";

export function lesScherm(app: App, les: Les, wortel: HTMLElement, startBlok?: number): Scherm {
  const toetsenbord = maakToetsenbord(les.geleerdeToetsen);
  const handen = maakHanden(t("hand.links"), t("hand.rechts"));
  const podium = el("main", { class: "podium", "aria-live": "polite" });
  const hulpregel = el("p", { class: "hulpregel", "aria-live": "polite" });
  const stapjes = el("ol", { class: "stapjes", "aria-label": t("les.stapjes") });
  let laatsteTekst = "";
  const leesNogEens = el(
    "button",
    { class: "knop knop-klein", type: "button", onclick: () => spreek(laatsteTekst) },
    t("knop.leesVoor"),
  );
  const werkLeesKnopBij = () => (leesNogEens.hidden = !app.voortgang.instellingen.voorlezen);
  werkLeesKnopBij();

  const toetsenbordMelding = el(
    "div",
    { class: "melding melding-toetsenbord", role: "alert", hidden: true },
    el("span", {}, t("melding.toetsenbord")),
    el("button", { class: "knop knop-klein", type: "button", onclick: () => app.naarLeerkracht() }, t("knop.uitlegLeerkracht")),
  );
  const werkToetsenbordMeldingBij = () => {
    toetsenbordMelding.hidden = app.voortgang.toetsenbord !== "fout" || huidigType() === "toetsenbordcheck";
  };

  const scherm = el("div", { class: "scherm scherm-les" });
  wortel.append(scherm);
  scherm.append(
    kop(app, t("les.titel", { nummer: les.id, titel: les.titel }), stapjes, leesNogEens, voorleesKnop(app, () => {
      werkLeesKnopBij();
      spreek(laatsteTekst);
    })),
    toetsenbordMelding,
    podium,
    hulpregel,
    el("footer", { class: "typzone" }, handen.links, toetsenbord.element, handen.rechts),
  );

  let index = startBlok ?? 0;
  let instantie: BlokInstantie | null = null;
  let timers: number[] = [];
  const sessie: BlokContext["sessie"] = {};
  const huidigType = () => les.online[index]?.type;

  // Controleer de indeling bij de start van elke les (stil, zonder het kind te storen).
  void vraagIndelingOp().then((indeling) => {
    if (indeling === null) return;
    app.voortgang.toetsenbord = indeling === "belgisch" ? "ok" : "fout";
    app.bewaar();
    werkToetsenbordMeldingBij();
  });

  const ctx: BlokContext = {
    app,
    les,
    podium,
    toetsenbord,
    handen,
    sessie,
    toonHulp(teken) {
      const gevonden = teken === null ? undefined : toetsVoorTeken(teken);
      if (!gevonden || teken === null) {
        toetsenbord.markeer([]);
        handen.toon([]);
        hulpregel.textContent = "";
        return;
      }
      toetsenbord.markeer([gevonden.toets.code]);
      handen.toon([gevonden.toets.vinger]);
      hulpregel.replaceChildren(
        ...tekstMetToetsen(
          t("hulp.teken", {
            teken: tekenNaam(teken),
            vinger: t(`vinger.${gevonden.toets.vinger}` as TekstSleutel),
          }),
        ),
      );
    },
    zeg(tekst) {
      laatsteTekst = zonderOpmaak(tekst);
      spreek(laatsteTekst);
    },
    volgende() {
      toonBlok(index + 1);
    },
    gaNaar(i) {
      toonBlok(i);
    },
    indexVan(type) {
      return les.online.findIndex((b) => b.type === type);
    },
    bewaarAanslagen(aanslagen) {
      voegAanslagenToe(app.voortgang.toetsen, aanslagen);
      app.bewaar();
    },
    toonToetsenbord(aan) {
      scherm.classList.toggle("zonder-toetsenbord", !aan);
    },
    later(fn, ms) {
      timers.push(window.setTimeout(fn, ms));
    },
  };

  function werkStapjesBij(): void {
    stapjes.replaceChildren(
      ...les.online.map((blok, i) =>
        el(
          "li",
          {
            class: i < index ? "stapje klaar" : i === index ? "stapje huidig" : "stapje",
            "aria-current": i === index ? "step" : undefined,
            title: blok.titel,
          },
          el("span", { class: "verborgen" }, t("les.stap", { nummer: i + 1, totaal: les.online.length, titel: blok.titel })),
        ),
      ),
    );
  }

  function toonBlok(i: number): void {
    instantie?.opruimen?.();
    timers.forEach((id) => clearTimeout(id));
    timers = [];
    ctx.toonHulp(null);
    toetsenbord.toonEnter(false);
    ctx.toonToetsenbord(true);
    podium.replaceChildren();
    (document.activeElement as HTMLElement | null)?.blur?.();
    if (i >= les.online.length) {
      app.naarStart();
      return;
    }
    index = i;
    zetBezigBij(app.voortgang, les.id, i, les.online.length);
    app.bewaar();
    werkStapjesBij();
    werkToetsenbordMeldingBij();
    const blok = les.online[i];
    // Voor tests en opmaak: welk soort blok staat er in het podium?
    podium.dataset.blok = blok.type === "spel" ? `spel-${blok.spel}` : blok.type;
    const functie = blokFunctie(blok);
    instantie = functie ? functie(blok, ctx) : null;
  }

  // Was het kind al bezig met deze les? Dan eerst vragen: verdergaan of opnieuw beginnen.
  const bezig = startBlok === undefined ? verderBij(app.voortgang, les.id) : null;
  if (bezig !== null && bezig < les.online.length) {
    toonVerderVraag(bezig);
  } else {
    toonBlok(startBlok ?? 0);
  }

  function toonVerderVraag(blok: number): void {
    index = blok;
    werkStapjesBij();
    ctx.toonToetsenbord(false);
    const titel = les.online[blok].titel;
    const tekst = t("verder.vraag", { nummer: blok + 1, titel });
    const opnieuw = el("button", { class: "knop", type: "button", onclick: () => toonBlok(0) }, t("verder.opnieuw"));
    const verder = el(
      "button",
      { class: "knop knop-hoofd", type: "button", onclick: () => toonBlok(blok) },
      t("verder.knop", { nummer: blok + 1, titel }),
    );
    podium.dataset.blok = "verder";
    const scherm = oefenscherm(ctx, { kop: les.titel, figuren: "blij" });
    scherm.zetOpdracht(tekst);
    scherm.voet.replaceChildren(el("div", { class: "knoppen" }, verder, opnieuw));
    // Enter kiest "verdergaan" (de knop heeft de focus); met Tab kies je "opnieuw beginnen".
    verder.focus();
  }

  return {
    opToets(e) {
      instantie?.opToets?.(e);
      werkToetsenbordMeldingBij();
    },
    opruimen() {
      instantie?.opruimen?.();
      timers.forEach((id) => clearTimeout(id));
    },
  };
}
