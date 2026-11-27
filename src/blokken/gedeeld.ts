// Kleine onderdelen die meerdere blokken gebruiken.
// Het gemeenschappelijke oefenscherm met de vaste zones staat in oefenscherm.ts.

/** Laat een element kort schudden (of een stippelrand tonen bij "minder beweging", via CSS). */
export function schud(element: Element): void {
  element.classList.remove("schud");
  void (element as HTMLElement).offsetWidth;
  element.classList.add("schud");
  setTimeout(() => element.classList.remove("schud"), 400);
}
