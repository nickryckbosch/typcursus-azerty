// Schalen als een dia: zet de schaal op de pagina en volgt de maat van het
// venster. De regels staan in src/logica/schaal.ts, de stijl in src/stijl.css
// ("Schalen als een dia").
//
// Techniek: de app (#app) krijgt de vaste maat van het ontwerp (1366 x 768) en
// wordt met een CSS-transform vergroot en in het midden gezet. De indeling
// wordt dus altijd op de ontwerpmaat berekend: op een groot scherm staat alles
// exact zoals op 1366 x 768, alleen groter. Klikken, focus en het toetsenbord
// merken niets van een transform.

import { schaalVoor } from "../logica/schaal";

export function volgSchaal(venster: Window = window): void {
  const html = venster.document.documentElement;
  const werkBij = () => {
    const s = schaalVoor(venster.innerWidth, venster.innerHeight);
    html.classList.toggle("als-dia", s > 1);
    html.style.setProperty("--schaal", String(s));
  };
  venster.addEventListener("resize", werkBij);
  werkBij();
}
