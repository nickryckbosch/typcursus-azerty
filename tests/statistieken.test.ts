import { describe, expect, it } from "vitest";
import { foutAandeel, gemiddeldeTijd, probleemToetsen, voegAanslagenToe, type ToetsStat } from "../src/logica/statistieken";
import { nieuweOefening, typ } from "../src/logica/typen";

describe("statistieken per toets", () => {
  it("telt aanslagen en fouten bij het verwachte teken", () => {
    const o = nieuweOefening("fj");
    typ(o, "f", 0);
    typ(o, "f", 300); // fout op j
    typ(o, "j", 500);
    const stats: Record<string, ToetsStat> = {};
    voegAanslagenToe(stats, o.aanslagen);
    expect(stats.f).toEqual({ aanslagen: 1, fouten: 0, totaleTijdMs: 0, getimed: 0 });
    expect(stats.j).toEqual({ aanslagen: 2, fouten: 1, totaleTijdMs: 200, getimed: 1 });
    expect(gemiddeldeTijd(stats.j)).toBe(200);
    expect(gemiddeldeTijd(stats.f)).toBeNull();
    expect(foutAandeel(stats.j)).toBe(0.5);
  });

  it("telt lange pauzes niet mee in de gemiddelde tijd", () => {
    const o = nieuweOefening("ff");
    typ(o, "f", 0);
    typ(o, "f", 60000);
    const stats: Record<string, ToetsStat> = {};
    voegAanslagenToe(stats, o.aanslagen);
    expect(stats.f.getimed).toBe(0);
    expect(stats.f.aanslagen).toBe(2);
  });

  it("telt op bij bestaande statistieken", () => {
    const stats: Record<string, ToetsStat> = { f: { aanslagen: 5, fouten: 1, totaleTijdMs: 1000, getimed: 4 } };
    voegAanslagenToe(stats, [{ verwacht: "f", getypt: "f", juist: true, tijdMs: 500 }]);
    expect(stats.f).toEqual({ aanslagen: 6, fouten: 1, totaleTijdMs: 1500, getimed: 5 });
  });

  it("sorteert probleemtoetsen", () => {
    const stats: Record<string, ToetsStat> = {
      f: { aanslagen: 20, fouten: 1, totaleTijdMs: 0, getimed: 0 },
      j: { aanslagen: 20, fouten: 5, totaleTijdMs: 0, getimed: 0 },
      d: { aanslagen: 3, fouten: 3, totaleTijdMs: 0, getimed: 0 },
    };
    expect(probleemToetsen(stats)).toEqual(["j", "f"]);
  });
});
