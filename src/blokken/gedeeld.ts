// Kleine onderdelen die meerdere blokken gebruiken.
// Het gemeenschappelijke oefenscherm met de vaste zones staat in oefenscherm.ts.

/** Laat een element kort schudden (of een stippelrand tonen bij "minder beweging", via CSS). */
export function schud(element: Element): void {
  element.classList.remove("schud");
  void (element as HTMLElement).offsetWidth;
  element.classList.add("schud");
  setTimeout(() => element.classList.remove("schud"), 400);
}

/**
 * Toon dat er een nieuwe kaart is, ook als de letter dezelfde is als de vorige
 * (anders lijkt het alsof de toets niet telde). Alleen visueel: de invoer wordt
 * nooit tegengehouden.
 */
export function nieuweKaart(element: Element): void {
  element.classList.remove("nieuw");
  void (element as HTMLElement).offsetWidth;
  element.classList.add("nieuw");
}
