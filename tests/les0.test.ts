// @vitest-environment jsdom
//
// Les 0, de oriëntatieles in het klein (docs/beslissingen.md, 12u): het gedrag
// van de stappen Goed zitten, Toetsenjacht, Voel de bultjes en Links, rechts,
// duim, en het einde van de les. De app werkt met toetscodes; een aanslag gaat
// nooit verloren en een ingehouden toets telt een keer.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSEN } from "../src/content";
import type { Blok } from "../src/content/types";
import type { BlokContext, BlokInstantie } from "../src/blokken/context";
import { afsluiter } from "../src/blokken/afsluiter";
import { bultjes } from "../src/blokken/bultjes";
import { houding } from "../src/blokken/houding";
import { tik } from "../src/blokken/tik";
import { toetsenjacht } from "../src/blokken/toetsenjacht";
import { isLesOpen, nieuweVoortgang } from "../src/logica/voortgang";
import { maakHanden } from "../src/weergave/handen";
import { maakToetsenbord } from "../src/weergave/toetsenbord";

const LES0 = LESSEN[0];
const blokVan = <T extends Blok["type"]>(type: T) => LES0.online.find((b) => b.type === type) as Extract<Blok, { type: T }>;

function maakContext() {
  const podium = document.createElement("main");
  const toetsenbord = maakToetsenbord(LES0.geleerdeToetsen);
  const handen = maakHanden("linkerhand", "rechterhand");
  document.body.replaceChildren(podium, toetsenbord.element, handen.links, handen.rechts);
  let volgende = 0;
  const hulp: (string | null)[] = [];
  const app = { voortgang: nieuweVoortgang(), bewaar() {}, lessen: LESSEN, toonStart() {}, startLes() {} };
  const ctx: BlokContext = {
    app: app as unknown as BlokContext["app"],
    les: LES0,
    podium,
    toetsenbord,
    handen,
    toonHulp: (teken) => void hulp.push(teken),
    toonFout: (teken) => void hulp.push(teken),
    hulpAltijd: true,
    hulpNaMs: 3000,
    extra: false,
    blokNummer: () => 0,
    zeg() {},
    volgende: () => void volgende++,
    gaNaar() {},
    indexVan: () => 0,
    bewaarPoging: () => 1,
    toonToetsenbord() {},
    later: (fn, ms) => void setTimeout(fn, ms),
    sessie: {},
  };
  const toets = (code: string) => [...toetsenbord.element.querySelectorAll<HTMLElement>(".toets")].filter((x) => x.dataset.code === code);
  return {
    ctx,
    app,
    aantalVolgende: () => volgende,
    hulp,
    tekst: (selector: string) => podium.querySelector(selector)?.textContent ?? "",
    zichtbaar: (selector: string) => {
      const e = podium.querySelector(selector);
      return !!e && !e.classList.contains("onzichtbaar");
    },
    /** de toetsen die op het schermtoetsenbord aangewezen worden */
    aangewezen: () => toetsenbord.element.querySelectorAll(".toets.volgende").length,
    /** de toetsen die op het schermtoetsenbord branden */
    brandt: () => toetsenbord.element.querySelectorAll(".toets.gedrukt").length,
    toets,
    actieveVingers: () => document.querySelectorAll(".vinger-vlak.actief").length,
  };
}

const KEY: Record<string, string> = { Space: " ", Enter: "Enter", NumpadEnter: "Enter", Backspace: "Backspace", ShiftLeft: "Shift", ShiftRight: "Shift", KeyF: "f", KeyJ: "j", KeyS: "s", KeyK: "k", KeyQ: "a" };

function druk(inst: BlokInstantie, code: string, repeat = false): void {
  inst.opToets?.({ key: KEY[code], code, repeat, ctrlKey: false, altKey: false, metaKey: false } as KeyboardEvent);
  vi.advanceTimersByTime(30);
}

beforeEach(() => {
  vi.useFakeTimers();
  window.requestAnimationFrame ??= ((fn: FrameRequestCallback) => setTimeout(() => fn(0), 0)) as typeof requestAnimationFrame;
});
afterEach(() => vi.useRealTimers());

describe("les 0, stap 2: Goed zitten", () => {
  it("toont de opdracht, de tekstballon en drie kaartjes; alleen Enter gaat verder", () => {
    const { ctx, tekst, aantalVolgende } = maakContext();
    const inst = houding(blokVan("houding"), ctx);
    expect(tekst(".opdracht-tekst")).toBe("Ga goed zitten. Zit je klaar? Druk dan op Verder.");
    expect(tekst(".doel-ballon")).toBe("Voeten plat, rug recht, schouders los!");
    expect([...ctx.podium.querySelectorAll(".zit-kaartje b")].map((e) => e.textContent)).toEqual(["Voeten plat", "Rug recht", "Schouders los"]);
    expect(ctx.podium.querySelector(".lamp-tekening")).toBeNull();
    druk(inst, "Space");
    druk(inst, "KeyF");
    druk(inst, "Enter", true); // een ingehouden Enter van het vorige scherm
    expect(aantalVolgende()).toBe(0);
    druk(inst, "Enter");
    expect(aantalVolgende()).toBe(1);
  });
});

