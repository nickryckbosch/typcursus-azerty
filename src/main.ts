// Startpunt van de app.
//
// Typcursus AZERTY - gratis typcursus op Belgisch AZERTY.
// (c) 2026 Nick Ryckbosch. Alle rechten voorbehouden (zie LICENSE).

import "./stijl.css";
import { App } from "./app";

const wortel = document.getElementById("app");
if (wortel) new App(wortel).naarStart();
