// De app: houdt de voortgang bij, wisselt tussen schermen en verdeelt de
// toetsaanslagen. Er is altijd precies een scherm actief.

import { LESSEN, t } from "./content";
import type { Les } from "./content/types";
import { bewaarVoortgang, leesVoortgang } from "./logica/opslag";
import { verraadtVerkeerdeIndeling } from "./logica/toetsenbordcheck";
import { teltAlsTeken } from "./logica/typen";
import type { Voortgang } from "./logica/voortgang";
import { el } from "./weergave/dom";
import { stopVoorlezen, zetVoorlezen } from "./weergave/spraak";
import { startScherm } from "./schermen/start";
import { lesScherm } from "./schermen/les";
import { oefenbordScherm } from "./schermen/oefenbord";
import { leerkrachtScherm } from "./schermen/leerkracht";

export interface Scherm {
  opToets?(e: KeyboardEvent): void;
  opruimen?(): void;
}

type SchermNaam = "start" | "les" | "oefenbord" | "leerkracht";

export class App {
  voortgang: Voortgang = leesVoortgang();
  readonly lessen: Les[] = LESSEN;

  private readonly inhoud: HTMLElement;
  private readonly hoofdletterMelding: HTMLElement;
  private scherm: Scherm | null = null;
  private schermNaam: SchermNaam = "start";

  constructor(wortel: HTMLElement) {
    this.hoofdletterMelding = el("div", { class: "melding melding-hoofdletters", role: "alert", hidden: true }, t("melding.hoofdletters"));
    this.inhoud = el("div", { class: "inhoud" });
    wortel.replaceChildren(this.hoofdletterMelding, this.inhoud);
    zetVoorlezen(this.voortgang.instellingen.voorlezen);
    window.addEventListener("keydown", (e) => this.opToets(e));
    window.addEventListener("keyup", (e) => this.werkHoofdlettersBij(e));
  }

  bewaar(): void {
    bewaarVoortgang(this.voortgang);
  }

  zetVoorlezen(aan: boolean): void {
    this.voortgang.instellingen.voorlezen = aan;
    zetVoorlezen(aan);
    this.bewaar();
  }

  naarStart(): void {
    this.toon("start", (w) => startScherm(this, w));
  }

  /** Open een les. Zonder blok: verdergaan waar het kind gestopt is (de les vraagt het eerst). */
  naarLes(les: Les, blok?: number): void {
    this.toon("les", (w) => lesScherm(this, les, w, { startBlok: blok }));
  }

  /** Extra oefenen bij een les (K15): 4 nieuwe oefenregels, telt niet mee voor de voortgang. */
  naarExtra(les: Les): void {
    this.toon("les", (w) => lesScherm(this, les, w, { extra: true }));
  }

  naarOefenbord(): void {
    this.toon("oefenbord", (w) => oefenbordScherm(this, w));
  }

  naarLeerkracht(): void {
    this.toon("leerkracht", (w) => leerkrachtScherm(this, w));
  }

  private toon(naam: SchermNaam, maak: (wortel: HTMLElement) => Scherm): void {
    this.scherm?.opruimen?.();
    stopVoorlezen();
    this.inhoud.replaceChildren();
    this.schermNaam = naam;
    this.scherm = maak(this.inhoud);
    window.scrollTo(0, 0);
    // Schaalt het scherm als een dia, dan scrolt een lang scherm binnen de dia.
    this.inhoud.parentElement?.scrollTo?.(0, 0);
  }

  private werkHoofdlettersBij(e: KeyboardEvent): void {
    // Een knop reageert op de spatie bij het loslaten: ook dan niet op een slotscherm.
    if (e.type === "keyup" && e.key === " " && document.activeElement?.closest?.(".blok-slot")) e.preventDefault();
    const aan = e.getModifierState?.("CapsLock") ?? false;
    this.hoofdletterMelding.hidden = !aan || this.schermNaam === "start" || this.schermNaam === "leerkracht";
  }

  private opToets(e: KeyboardEvent): void {
    this.werkHoofdlettersBij(e);

    // Verborgen ingang voor de leerkracht.
    if (e.ctrlKey && e.shiftKey && e.code === "KeyL") {
      e.preventDefault();
      this.naarLeerkracht();
      return;
    }
    if (e.key === "Escape" && this.schermNaam !== "start") {
      e.preventDefault();
      this.naarStart();
      return;
    }

    // Een knop of invoerveld met focus: laat de browser zijn werk doen.
    const actief = document.activeElement;
    if (actief instanceof HTMLInputElement || actief instanceof HTMLTextAreaElement || actief instanceof HTMLSelectElement) return;
    if (actief instanceof HTMLButtonElement && (e.key === "Enter" || e.key === " ")) {
      // Op een slotscherm (einde van een les, "Je was al bezig") kiest alleen
      // een bewuste Enter de hoofdknop. Een spatie die het kind nog typte na de
      // laatste letter, of een ingehouden Enter, mag het scherm niet overslaan
      // (test van 28 november 2026: de sterren waren weg voor je ze zag).
      if (actief.closest(".blok-slot") && (e.key === " " || e.repeat)) {
        e.preventDefault();
        return;
      }
      // Uitzondering tijdens het typen: een knop in de bovenbalk (bv. "Voorlezen",
      // aangeklikt met de muis) mag geen spatie of Enter opslokken. Een spatie is
      // dan een getypt teken; een Enter ook, tenzij het kind bewust met Tab naar
      // die knop ging.
      const typscherm = this.schermNaam === "les" || this.schermNaam === "oefenbord";
      const kopKnop = actief.closest(".kop") !== null;
      const bewustGekozen = e.key === "Enter" && actief.matches(":focus-visible");
      if (!typscherm || !kopKnop || bewustGekozen) return;
      actief.blur();
    }

    if (verraadtVerkeerdeIndeling(e.code, e.key) && this.voortgang.toetsenbord !== "fout") {
      this.voortgang.toetsenbord = "fout";
      this.bewaar();
    }

    // Tijdens het typen: geen scrollen bij spatie, geen snelzoeken van Chrome.
    if ((this.schermNaam === "les" || this.schermNaam === "oefenbord") && (teltAlsTeken(e) || e.key === "Enter")) {
      e.preventDefault();
    }
    this.scherm?.opToets?.(e);
  }
}
