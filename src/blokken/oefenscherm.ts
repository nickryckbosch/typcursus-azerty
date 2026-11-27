// Het oefenscherm: elke stap van een les gebruikt dezelfde vaste zones.
//
//   +-----------------------------------------------+
//   |  kop (titel, teller)                          |
//   |  OPDRACHT (groot, met de toets getekend)      |   zone-opdracht
//   +-----------+-----------------------+-----------+
//   | Fien en   |  prent of spel        |  (leeg)   |   zone-figuren / zone-veld
//   | Jef       |  (lamp, huis, beek)   |           |
//   +-----------+-----------------------+-----------+
//   |  Druk op [Enter] om verder te gaan   [Verder] |   zone-voet
//   |  ______________________________   10 van 12  |   voortgang (onderrand)
//   +-----------------------------------------------+
//   (daaronder, buiten het podium: hulpregel, handen en toetsenbord)
//
// Regels (zie docs/beslissingen.md, "Rustige schermen"):
// - De zones hebben een vaste plaats en hoogte.
// - Wat later verschijnt, staat van bij het begin in de pagina en neemt zijn
//   ruimte al in. Tonen en verbergen gaat met toon()/verberg() (zichtbaarheid),
//   nooit door elementen toe te voegen of weg te halen.
// - Fien en Jef, de lamp en de prent veranderen nooit van plaats.

import { t } from "../content";
import { el } from "../weergave/dom";
import { fien, jef, type Uitdrukking } from "../weergave/figuren";
import { tekstMetToetsen } from "../weergave/tekst";
import type { BlokContext } from "./context";

export interface OefenschermOpties {
  /** kleine regel boven de opdracht, bv. de titel van het blok */
  kop?: string;
  /** Fien en Jef links in hun vaste zone; weglaten: de zone blijft leeg */
  figuren?: Uitdrukking;
  /** het veld neemt de hele breedte (voor oefenregels en de beek); er zijn dan geen figuren */
  breed?: boolean;
}

export interface Oefenscherm {
  element: HTMLElement;
  veld: HTMLElement;
  /** midden van de voetzone: hier staat "Druk op Enter", of knoppen (afsluiter) */
  voet: HTMLElement;
  zetKop(tekst: string): void;
  /** zet de opdracht (opmaak: [toets], **vet**) en lees ze voor; beelden: zie tekstMetToetsen */
  zetOpdracht(tekst: string, voorlezen?: boolean, beelden?: Record<string, () => Node>): void;
  /** dunne voortgangsbalk langs de onderrand, met rechts klein de teller ("10 van 12") */
  zetVoortgang(gedaan: number, totaal: number): void;
  /** kleine bolletjes in plaats van een balk (bv. de drie beken); huidig = 0-gebaseerd */
  zetBolletjes(huidig: number, totaal: number): void;
  zetFiguren(uitdrukking: Uitdrukking): void;
  /** toon "Druk op [Enter] om verder te gaan" met de knop Verder */
  toonEnter(actie?: () => void): void;
}

/** Maak een element onzichtbaar; het houdt zijn plaats. */
export function verberg(element: Element): void {
  element.classList.add("onzichtbaar");
}

/** Maak een element zichtbaar, met een korte overgang. */
export function toon(element: Element, zichtbaar = true): void {
  element.classList.toggle("onzichtbaar", !zichtbaar);
}

/** Een element dat later verschijnt: staat er al, maar is onzichtbaar. */
export function startVerborgen<E extends Element>(element: E): E {
  element.classList.add("zacht", "onzichtbaar");
  return element;
}

export function oefenscherm(ctx: BlokContext, opties: OefenschermOpties = {}): Oefenscherm {
  const kop = el("p", { class: "zone-kop" }, opties.kop ?? "");
  const opdracht = el("p", { class: "opdracht-tekst" });
  const figuren = el("div", { class: "zone-figuren", "aria-hidden": opties.figuren ? undefined : "true" });
  const veld = el("div", { class: "zone-veld" });
  let enterActie = () => ctx.volgende();
  const enterRij = startVerborgen(
    el(
      "div",
      { class: "enter-rij" },
      el("p", { class: "hint-enter" }, ...tekstMetToetsen(t("hint.enter"))),
      el("button", { class: "knop knop-hoofd", type: "button", tabindex: "-1", onclick: () => enterActie() }, t("knop.verder")),
    ),
  );
  // Voortgang: altijd aanwezig (dus nooit verspringen), onzichtbaar tot een blok hem gebruikt.
  const balkVulling = el("div", { class: "voortgang-vulling" });
  const balk = el("div", { class: "voortgang-balk" }, balkVulling);
  const bolletjes = el("div", { class: "voortgang-bolletjes" });
  const teller = el("span", { class: "voortgang-teller" });
  const voortgang = startVerborgen(el("div", { class: "voortgang", role: "status" }, balk, bolletjes, teller));
  const voet = el("div", { class: "zone-voet" }, el("div", { class: "voet-midden" }, enterRij), voortgang);

  const element = el(
    "div",
    { class: `oefenscherm ${opties.breed ? "breed" : ""}` },
    el("div", { class: "zone-opdracht" }, kop, opdracht),
    figuren,
    veld,
    voet,
  );
  ctx.podium.append(element);

  const scherm: Oefenscherm = {
    element,
    veld,
    voet: voet.firstElementChild as HTMLElement,
    zetKop(tekst) {
      kop.textContent = tekst;
    },
    zetOpdracht(tekst, voorlezen = true, beelden = {}) {
      opdracht.replaceChildren(...tekstMetToetsen(tekst, beelden));
      if (voorlezen) ctx.zeg(tekst);
    },
    zetVoortgang(gedaan, totaal) {
      balk.hidden = false;
      bolletjes.hidden = true;
      balkVulling.style.width = `${Math.round((100 * gedaan) / Math.max(totaal, 1))}%`;
      teller.textContent = t("teller", { nummer: gedaan, totaal });
      toon(voortgang);
    },
    zetBolletjes(huidig, totaal) {
      balk.hidden = true;
      bolletjes.hidden = false;
      bolletjes.replaceChildren(
        ...Array.from({ length: totaal }, (_, i) =>
          el("span", { class: i < huidig ? "bolletje gedaan" : i === huidig ? "bolletje huidig" : "bolletje" }),
        ),
      );
      teller.textContent = "";
      voortgang.setAttribute("aria-label", t("teller", { nummer: huidig + 1, totaal }));
      toon(voortgang);
    },
    zetFiguren(uitdrukking) {
      figuren.replaceChildren(fien(uitdrukking), jef(uitdrukking));
    },
    toonEnter(actie) {
      if (actie) enterActie = actie;
      ctx.toetsenbord.toonEnter(true);
      toon(enterRij);
      enterRij.querySelector("button")?.removeAttribute("tabindex");
    },
  };
  if (opties.figuren) scherm.zetFiguren(opties.figuren);
  return scherm;
}
