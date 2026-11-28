// De oefenkaart: elk oefenscherm gebruikt dezelfde vaste zones in de witte kaart.
//
//   +-----------------------------------------------+
//   |  OPDRACHT (groot, met de toets getekend)      |   zone-opdracht
//   +-----------+-----------------------+-----------+
//   | Fien en   |  prent, spel of       | [Verder   |   zone-figuren / zone-veld / zone-voet
//   | Jef       |  signaal (lamp, huis) |  Enter]   |   (rechts, boven de Enter-toets)
//   +-----------+-----------------------+-----------+
//   |  ______________________________   10 van 12  |   voortgang (onderrand)
//   +-----------------------------------------------+
//   (onder de kaart: de handen, het toetsenbord en de hulpregel)
//
// Regels (docs/stijlgids.md, deel 1 en 6; docs/beslissingen.md, 12c):
// - De zones hebben een vaste plaats en hoogte.
// - Wat later verschijnt, staat van bij het begin in de pagina en neemt zijn
//   ruimte al in. Tonen en verbergen gaat met toon() (zichtbaarheid), nooit
//   door elementen toe te voegen of weg te halen.
// - Fien en Jef, de lamp en de prent veranderen nooit van plaats.
// - De opdracht is het duidelijkste element van de kaart.
//
// Opbouw "midden" (K27, rust en overzicht; docs/stijlgids.md, deel 10): voor een
// scherm waar Fien en Jef iets zeggen en het kind alleen verder moet (de intro,
// het einde van extra oefenen). Alles staat als een groep in het midden, niets
// aan de randen van de kaart:
//
//   +-----------------------------------------------+
//   |        Fien en Jef  ( tekstballon )  prent    |   zone-groep
//   |                 [ Verder  Enter ]             |   zone-voet
//   +-----------------------------------------------+
//
// Een manier om verder te gaan: de knop Verder, met de Enter-toets erin
// getekend. De losse zin "Druk op Enter om verder te gaan" is weg (K27).
//
// Opbouw "toren" (K27 fase 2; docs/beslissingen.md, 12p): voor een slotscherm.
// Fien en Jef staan groot in het midden, hun zin in een tekstballon erboven,
// de knoppen even breed eronder. Gebruik slotscherm() hieronder.
//
//   +-----------------------------------------------+
//   |              ( tekstballon )                  |
//   |               Fien en Jef                     |   zone-groep
//   |          [ knop ]  [ knop ]  [ knop ]         |   zone-voet
//   +-----------------------------------------------+
//
// Opbouw "kolom": de opdracht bovenaan, een vak in het midden en de knop
// Verder eronder, zonder zijzones (de toetsenbordcheck). De rijen hebben een
// vaste maat, zoals bij de zones.

import { t } from "../content";
import { el } from "../weergave/dom";
import { fien, jef, type Uitdrukking } from "../weergave/figuren";
import { tekstMetToetsen } from "../weergave/tekst";
import type { BlokContext } from "./context";

/** Maak een element zichtbaar of onzichtbaar; het houdt altijd zijn plaats. */
export function toon(element: Element, zichtbaar = true): void {
  element.classList.toggle("onzichtbaar", !zichtbaar);
}

/** Een element dat later verschijnt: het staat er al, maar is nog onzichtbaar. */
export function startVerborgen<E extends Element>(element: E): E {
  element.classList.add("zacht", "onzichtbaar");
  return element;
}

export interface Voortgangsbalk {
  element: HTMLElement;
  /** dunne balk met rechts klein de teller ("10 van 12") */
  zetBalk(gedaan: number, totaal: number): void;
  /** kleine bolletjes in plaats van een balk (bv. de drie beken); huidig telt vanaf 0 */
  zetBolletjes(huidig: number, totaal: number): void;
}

/**
 * De voortgang van een oefening (K20): dun en rustig, langs de onderrand van
 * de witte kaart. Altijd aanwezig, dus hij verspringt nooit; onzichtbaar tot
 * een blok hem gebruikt.
 */
export function maakVoortgang(): Voortgangsbalk {
  const vulling = el("div", { class: "voortgang-vulling" });
  const balk = el("div", { class: "voortgang-balk" }, vulling);
  const bolletjes = el("div", { class: "voortgang-bolletjes", hidden: true });
  const teller = el("span", { class: "voortgang-teller" });
  const element = el("div", { class: "voortgang onzichtbaar", role: "status" }, balk, bolletjes, teller);
  return {
    element,
    zetBalk(gedaan, totaal) {
      balk.hidden = false;
      bolletjes.hidden = true;
      // De balk toont wat af is; de teller toont waar het kind nu is ("3 van 20").
      vulling.style.width = `${Math.round((100 * gedaan) / Math.max(totaal, 1))}%`;
      teller.textContent = t("teller", { nummer: Math.min(gedaan + 1, totaal), totaal });
      toon(element);
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
      element.setAttribute("aria-label", t("teller", { nummer: Math.min(huidig + 1, totaal), totaal }));
      toon(element);
    },
  };
}

