import { describe, expect, it } from "vitest";
import { beekStenen, lichtAanRondes, woordRegels, zoekReeks } from "../src/logica/reeksen";

// Eenvoudige voorspelbare toevalsgenerator voor de tests.
function toeval(zaad = 1) {
  let s = zaad;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function drieOpRij(lijst: string[]) {
  return lijst.some((x, i) => i >= 2 && x === lijst[i - 1] && x === lijst[i - 2]);
}

describe("zoek-toets", () => {
  it("geeft het juiste aantal, vooral nadruk, nooit drie dezelfde op rij", () => {
    for (let z = 1; z < 30; z++) {
      const r = zoekReeks(["f", "j", " "], ["f", "j"], 20, toeval(z));
      expect(r).toHaveLength(20);
      expect(drieOpRij(r)).toBe(false);
    }
    const veel = zoekReeks(["f", "j", " "], ["f", "j"], 3000, toeval(7));
    const aandeel = veel.filter((t) => t !== " ").length / veel.length;
    expect(aandeel).toBeGreaterThan(0.6);
    expect(aandeel).toBeLessThan(0.75);
  });

  it("werkt met een enkele toets", () => {
    expect(zoekReeks([" "], undefined, 5)).toEqual([" ", " ", " ", " ", " "]);
  });
});

describe("licht aan", () => {
  it("start vast en geeft elke verdieping drie keer", () => {
    const r = lichtAanRondes(["zolder", "woonkamer", "kelder"], 9, toeval(3));
    expect(r.slice(0, 3)).toEqual(["woonkamer", "zolder", "kelder"]);
    for (const rij of ["zolder", "woonkamer", "kelder"]) expect(r.filter((x) => x === rij)).toHaveLength(3);
  });
});

describe("beek", () => {
  it("elke derde steen is een spatie", () => {
    const s = beekStenen(["f", "j"], 12, toeval(5));
    expect(s).toHaveLength(12);
    expect(s.filter((_, i) => i % 3 === 2).every((x) => x === " ")).toBe(true);
    expect(s.filter((_, i) => i % 3 !== 2).every((x) => x === "f" || x === "j")).toBe(true);
    expect(drieOpRij(s.filter((x) => x !== " "))).toBe(false);
  });
});

describe("zoekReeks zonder herhaling", () => {
  it("geeft nooit twee keer na elkaar dezelfde toets", () => {
    for (let z = 1; z <= 50; z++) {
      let x = z;
      const rnd = () => ((x = (x * 9301 + 49297) % 233280), x / 233280);
      for (const [toetsen, nadruk] of [[["f", "j", " "], ["f", "j"]], [["d", "k", "f", "j", " "], ["d", "k"]], [["e", "i"], undefined]] as const) {
        const r = zoekReeks([...toetsen], nadruk ? [...nadruk] : undefined, 40, rnd);
        for (let i = 1; i < r.length; i++) expect(r[i]).not.toBe(r[i - 1]);
      }
    }
  });
});

describe("woordRegels", () => {
  it("maakt regels van woorden die op een spatie eindigen, zonder dubbels", () => {
    const woorden = ["ei", "ik", "je", "die", "kei", "eik", "dek", "dik", "jij", "kijk"];
    const regels = woordRegels(woorden, 3, 3);
    expect(regels).toHaveLength(3);
    const alle = regels.flatMap((r) => r.trim().split(" "));
    expect(alle).toHaveLength(9);
    expect(new Set(alle).size).toBe(9);
    for (const r of regels) expect(r.endsWith(" ")).toBe(true);
    for (const w of alle) expect(woorden).toContain(w);
  });
});
