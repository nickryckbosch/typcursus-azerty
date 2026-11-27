// Alle drempels voor de metingen per toets op een plaats, zodat ze na de
// klastest makkelijk bij te sturen zijn. De uitleg en de bronnen staan in
// docs/beslissingen.md (punt 7) en in projectdocument 12 "Metingen per toets".

export const METING = {
  /**
   * Een tijd onder deze grens telt niet mee: dat is een dubbele aanslag of
   * toevallig drukken. (Keybr gebruikt ook 40 ms.)
   */
  minTijdMs: 40,
  /**
   * Een tijd boven deze grens telt niet mee voor de tijd: het kind is dan eerder
   * afgeleid dan aan het typen. Zo'n aanslag wordt wel apart geteld als lange pauze.
   */
  maxTijdMs: 4000,
  /**
   * Zoveel pogingen (samenvattingen van een oefening) bewaren we volledig.
   * Oudere pogingen worden opgeteld per toets (aantal, fouten, verkeerde toetsen,
   * lange pauzes) en daarna weggegooid. Een poging is ongeveer 1 kB; 300 pogingen
   * blijven ruim onder de grens van localStorage (ongeveer 5 MB) en zijn goed
   * voor ongeveer 60 keer een hele les.
   */
  maxPogingen: 300,
} as const;