export interface OefenschermOpties {
  /** Fien en Jef links in hun vaste zone; weglaten: de zone blijft leeg */
  figuren?: Uitdrukking;
  /** extra klasse op de kaart, voor eigen opmaak van een blok */
  klasse?: string;
  /**
   * De doelzin van een spel (K26), in een tekstballon boven Fien en Jef. Hij
   * blijft het hele spel staan: het kind kan altijd teruglezen waar het naartoe werkt.
   */
  doel?: string;
  /**
   * "midden" (K27): Fien en Jef, hun tekstballon en de prent staan als een groep
   * in het midden, met de knoppen eronder. Voor schermen zonder typopdracht.
   * "toren": een slotscherm, de tekstballon boven Fien en Jef (zie slotscherm()).
   * "kolom": opdracht, een vak in het midden en de knop eronder, zonder zijzones.
   */
  opbouw?: "zones" | "midden" | "toren" | "kolom";
  /** hoe hoog Fien en Jef hoogstens zijn (in px van het ontwerp); weglaten: de standaardmaat */
  figuurHoogte?: number;
}

export interface Oefenscherm {
  element: HTMLElement;
  veld: HTMLElement;
  /** de zone met de knop Verder, of de knoppen van de afsluiter (rechts; bij opbouw "midden" onder de groep) */
  voet: HTMLElement;
  voortgang: Voortgangsbalk;
  /** zet de opdracht (opmaak: [toets], **vet**) en lees ze voor; beelden: zie tekstMetToetsen */
  zetOpdracht(tekst: string, voorlezen?: boolean, beelden?: Record<string, () => Node>): void;
  /** een andere houding van Fien en Jef, op dezelfde plaats */
  zetFiguren(uitdrukking: Uitdrukking): void;
  /**
   * Een andere zin in de tekstballon van de doelzin (bv. de slotzin van een
   * spel). De ballon houdt minstens zijn hoogte, zodat er niets verspringt.
   */
  zetDoel(tekst: string): void;
  /** verberg de opdracht bovenaan (haar plaats blijft), bv. op het einde van een spel */
  verbergOpdracht(): void;
  /**
   * Toon de knop Verder, met de Enter-toets erin getekend; Enter doet hetzelfde.
   * Met "start": de knop Start (K28: eerst lezen, dan starten).
   */
  toonEnter(actie?: () => void, soort?: "verder" | "start"): void;
  /** verberg de knop weer (zijn plaats blijft) */
  verbergEnter(): void;
  /**
   * De knop Verder of Start (met zijn vaste plek). Hij staat in de voet. Een
   * blok mag hem bij zijn signaal zetten, bv. onder de lamp (K27: wat bij elkaar
   * hoort, staat bij elkaar). Doe dat bij de opbouw, nooit tijdens de oefening.
   */
  enter: HTMLElement;
}

