// Het spelsjabloon (K22): elk spel in een les gebruikt dezelfde vaste indeling.
//
//   +-----------------------------------------------+
//   |  OPDRACHT ("Typ wat je ziet.")                |   zone-opdracht
//   +-----------+-----------------------+-----------+
//   | (doelzin  |   f j   f j   j f     |           |   spel-ballon / spel-veld
//   |  in een   |   de regel of het     |           |   (op het einde: de knop Verder
//   |  ballon)  |   woord, groot        |           |    op de plaats van de regel)
//   +-----------+-----------------------+-----------+
//   |  de strook: de prent van het spel, die ook    |   spel-strook
//   |  toont hoe ver je bent                        |
//   +-----------------------------------------------+
//
// Regels (docs/stijlgids.md, deel 11; docs/beslissingen.md, 12l):
// - Wat het kind typt, staat altijd op dezelfde plek, in het midden, en in
//   dezelfde vorm als bij de oefenregels: getypte letters grijs, de volgende
//   letter in de lichte vingerkleur met een streep in de volle kleur. Nooit op
//   een steen, een bal of een vlaggetje.
// - De strook onderaan is de prent van het spel en toont de vooruitgang. Er is
//   geen aparte teller: de strook zegt het zelf.
// - De doelzin (K26) staat het hele spel in een tekstballon, links, boven Fien
//   en Jef in de strook.
// - Bij een fout krijgt de letter een stippelrand; de juiste toets en vinger
//   lichten op. Er schudt niets.
// - Er beweegt niets tijdens het typen. Alleen op het einde verandert de strook
//   (het resultaat) en komt de slotzin op de plaats van de opdracht.
//
// Een nieuw spel is dus: een strook (zie beek-strook.ts als voorbeeld), een
// lijst met wat het kind typt, en een slotzin.

import { t } from "../content";
import type { BlokContext } from "../blokken/context";
import { startVerborgen, toon } from "../blokken/oefenscherm";
import { kleurVanVinger, toetsVoorTeken } from "../logica/indeling";
import type { TypOefening } from "../logica/typen";
import { el } from "../weergave/dom";

export interface SpelschermOpties {
  /** wat het kind doet, een korte zin (K26) */
  opdracht: string;
  /** waar het kind naartoe werkt (K26); blijft het hele spel staan */
  doel: string;
  /** de strook van dit spel: een prent die ook de vooruitgang toont */
  strook: Element;
  /** extra klasse op de kaart, voor eigen opmaak van een spel */
  klasse?: string;
}

export interface Spelscherm {
  element: HTMLElement;
  /** toon de regel of het woord dat het kind typt, met de letter die aan de beurt is */
  toonRegel(oefening: TypOefening): void;
  /** na een foute toets: de letter die aan de beurt is, krijgt een stippelrand */
  toonFout(): void;
  /**
   * Het slot: de slotzin komt op de plaats van de opdracht, de knop Verder op
   * de plaats van de regel. De doelzin verdwijnt (zijn plaats blijft).
   */
  toonSlot(zin: string, verder: () => void): void;
}

function cursorKlasse(teken: string): string {
  const gevonden = toetsVoorTeken(teken);
  return gevonden ? `cursor kleur-${kleurVanVinger(gevonden.toets.vinger)}` : "cursor";
}

export function spelscherm(ctx: BlokContext, opties: SpelschermOpties): Spelscherm {
  const opdracht = el("p", { class: "opdracht-tekst" }, opties.opdracht);
  const ballon = el("p", { class: "ballon staart-onder spel-doel" }, opties.doel);
  const regel = el("div", { class: "typregel spel-regel", "aria-hidden": "true" });
  // voor wie een schermlezer gebruikt: de regel als gewone tekst
  const voorlezer = el("p", { class: "verborgen" });

  // De knop Verder staat er van bij het begin, onzichtbaar, op de plaats van de
  // regel (K20: wat later verschijnt, heeft zijn plaats al).
  let verderActie: () => void = () => {};
  const knop = el(
    "button",
    { class: "knop knop-hoofd knop-verder", type: "button", tabindex: "-1", onclick: () => verderActie() },
    el("span", {}, t("knop.verder")),
    el("span", { class: "toets-in-tekst", "aria-hidden": "true" }, t("toets.enter")),
  );
  const slot = startVerborgen(el("div", { class: "enter-rij spel-slot" }, knop));

  const element = el(
    "section",
    { class: `blok kaart spelkaart ${opties.klasse ?? ""}` },
    el("div", { class: "zone-opdracht" }, opdracht),
    el("div", { class: "spel-ballon" }, ballon),
    el("div", { class: "spel-veld stapel" }, regel, slot, voorlezer),
    el("div", { class: "spel-strook" }, opties.strook),
  );
  ctx.podium.append(element);
  ctx.zeg(`${opties.doel} ${opties.opdracht}`);

  return {
    element,
    toonRegel(oefening) {
      regel.replaceChildren(
        ...[...oefening.doel].map((teken, i) =>
          el(
            "span",
            {
              class: ["teken", teken === " " ? "is-spatie" : "", i < oefening.positie ? "gedaan" : "", i === oefening.positie ? cursorKlasse(teken) : ""]
                .filter(Boolean)
                .join(" "),
            },
            teken === " " ? " " : teken,
          ),
        ),
      );
      voorlezer.textContent = oefening.doel;
    },
    toonFout() {
      regel.querySelector(".cursor")?.classList.add("fout");
    },
    toonSlot(zin, verder) {
      verderActie = verder;
      opdracht.textContent = zin;
      toon(ballon, false);
      toon(regel, false);
      toon(slot);
      knop.removeAttribute("tabindex");
      ctx.toetsenbord.toonEnter(true);
      ctx.zeg(zin);
    },
  };
}