describe("les 0, stap 5: Toetsenjacht", () => {
  const start = () => {
    const c = maakContext();
    const inst = toetsenjacht(blokVan("toetsenjacht"), c.ctx);
    return { ...c, inst };
  };
  const REEKS = ["Space", "Enter", "Backspace", "ShiftLeft", "Backspace", "Enter", "Space", "ShiftRight"];

  it("vraagt acht toetsen: eerst de vier met hun zin, daarna dezelfde vier door elkaar", () => {
    const { inst, tekst, aantalVolgende } = start();
    const namen: string[] = [];
    const zinnen: string[] = [];
    for (const code of REEKS) {
      namen.push(tekst(".jacht-naam"));
      zinnen.push(tekst(".doel-ballon"));
      druk(inst, code);
    }
    expect(namen).toEqual(["De spatiebalk", "Enter", "Backspace", "Shift", "Backspace", "Enter", "De spatiebalk", "Shift"]);
    expect(zinnen.slice(0, 4)).toEqual([
      "De spatiebalk maakt een witruimte tussen twee woorden.",
      "Enter begint een nieuwe regel.",
      "Backspace wist het laatste teken: een stap terug.",
      "Shift maakt een hoofdletter.",
    ]);
    // het slot: de slotzin in de tekstballon, de opdracht weg, de knop Verder erbij
    expect(tekst(".doel-ballon")).toBe("Knap! Je kent al vier toetsen bij naam.");
    expect(aantalVolgende()).toBe(0);
    druk(inst, "Enter");
    expect(aantalVolgende()).toBe(1);
  });

  it("acht juiste toetsen 30 ms na elkaar tellen allemaal", () => {
    const { inst, tekst, zichtbaar } = start();
    expect(zichtbaar(".enter-rij")).toBe(false);
    for (const code of REEKS) druk(inst, code);
    expect(tekst(".voortgang-teller")).toBe("8 van 8");
    expect(zichtbaar(".enter-rij")).toBe(true);
  });

  it("de eerste vier keer wijst het schermtoetsenbord de toets aan, daarna pas na een fout", () => {
    const { inst, aangewezen, tekst, zichtbaar } = start();
    expect(aangewezen()).toBe(1); // de spatiebalk
    druk(inst, "Space");
    expect(aangewezen()).toBe(2); // Enter bestaat uit twee delen
    druk(inst, "Enter");
    expect(aangewezen()).toBe(1); // Backspace
    druk(inst, "Backspace");
    expect(aangewezen()).toBe(2); // de linker en de rechter Shift
    druk(inst, "ShiftLeft");
    // de herhaling: geen hulp
    expect(aangewezen()).toBe(0);
    expect(zichtbaar(".wachtzin")).toBe(false);
    druk(inst, "KeyQ"); // een andere toets
    expect(aangewezen()).toBe(1);
    expect(zichtbaar(".wachtzin")).toBe(true);
    expect(tekst(".wachtzin")).toBe("Nog niet. Kijk op het toetsenbord.");
    expect(tekst(".jacht-naam")).toBe("Backspace"); // de app wacht op de juiste toets
    druk(inst, "Backspace");
    expect(zichtbaar(".wachtzin")).toBe(false);
    expect(tekst(".jacht-naam")).toBe("Enter");
  });

  it("Enter is hier geen Verder: het is een toets van de oefening", () => {
    const { inst, tekst, aantalVolgende, zichtbaar } = start();
    druk(inst, "Enter"); // gevraagd: de spatiebalk
    expect(aantalVolgende()).toBe(0);
    expect(tekst(".jacht-naam")).toBe("De spatiebalk");
    expect(zichtbaar(".wachtzin")).toBe(true);
    druk(inst, "Space");
    druk(inst, "NumpadEnter"); // de Enter van het cijferblok is ook Enter
    expect(tekst(".jacht-naam")).toBe("Backspace");
    expect(aantalVolgende()).toBe(0);
  });

  it("de linker en de rechter Shift zijn allebei goed", () => {
    for (const shift of ["ShiftLeft", "ShiftRight"]) {
      const { inst, tekst } = start();
      for (const code of ["Space", "Enter", "Backspace"]) druk(inst, code);
      expect(tekst(".jacht-naam")).toBe("Shift");
      druk(inst, shift);
      expect(tekst(".voortgang-teller")).toBe("5 van 8");
    }
  });

  it("een ingehouden toets telt een keer", () => {
    const { inst, tekst } = start();
    druk(inst, "Space");
    for (let i = 0; i < 5; i++) druk(inst, "Space", true);
    expect(tekst(".jacht-naam")).toBe("Enter");
    expect(tekst(".wachtzin").trim()).toBe(""); // geen foutmelding door het inhouden
  });

  it("de toets die het kind indrukt, licht een halve seconde op", () => {
    const { inst, brandt } = start();
    inst.opToets?.({ key: " ", code: "Space", repeat: false } as KeyboardEvent);
    expect(brandt()).toBe(1);
    vi.advanceTimersByTime(400);
    expect(brandt()).toBe(1);
    vi.advanceTimersByTime(150);
    expect(brandt()).toBe(0);
  });

  it("toont de namen van Shift, Enter en Backspace alleen in deze stap", () => {
    const { inst, ctx } = start();
    expect(ctx.toetsenbord.element.classList.contains("met-naamtoetsen")).toBe(true);
    inst.opruimen?.();
    expect(ctx.toetsenbord.element.classList.contains("met-naamtoetsen")).toBe(false);
  });
});

