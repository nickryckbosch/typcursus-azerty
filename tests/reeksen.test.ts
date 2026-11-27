import { describe, expect, it } from "vitest";
import { beekStenen, lichtAanRondes, zoekReeks } from "../src/logica/reeksen";

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