export function oefenscherm(ctx: BlokContext, opties: OefenschermOpties = {}): Oefenscherm {
  const opdracht = el("p", { class: "opdracht-tekst" });
  // Met een doelzin: de tekstballon bovenaan, Fien en Jef eronder (zelfde opbouw
  // als de tip naast de oefenregels). Zonder doelzin staan de figuren alleen.
  const figurenRij = el("div", { class: opties.doel ? "figuren-rij" : "zone-figuren" });
  const doelBallon = opties.doel ? el("p", { class: "ballon staart-onder doel-ballon" }, opties.doel) : null;
  const figuren = doelBallon ? el("div", { class: "zone-figuren met-doel" }, doelBallon, figurenRij) : figurenRij;
  const veld = el("div", { class: "zone-veld" });
  let enterActie = () => ctx.volgende();
  // Een manier om verder te gaan (K27): een knop, met de Enter-toets erin
  // getekend. Geen losse zin "Druk op Enter" meer. De knop heet Verder of Start.
  const enterLabel = el("span", {}, t("knop.verder"));
  const enterKnop = el(
    "button",
    { class: "knop knop-hoofd knop-verder", type: "button", tabindex: "-1", onclick: () => enterActie() },
    enterLabel,
    el("span", { class: "toets-in-tekst", "aria-hidden": "true" }, t("toets.enter")),
  );
  function zetEnterTekst(soort: "verder" | "start"): void {
    enterLabel.textContent = t(soort === "start" ? "knop.start" : "knop.verder");
  }
  const enterRij = startVerborgen(el("div", { class: "enter-rij" }, enterKnop));
  const voet = el("div", { class: "zone-voet" }, enterRij);
  const voortgang = maakVoortgang();

  const opbouw = opties.opbouw ?? "zones";
  const opbouwKlasse = {
    zones: "",
    midden: "oefenkaart-midden",
    toren: "oefenkaart-midden oefenkaart-toren",
    kolom: "oefenkaart-kolom",
  }[opbouw];
  const inhoud =
    opbouw === "midden"
      ? [el("div", { class: "zone-groep" }, figuren, veld)]
      : opbouw === "toren"
        ? [el("div", { class: "zone-groep" }, veld, figuren)]
        : opbouw === "kolom"
          ? [veld]
          : [figuren, veld];
  const element = el(
    "section",
    { class: `blok oefenkaart ${opbouwKlasse} ${opties.klasse ?? ""}` },
    el("div", { class: "zone-opdracht" }, opdracht),
    ...inhoud,
    voet,
    voortgang.element,
  );
  ctx.podium.append(element);

  const scherm: Oefenscherm = {
    element,
    veld,
    voet,
    enter: enterRij,
    voortgang,
    zetOpdracht(tekst, voorlezen = true, beelden = {}) {
      opdracht.replaceChildren(...tekstMetToetsen(tekst, beelden));
      if (voorlezen) ctx.zeg(tekst);
    },
    zetFiguren(uitdrukking) {
      figurenRij.replaceChildren(fien(uitdrukking, opties.figuurHoogte), jef(uitdrukking, opties.figuurHoogte));
    },
    zetDoel(tekst) {
      if (!doelBallon) return;
      doelBallon.style.minHeight = `${doelBallon.offsetHeight}px`;
      doelBallon.textContent = tekst;
    },
    verbergOpdracht() {
      toon(opdracht, false);
    },
    toonEnter(actie, soort = "verder") {
      if (actie) enterActie = actie;
      zetEnterTekst(soort);
      ctx.toetsenbord.toonEnter(true);
      toon(enterRij);
      enterKnop.removeAttribute("tabindex");
    },
    verbergEnter() {
      ctx.toetsenbord.toonEnter(false);
      toon(enterRij, false);
      enterKnop.setAttribute("tabindex", "-1");
    },
  };
  if (opties.figuren) scherm.zetFiguren(opties.figuren);
  return scherm;
}

export interface SlotKnop {
  tekst: string;
  actie: () => void;
}

export interface SlotschermOpties {
  /** de houding van Fien en Jef */
  figuren: Uitdrukking;
  /** wat Fien en Jef zeggen, in de tekstballon boven hen */
  zin: string;
  /** de eerste knop is de hoofdknop (vol blauw): die kiest Enter */
  knoppen: SlotKnop[];
  /** iets boven de tekstballon, bv. de sterren */
  boven?: Node[];
  klasse?: string;
}

/**
 * Een slotscherm (K27 fase 2; docs/stijlgids.md, deel 10): het einde van een
 * les, het einde van extra oefenen, de vraag "wil je verdergaan?". Fien en Jef
 * staan groot in het midden, hun zin in een tekstballon erboven, de knoppen
 * even breed eronder. Er valt niets te typen: het toetsenbord is weg en de
 * kaart vult het scherm.
 */
export function slotscherm(ctx: BlokContext, opties: SlotschermOpties): Oefenscherm {
  ctx.toonToetsenbord(false);
  const scherm = oefenscherm(ctx, {
    figuren: opties.figuren,
    opbouw: "toren",
    klasse: `blok-slot ${opties.klasse ?? ""}`,
    figuurHoogte: 250,
  });
  scherm.veld.append(
    ...(opties.boven ?? []),
    el("div", { class: "ballon staart-onder" }, el("p", { class: "grote-tekst" }, opties.zin)),
  );
  ctx.zeg(opties.zin);
  const knoppen = opties.knoppen.map((k, i) =>
    el("button", { class: i === 0 ? "knop knop-hoofd" : "knop knop-tweede", type: "button", onclick: k.actie }, k.tekst),
  );
  scherm.voet.replaceChildren(el("div", { class: "knoppen even-breed" }, ...knoppen));
  // Met Enter kies je de eerste knop; met Tab ga je naar de andere.
  knoppen[0]?.focus();
  return scherm;
}
