// @vitest-environment jsdom
//
// Regel: een aanslag gaat nooit verloren. De volgende letter is geldig vanaf
// het moment dat de vorige juist getypt is; overgangen zijn alleen visueel.
// Deze tests sturen juiste toetsen telkens 30 ms na elkaar en kijken na dat
// elke aanslag telt, in elk bloktype waar getypt wordt.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSEN } from "../src/content";
import type { Blok, Les, ReeksBlok, SpelBlok, ZoekToetsBlok } from "../src/content/types";
import type { BlokContext, BlokInstantie } from "../src/blokken/context";
import { zoekToets } from "../src/blokken/zoektoets";
import { reeks } from "../src/blokken/reeks";
import { beek } from "../src/spellen/beek";
import { lichtAan } from "../src/spellen/lichtaan";
import { nieuweVoortgang } from "../src/logica/voortgang";
import { toetsVoorTeken } from "../src/logica/indeling";
import type { TypOefening } from "../src/logica/typen";

const TUSSENTIJD = 30;

function maakContext(les: Les) {
  const podium = document.createElement("main");
  document.body.replaceChildren(podium);
  const regels: TypOefening[] = [];
  const rijen: (string | null)[] = [];
  let volgende = 0;
  const ctx: BlokContext = {
    app: { voortgang: nieuweVoortgang(), bewaar() {}, lessen: LESSEN } as unknown as BlokContext["app"],
    les,
    podium,
    toetsenbord: { element: document.createElement("div"), markeer() {}, flits() {}, lichtRijOp() {}, toonEnter() {}, benadruk() {}, toonRij: (r: string | null) => void rijen.push(r) } as unknown as BlokContext["toetsenbord"],
    handen: { toon() {}, benadruk() {} } as unknown as BlokContext["handen"],
    toonHulp() {},
    toonFout() {},
    hulpAltijd: true,
    hulpNaMs: 3000,
    extra: false,
    blokNummer: () => 0,
    zeg() {},
    volgende: () => void volgende++,
    gaNaar() {},
    indexVan: () => 0,
    bewaarPoging: (r) => {
      regels.push(...r);
      return 1;
    },
    toonToetsenbord() {},
    later: (fn, ms) => void setTimeout(fn, ms),
    sessie: {},
  };
  return { ctx, aanslagen: () => regels.flatMap((r) => r.aanslagen), aantalVolgende: () => volgende, laatsteRij: () => rijen[rijen.length - 1] ?? null };
}

function druk(blok: BlokInstantie, teken: string): void {
  const code = toetsVoorTeken(teken)?.toets.code ?? "";
  blok.opToets?.({ key: teken, code, repeat: false, ctrlKey: false, altKey: false, metaKey: false } as KeyboardEvent);
  vi.advanceTimersByTime(TUSSENTIJD);
}

/** Het teken op de kaart: een letter, of de getekende spatiebalk. */
function kaartTeken(podium: HTMLElement): string {
  const balk = podium.querySelector(".spatiebalk-tekening") as HTMLElement | null;
  if (balk && !balk.hidden) return " ";
  return podium.querySelector(".grote-toets span")!.textContent!;
}

function vind<T extends Blok>(les: Les, test: (b: Blok) => boolean): T {
  return les.online.find(test) as T;
}

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom heeft geen matchMedia en geen requestAnimationFrame-garantie
  window.requestAnimationFrame ??= ((fn: FrameRequestCallback) => setTimeout(() => fn(0), 0)) as typeof requestAnimationFrame;
});
afterEach(() => vi.useRealTimers());

