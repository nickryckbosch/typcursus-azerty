// Startpunt van de app.
//
// Typcursus AZERTY - gratis typcursus op Belgisch AZERTY.
// (c) 2026 Nick Ryckbosch. Alle rechten voorbehouden (zie LICENSE).

import "./stijl.css";
import { App } from "./app";
import { volgSchaal } from "./weergave/schaal";

const wortel = document.getElementById("app");
if (wortel) {
  // Op een scherm dat groter is dan een Chromebook schaalt alles mee als een dia.
  volgSchaal();
  new App(wortel).naarStart();
}
