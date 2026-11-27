// Het lesscherm: bovenaan de balk met "Les 2 · Oefenregels 1" en een balkje
// per blok, in het midden het blok, onderaan het schermtoetsenbord tussen de
// twee getekende handen, met eronder de zin "Typ de k met je ...".

import type { App, Scherm } from "../app";
import { t, type TekstSleutel } from "../content";
import type { Les } from "../content/types";
import { blokFunctie } from "../blokken";
import { metFienEnJef } from "../blokken/gedeeld";
import { verderBij, zetBezigBij } from "../logica/voortgang";
import type { BlokContext, BlokInstantie } from "../blokken/context";
import { kleurVanVinger, toetsVoorTeken } from "../logica/indeling";
import { voegAanslagenToe } from "../logica/statistieken";
import { vraagIndelingOp } from "../logica/toetsenbordcheck";
import { el } from "../weergave/dom";
import { maakHanden } from "../weergave/handen";
import { kop, voorleesKnop } from "../weergave/kop";
import { spreek } from "../weergave/spraak";
import { maakToetsenbord } from "../weergave/toetsenbord";

export function lesScherm(app: App, les: Les, wortel: HTMLElement, startBlok?: number): Scherm {
  const toetsenbord = maakToetsenbord(les.geleerdeToetsen);
  const handen = maakHanden(t("hand.links"), t("hand.rechts"));
  const podium = el("main", { class: "podium", "aria-live": "polite" });
  const hulpStip = el("span", { class: "hulp-stip", "aria-hidden": "true" });
  const hulpTekst = el("span", {});
  const hulpregel = el("p", { class: "hulpregel leeg", "aria-live": "polite" }, hulpStip, hulpTekst);
  const titel = el("h1", { class: "kop-titel" });
  const stapjes = el("ol", { class: "balkjes", "aria-label": t("les.stapjes") });
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
    kop(app, el("div", { class: "kop-les" }, titel, stapjes), leesNogEens, voorleesKnop(app, () => {
      werkLeesKnopBij();
      spreek(laatsteTekst);
    })),
    toetsenbordMelding,
    podium,
    el("footer", { class: "typzone" }, el("div", { class: "typzone-rij" }, handen.links, toetsenbord.element, handen.rechts), hulpregel),
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
        hulpTekst.textContent = "";
        hulpregel.classList.add("leeg");
        return;
      }
      toetsenbord.markeer([gevonden.toets.code]);
      handen.toon([gevonden.toets.vinger]);
      hulpStip.className = `hulp-stip kleur-${kleurVanVinger(gevonden.toets.vinger)}`;
      hulpregel.classList.remove("leeg");
      hulpTekst.textContent =
        teken === " "
          ? t("hulp.spatie")
          : t("hulp.teken", { teken, vinger: t(`vinger.${gevonden.toets.vinger}` as TekstSleutel) });
    },
    toonFout(teken) {
      ctx.toonHulp(teken);
      toetsenbord.benadruk();
      handen.benadruk();
    },
    hulpAltijd: !app.voortgang.instellingen.hulpPasNaFout,
    hulpNaMs: 3000,
    blokNummer() {
      return index;
    },
    zeg(tekst) {
      laatsteTekst = tekst;
      spreek(tekst);
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
            class: i < index ? "balkje klaar" : i === index ? "balkje huidig" : "balkje",
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
    titel.textContent = t("les.kop", { nummer: les.id, titel: blok.titel });
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
    const blokTitel = les.online[blok].titel;
    titel.textContent = t("les.kop", { nummer: les.id, titel: blokTitel });
    const tekst = t("verder.vraag", { nummer: blok + 1, titel: blokTitel });
    const opnieuw = el("button", { class: "knop", type: "button", onclick: () => toonBlok(0) }, t("verder.opnieuw"));
    const verder = el(
      "button",
      { class: "knop knop-hoofd", type: "button", onclick: () => toonBlok(blok) },
      t("verder.knop", { nummer: blok + 1, titel: blokTitel }),
    );
    podium.append(
      el(
        "div",
        { class: "blok blok-verder" },
        metFienEnJef("zwaai", el("div", { class: "ballon" }, el("p", { class: "grote-tekst" }, tekst))),
        el("div", { class: "knoppen" }, verder, opnieuw),
      ),
    );
    ctx.zeg(tekst);
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
