import { describe, expect, it } from "vitest";
import { beoordeelKaart, stapA, stapZes, verraadtVerkeerdeIndeling } from "../src/logica/toetsenbordcheck";

const kaart = (q: string, zes: string) => new Map([["KeyQ", q], ["Digit6", zes]]);

describe("toetsenbordcheck", () => {
  it("herkent Belgisch, Frans en QWERTY", () => {
    expect(beoordeelKaart(kaart("a", "§"))).toBe("belgisch");
    expect(beoordeelKaart(kaart("a", "-"))).toBe("frans");
    expect(beoordeelKaart(kaart("q", "6"))).toBe("qwerty");
    expect(beoordeelKaart(new Map())).toBeNull();
  });

  it("controleert de toetsen die het kind drukt", () => {
    expect(stapA("a")).toBe("ok");
    expect(stapA("q")).toBe("fout");
    expect(stapZes("§")).toBe("belgisch");
    expect(stapZes("-")).toBe("frans");
    expect(stapZes("6")).toBe("anders");
  });

  it("merkt tijdens het typen een QWERTY-indeling op", () => {
    expect(verraadtVerkeerdeIndeling("KeyQ", "q")).toBe(true);
    expect(verraadtVerkeerdeIndeling("KeyQ", "a")).toBe(false);
    expect(verraadtVerkeerdeIndeling("KeyF", "f")).toBe(false);
  });
});
