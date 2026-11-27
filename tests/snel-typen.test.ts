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
  let volgende = 0;
  const ctx: BlokContext = {
    app: { voortgang: nieuweVoortgang(), bewaar() {}, lessen: LESSEN } as unknown as BlokContext["app"],
    les,
    podium,
    toetsenbord: { element: document.createElement("div"), markeer() {}, flits() {}, lichtRijOp() {}, toonEnter() {}, benadruk() {} } as unknown as BlokContext["toetsenbord"],
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
  return { ctx, aanslagen: () => regels.flatMap((r) => r.aanslagen), aantalVolgende: () => volgende };
}

function druk(blok: BlokInstantie, teken: string): void {
  const code = toetsVoorTeken(teken)?.toets.code ?? "";
  blok.opToets?.({ key: teken, code, repeat: false, ctrlKey: false, altKey: false, metaKey: false } as KeyboardEvent);
  vi.advanceTimersByTime(TUSSENTIJD);
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
      const kaart = ctx.podium.querySelector(".grote-toets")!.textContent!;
      druk(inst, kaart === "spatie" ? " " : kaart);
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
    const eerste = ctx.podium.querySelector(".grote-toets")!.textContent!;
    druk(inst, eerste === "spatie" ? " " : eerste);
    const tweede = ctx.podium.querySelector(".grote-toets")!.textContent!;
    druk(inst, tweede === "spatie" ? " " : tweede);
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

  it("over de beek: ook meteen na het oversteken van een beek", () => {
    const les = LESSEN[1];
    const blok = vind<SpelBlok>(les, (b) => b.type === "spel" && b.spel === "beek");
    const { ctx, aanslagen } = maakContext(les);
    const inst = beek(blok, ctx);
    for (let i = 0; i < 36; i++) {
      const steen = ctx.podium.querySelector(".steen-nu")!.textContent!;
      druk(inst, steen === "spatie" ? " " : steen);
    }
    expect(aanslagen()).toHaveLength(36);
    expect(aanslagen().every((a) => a.juist)).toBe(true);
    expect(ctx.podium.querySelector(".beek-einde")!.classList.contains("onzichtbaar")).toBe(false);
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
});
