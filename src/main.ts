// Startpunt van de app.
//
// Typcursus AZERTY - gratis, open source typcursus op Belgisch AZERTY.
// Licentie: AGPL-3.0 (zie LICENSE).

import "./stijl.css";
import { App } from "./app";

const wortel = document.getElementById("app");
if (wortel) new App(wortel).naarStart();