describe("les 0, stap 6: Voel de bultjes", () => {
  const start = () => {
    const c = maakContext();
    const inst = bultjes(blokVan("bultjes"), c.ctx);
    const blauw = () => c.ctx.podium.querySelectorAll(".bult-kaart.aan").length;
    return { ...c, inst, blauw };
  };

  it("toont de twee wijsvingers in kleur en noemt geen letters", () => {
    const { ctx, actieveVingers, hulp, inst } = start();
    expect(actieveVingers()).toBe(2);
    expect(ctx.podium.querySelectorAll(".bult-kaart")).toHaveLength(2);
    expect(ctx.podium.querySelector(".bult-kaartjes")!.textContent).toBe("");
    druk(inst, "KeyS");
    druk(inst, "KeyF");
    // de hulpregel ("Typ de f met je ...") wordt hier nooit gebruikt
    expect(hulp).toEqual([]);
    expect(ctx.podium.textContent).not.toMatch(/\b[fj]\b/);
  });

  it("de bultjes blijven branden tot ze allebei gevonden zijn", () => {
    const { inst, blauw, brandt, tekst, zichtbaar } = start();
    druk(inst, "KeyF");
    expect(blauw()).toBe(1);
    vi.advanceTimersByTime(2000); // langer dan een halve seconde
    expect(brandt()).toBe(1);
    druk(inst, "KeyF"); // twee keer hetzelfde bultje: het telt een keer
    expect(blauw()).toBe(1);
    druk(inst, "KeyJ");
    expect(blauw()).toBe(2);
    expect(brandt()).toBe(2);
    expect(zichtbaar(".wachtzin")).toBe(true);
    expect(tekst(".wachtzin")).toBe("Gevonden! Handen in je schoot, en zoek ze opnieuw.");
    expect(tekst(".voortgang-teller")).toBe("2 van 3");
    // na de pauze: alles gedoofd, de volgende beurt
    vi.advanceTimersByTime(2300);
    expect(blauw()).toBe(0);
    expect(brandt()).toBe(0);
    expect(zichtbaar(".wachtzin")).toBe(false);
  });

  it("een andere toets: de melding, en de twee toetsen lichten op het schermtoetsenbord op", () => {
    const { inst, aangewezen, tekst, zichtbaar, blauw } = start();
    druk(inst, "KeyS");
    expect(tekst(".wachtzin")).toBe("Nog niet. Voel verder over de woonkamer.");
    expect(zichtbaar(".wachtzin")).toBe(true);
    expect(aangewezen()).toBe(2);
    expect(blauw()).toBe(0);
    druk(inst, "KeyJ");
    expect(zichtbaar(".wachtzin")).toBe(false);
    expect(blauw()).toBe(1);
  });

  it("drie keer; een toets tijdens de pauze begint meteen de volgende beurt (geen verloren aanslag)", () => {
    const { inst, blauw, tekst, aantalVolgende, zichtbaar } = start();
    // zes juiste toetsen 30 ms na elkaar
    for (const code of ["KeyF", "KeyJ", "KeyJ", "KeyF", "KeyF", "KeyJ"]) druk(inst, code);
    expect(tekst(".doel-ballon")).toBe("Daar is thuis. Leg je andere vingers ernaast, en je duimen op de spatiebalk.");
    expect(blauw()).toBe(2); // op het einde blijven de bultjes blauw
    expect(zichtbaar(".enter-rij")).toBe(true);
    expect(aantalVolgende()).toBe(0);
    druk(inst, "Enter");
    expect(aantalVolgende()).toBe(1);
  });

  it("een ingehouden toets telt een keer, ook over de pauze heen", () => {
    const { inst, blauw, tekst } = start();
    druk(inst, "KeyF");
    druk(inst, "KeyJ");
    for (let i = 0; i < 5; i++) druk(inst, "KeyJ", true); // de vinger blijft liggen
    expect(blauw()).toBe(2);
    expect(tekst(".voortgang-teller")).toBe("2 van 3");
  });
});

