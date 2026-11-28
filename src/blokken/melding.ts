// Een korte melding van de app op een vaste plek, onder het ding waarmee het
// kind bezig is ("Nog niet. Kijk op het toetsenbord.", "Andere hand!").
// De plek is er van bij het begin (onzichtbaar), zodat er niets verspringt
// als de melding verschijnt (docs/beslissingen.md, 12c).

import { el } from "../weergave/dom";

export interface Melding {
  element: HTMLElement;
  toon(tekst: string): void;
  verberg(): void;
}

export function maakMelding(): Melding {
  const element = el("p", { class: "wachtzin zacht onzichtbaar", "aria-live": "polite" }, " ");
  return {
    element,
    toon(tekst) {
      element.textContent = tekst;
      element.classList.remove("onzichtbaar");
    },
    verberg() {
      element.classList.add("onzichtbaar");
    },
  };
}

/** Telt deze toetsaanslag als een beweging van het kind? Niet: een ingehouden toets, of een toets samen met Ctrl, Alt of de zoektoets. */
export function isAanslag(e: KeyboardEvent): boolean {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return false;
  return !["Control", "Alt", "AltGraph", "Meta", "CapsLock", "Tab", "Escape", "Dead", "Unidentified"].includes(e.key);
}
