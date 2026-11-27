import { describe, expect, it } from "vitest";
import { nauwkeurigheid, nieuweOefening, sterren, teltAlsTeken, typ, volgendTeken, woordenPerMinuut } from "../src/logica/typen";

describe("typen: cursor bij fout", () => {
  it("schuift op bij een juiste toets", () => {
    const o = nieuweOefening("fj");
    expect(typ(o, "f", 0)).toEqual({ juist: true, klaar: false });
    expect(o.positie).toBe(1);
    expect(volgendTeken(o)).toBe("j");
  });

  it("blijft staan bij een fout tot de juiste toets er is", () => {
    const o = nieuweOefening("fj");
    typ(o, "j", 0);
    typ(o, "d", 100);
    expect(o.positie).toBe(0);
    expect(typ(o, "f", 200).juist).toBe(true);
    expect(typ(o, "j", 300)).toEqual({ juist: true, klaar: true });
    expect(o.aanslagen).toHaveLength(4);
    expect(o.aanslagen.filter((a) => !a.juist).map((a) => a.verwacht)).toEqual(["f", "f"]);
  });

  it("spatie is een gewoon teken", () => {
    const o = nieuweOefening("f j");
    typ(o, "f", 0);
    expect(typ(o, "j", 10).juist).toBe(false);
    expect(typ(o, " ", 20).juist).toBe(true);
  });

  it("hoofdletter telt als fout bij een kleine letter", () => {
    const o = nieuweOefening("f");
    expect(typ(o, "F", 0).juist).toBe(false);
  });

  it("meet de tijd tussen aanslagen", () => {
    const o = nieuweOefening("fjf");
    typ(o, "f", 1000);
    typ(o, "j", 1400);
    typ(o, "f", 2000);
    expect(o.aanslagen.map((a) => a.tijdMs)).toEqual([null, 400, 600]);
    expect(o.startTijd).toBe(1000);
    expect(o.eindTijd).toBe(2000);
  });

  it("negeert aanslagen na het einde", () => {
    const o = nieuweOefening("f");
    typ(o, "f", 0);
    expect(typ(o, "f", 10)).toEqual({ juist: false, klaar: true });
    expect(o.aanslagen).toHaveLength(1);
  });
});

describe("nauwkeurigheid", () => {
  it("is juist gedeeld door alle aanslagen", () => {
    const o = nieuweOefening("ffffffffff");
    for (let i = 0; i < 10; i++) {
      if (i === 3) typ(o, "j", i);
      typ(o, "f", i);
    }
    expect(nauwkeurigheid(o.aanslagen)).toBeCloseTo(10 / 11);
  });
  it("is 1 zonder aanslagen", () => {
    expect(nauwkeurigheid([])).toBe(1);
  });
});

describe("sterren", () => {
  it("volgt 90, 95 en 98 procent", () => {
    expect(sterren(0.89)).toBe(0);
    expect(sterren(0.9)).toBe(1);
    expect(sterren(0.949)).toBe(1);
    expect(sterren(0.95)).toBe(2);
    expect(sterren(19 / 20)).toBe(2);
    expect(sterren(0.98)).toBe(3);
    expect(sterren(1)).toBe(3);
  });
});

describe("woorden per minuut", () => {
  it("rekent 5 tekens als een woord", () => {
    expect(woordenPerMinuut(50, 60000)).toBe(10);
    expect(woordenPerMinuut(10, 0)).toBe(0);
  });
});

describe("welke toetsen tellen mee", () => {
  it("alleen echte tekens, zonder herhaling of Ctrl", () => {
    expect(teltAlsTeken({ key: "f" })).toBe(true);
    expect(teltAlsTeken({ key: " " })).toBe(true);
    expect(teltAlsTeken({ key: "Shift" })).toBe(false);
    expect(teltAlsTeken({ key: "Backspace" })).toBe(false);
    expect(teltAlsTeken({ key: "Dead" })).toBe(false);
    expect(teltAlsTeken({ key: "f", repeat: true })).toBe(false);
    expect(teltAlsTeken({ key: "f", ctrlKey: true })).toBe(false);
  });
});