describe("les 0, stap 7: Links, rechts, duim", () => {
  const start = () => {
    const c = maakContext();
    const inst = tik(blokVan("tik"), c.ctx);
    return { ...c, inst };
  };
  const CODE: Record<string, string> = { Links: "KeyF", Rechts: "KeyJ", Duim: "Space" };

  it("twaalf keer, in de volgorde van de oriëntatieles; 30 ms na elkaar telt elke tik", () => {
    const { inst, tekst, aantalVolgende, zichtbaar, hulp } = start();
    const reeks: string[] = [];
    for (let i = 0; i < 12; i++) {
      const woord = tekst(".tik-kaart");
      reeks.push(woord[0]);
      druk(inst, CODE[woord]);
    }
    expect(reeks.join(" ")).toBe("L R D L D R R L D L R D");
    expect(tekst(".doel-ballon")).toBe("Goed zo! Je vingers vinden hun plek.");
    expect(zichtbaar(".enter-rij")).toBe(true);
    expect(hulp).toEqual([]); // geen hulpregel met een letter
    expect(aantalVolgende()).toBe(0);
    druk(inst, "Enter");
    expect(aantalVolgende()).toBe(1);
  });

  it("de getekende hand toont een vinger in kleur", () => {
    const { actieveVingers } = start();
    expect(actieveVingers()).toBe(1);
    expect(document.querySelector(".hand-linker .vinger-vlak.actief")).not.toBeNull();
  });

  it("de wijsvinger van de verkeerde hand: \"Andere hand!\"; een andere toets: \"Andere vinger. Kijk naar de hand.\"", () => {
    const { inst, tekst, aangewezen, zichtbaar, toets } = start();
    expect(tekst(".tik-kaart")).toBe("Links");
    expect(zichtbaar(".wachtzin")).toBe(false);
    druk(inst, "KeyJ");
    expect(tekst(".wachtzin")).toBe("Andere hand!");
    expect(zichtbaar(".wachtzin")).toBe(true);
    // de app wacht op de juiste toets en wijst ze aan
    expect(tekst(".tik-kaart")).toBe("Links");
    expect(aangewezen()).toBe(1);
    expect(toets("KeyF")[0].classList.contains("volgende")).toBe(true);
    druk(inst, "KeyK");
    expect(tekst(".wachtzin")).toBe("Andere vinger. Kijk naar de hand.");
    druk(inst, "Space");
    expect(tekst(".wachtzin")).toBe("Andere vinger. Kijk naar de hand.");
    druk(inst, "KeyF");
    expect(zichtbaar(".wachtzin")).toBe(false);
    expect(tekst(".tik-kaart")).toBe("Rechts");
    expect(aangewezen()).toBe(0);
  });

  it("bij \"Duim\" is een wijsvinger een andere vinger, geen andere hand", () => {
    const { inst, tekst } = start();
    druk(inst, "KeyF");
    druk(inst, "KeyJ");
    expect(tekst(".tik-kaart")).toBe("Duim");
    druk(inst, "KeyF");
    expect(tekst(".wachtzin")).toBe("Andere vinger. Kijk naar de hand.");
  });

  it("een ingehouden toets telt een keer", () => {
    const { inst, tekst, zichtbaar } = start();
    druk(inst, "KeyF");
    for (let i = 0; i < 5; i++) druk(inst, "KeyF", true);
    expect(tekst(".tik-kaart")).toBe("Rechts");
    expect(tekst(".voortgang-teller")).toBe("2 van 12");
    expect(zichtbaar(".wachtzin")).toBe(false);
  });
});

describe("les 0, stap 8: Goed gedaan", () => {
  it("er wordt niets gemeten: aan het einde is les 0 af en gaat les 1 open", () => {
    const { ctx, app } = maakContext();
    expect(isLesOpen(app.voortgang, 1, [0, 1])).toBe(false);
    afsluiter(blokVan("afsluiter"), ctx);
    expect(app.voortgang.lessen[0]?.afgewerkt).toBe(true);
    expect(isLesOpen(app.voortgang, 1, [0, 1])).toBe(true);
    expect(ctx.sessie.resultaat?.sterren).toBe(3);
    expect(ctx.podium.textContent).toContain("Je kent ons huis, en je vingers vinden de bultjes.");
    expect(ctx.podium.textContent).toContain("In les 1 leer je wie er op de bultjes woont.");
  });
});