describe("snel typen: geen enkele aanslag gaat verloren", () => {
  it("zoek de toets: elke letter 30 ms na de vorige", () => {
    const les = LESSEN[1];
    const blok = vind<ZoekToetsBlok>(les, (b) => b.type === "zoek-toets");
    const { ctx, aanslagen, aantalVolgende } = maakContext(les);
    const inst = zoekToets(blok, ctx);
    for (let i = 0; i < blok.aantal; i++) {
      druk(inst, kaartTeken(ctx.podium));
    }
    expect(aanslagen()).toHaveLength(blok.aantal);
    expect(aanslagen().every((a) => a.juist)).toBe(true);
    expect(aantalVolgende()).toBe(1);
  });

  it("twee juiste toetsen 30 ms na elkaar tellen allebei", () => {
    const les = LESSEN[1];
    const blok: ZoekToetsBlok = { ...vind<ZoekToetsBlok>(les, (b) => b.type === "zoek-toets"), aantal: 2 };
    const { ctx, aanslagen } = maakContext(les);
    const inst = zoekToets(blok, ctx);
    druk(inst, kaartTeken(ctx.podium));
    druk(inst, kaartTeken(ctx.podium));
    expect(aanslagen().map((a) => a.juist)).toEqual([true, true]);
  });

  it("oefenregels: ook over de grens tussen twee regels", () => {
    const les = LESSEN[1];
    const blok = vind<ReeksBlok>(les, (b) => b.type === "reeks");
    const { ctx, aanslagen, aantalVolgende } = maakContext(les);
    const inst = reeks(blok, ctx);
    for (const regel of blok.regels) for (const teken of regel) druk(inst, teken);
    const aantalTekens = blok.regels.join("").length;
    expect(aanslagen()).toHaveLength(aantalTekens);
    expect(aanslagen().every((a) => a.juist)).toBe(true);
    expect(aantalVolgende()).toBe(1);
  });

  it("over de beek: ook meteen na het einde van een regel", () => {
    const les = LESSEN[1];
    const blok = vind<SpelBlok>(les, (b) => b.type === "spel" && b.spel === "beek");
    const { ctx, aanslagen, aantalVolgende } = maakContext(les);
    const inst = beek(blok, ctx);
    for (let i = 0; i < 36; i++) {
      // de letter die aan de beurt is, staat in het midden (spelsjabloon, K22)
      const teken = ctx.podium.querySelector(".spel-regel .cursor")!.textContent!;
      druk(inst, teken === "\u00A0" ? " " : teken);
      // elke goede toets legt een steen in de strook
      if (i < 35) expect(ctx.podium.querySelectorAll(".beek-steen")).toHaveLength(i + 1);
    }
    expect(aanslagen()).toHaveLength(36);
    expect(aanslagen().every((a) => a.juist)).toBe(true);
    // het slot: alle stenen liggen er, de slotzin staat in een tekstballon boven Fien en Jef
    // (de opdracht verdwijnt, haar plaats blijft), de knop Verder verschijnt
    expect(ctx.podium.querySelectorAll(".beek-steen")).toHaveLength(36);
    expect(ctx.podium.querySelector(".spel-slotzin")!.textContent).toBe("Het is je gelukt! We zijn thuis.");
    expect(ctx.podium.querySelector(".spel-slotzin")!.classList.contains("onzichtbaar")).toBe(false);
    expect(ctx.podium.querySelector(".opdracht-tekst")!.classList.contains("onzichtbaar")).toBe(true);
    expect(ctx.podium.querySelector(".spel-slot")!.classList.contains("onzichtbaar")).toBe(false);
    druk(inst, "Enter");
    expect(aantalVolgende()).toBe(1);
  });

  it("over de beek: een foute toets legt geen steen en geeft de letter een stippelrand", () => {
    const les = LESSEN[1];
    const blok = vind<SpelBlok>(les, (b) => b.type === "spel" && b.spel === "beek");
    const { ctx } = maakContext(les);
    const inst = beek(blok, ctx);
    druk(inst, "k");
    expect(ctx.podium.querySelectorAll(".beek-steen")).toHaveLength(0);
    expect(ctx.podium.querySelector(".spel-regel .cursor")!.classList.contains("fout")).toBe(true);
    // na de juiste toets is de rand weg en ligt er een steen
    druk(inst, ctx.podium.querySelector(".spel-regel .cursor")!.textContent!);
    expect(ctx.podium.querySelectorAll(".beek-steen")).toHaveLength(1);
    expect(ctx.podium.querySelector(".spel-regel .fout")).toBeNull();
  });

  it("licht aan in het huis: negen juiste rijen 30 ms na elkaar", () => {
    const les = LESSEN[0];
    const blok = vind<SpelBlok>(les, (b) => b.type === "spel" && b.spel === "licht-aan");
    const { ctx } = maakContext(les);
    const inst = lichtAan(blok, ctx);
    const toetsVoorRij: Record<string, string> = { zolder: "e", woonkamer: "f", kelder: "c" };
    for (let i = 0; i < 9; i++) {
      const opdracht = ctx.podium.querySelector(".opdracht-tekst")!.textContent!;
      const rij = Object.keys(toetsVoorRij).find((r) => opdracht.includes(r))!;
      druk(inst, toetsVoorRij[rij]);
    }
    expect(ctx.podium.querySelectorAll(".raam.aan").length).toBe(9);
    expect(ctx.podium.querySelector(".enter-rij")!.classList.contains("onzichtbaar")).toBe(false);
  });

  it("te vroeg drukken bij de lamp: geen fout, wel de zin \"Wacht op de lamp.\"", () => {
    const les = LESSEN[0];
    const blok = vind<ZoekToetsBlok>(les, (b) => b.type === "zoek-toets");
    const { ctx, aanslagen } = maakContext(les);
    const inst = zoekToets(blok, ctx);
    const zin = ctx.podium.querySelector(".wachtzin")!;
    expect(zin.classList.contains("onzichtbaar")).toBe(true);
    druk(inst, "Enter"); // eerst lezen, dan starten (K28)
    druk(inst, " "); // de lamp is nog uit
    expect(zin.classList.contains("onzichtbaar")).toBe(false);
    expect(zin.textContent).toBe("Wacht op de lamp.");
    vi.advanceTimersByTime(2000); // de lamp gaat aan (na Start bijna twee seconden)
    expect(zin.classList.contains("onzichtbaar")).toBe(true);
    for (let i = 0; i < blok.aantal; i++) {
      druk(inst, " ");
      vi.advanceTimersByTime(1600);
    }
    expect(aanslagen()).toHaveLength(blok.aantal);
    expect(aanslagen().every((a) => a.juist)).toBe(true);
  });

  it("eerst lezen, dan starten (K28): zonder Start gaat de lamp nooit aan", () => {
    const les = LESSEN[0];
    const blok = vind<ZoekToetsBlok>(les, (b) => b.type === "zoek-toets");
    const { ctx, aanslagen } = maakContext(les);
    const inst = zoekToets(blok, ctx);
    const lamp = () => ctx.podium.querySelector(".lamp-plek .lamp-tekening")!;
    const zin = ctx.podium.querySelector(".wachtzin")!;
    vi.advanceTimersByTime(10000); // lang lezen: de lamp blijft uit
    expect(lamp().classList.contains("aan")).toBe(false);
    druk(inst, " "); // de spatiebalk voor de start: een reactie, geen aanslag
    expect(zin.textContent).toBe("Druk eerst op Start.");
    expect(aanslagen()).toHaveLength(0);
    druk(inst, "Enter");
    vi.advanceTimersByTime(1000); // na Start: tijd om de duimen klaar te leggen
    expect(lamp().classList.contains("aan")).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(lamp().classList.contains("aan")).toBe(true);
  });

  it("licht aan: hulp in de eerste drie rondes, daarna alleen na een fout of na even wachten", () => {
    const les = LESSEN[0];
    const blok = vind<SpelBlok>(les, (b) => b.type === "spel" && b.spel === "licht-aan");
    const { ctx, laatsteRij } = maakContext(les);
    const inst = lichtAan(blok, ctx);
    const toetsVoorRij: Record<string, string> = { zolder: "e", woonkamer: "f", kelder: "c" };
    const opdracht = () => ctx.podium.querySelector(".opdracht-tekst")!.textContent!;
    const gevraagd = () => Object.keys(toetsVoorRij).find((r) => opdracht().includes(r))!;
    // ronde 1 tot 3: woonkamer, zolder, kelder, telkens met hulp en met de plaats van de rij
    for (const [rij, plaats] of [["woonkamer", "met de bultjes"], ["zolder", "boven de bultjes"], ["kelder", "onder de bultjes"]]) {
      expect(gevraagd()).toBe(rij);
      expect(laatsteRij()).toBe(rij);
      expect(opdracht()).toContain(plaats);
      druk(inst, toetsVoorRij[rij]);
    }
    // ronde 4: geen hulp
    expect(laatsteRij()).toBeNull();
    // een foute toets: de hulp verschijnt
    const rij4 = gevraagd();
    const fout = rij4 === "zolder" ? "f" : "e";
    druk(inst, fout);
    expect(laatsteRij()).toBe(rij4);
    vi.advanceTimersByTime(1000);
    druk(inst, toetsVoorRij[rij4]);
    // ronde 5: eerst geen hulp, na 3 seconden wachten wel
    expect(laatsteRij()).toBeNull();
    vi.advanceTimersByTime(3000);
    expect(laatsteRij()).toBe(gevraagd());
  });
});
