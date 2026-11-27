import { describe, expect, it } from "vitest";
import { isLesOpen, markeerAfgewerkt, moetKortZijn, nieuweVoortgang, registreerEindoefening } from "../src/logica/voortgang";

const VOLGORDE = [0, 1, 2];

describe("lessen openen", () => {
  it("les 0 is altijd open, les 1 pas na les 0", () => {
    const v = nieuweVoortgang();
    expect(isLesOpen(v, 0, VOLGORDE)).toBe(true);
    expect(isLesOpen(v, 1, VOLGORDE)).toBe(false);
    markeerAfgewerkt(v, 0);
    expect(isLesOpen(v, 1, VOLGORDE)).toBe(true);
    expect(isLesOpen(v, 2, VOLGORDE)).toBe(false);
  });

  it("de volgende les gaat open vanaf 90%", () => {
    const v = nieuweVoortgang();
    expect(registreerEindoefening(v, 1, 0.89, 5).gehaald).toBe(false);
    expect(isLesOpen(v, 2, VOLGORDE)).toBe(false);
    expect(registreerEindoefening(v, 1, 0.9, 5)).toEqual({ gehaald: true, sterren: 1 });
    expect(isLesOpen(v, 2, VOLGORDE)).toBe(true);
  });

  it("alles open voor de leerkracht", () => {
    const v = nieuweVoortgang();
    v.allesOpen = true;
    expect(isLesOpen(v, 2, VOLGORDE)).toBe(true);
  });
});

describe("korte eindoefening", () => {
  it("na twee mislukte pogingen op rij", () => {
    const v = nieuweVoortgang();
    registreerEindoefening(v, 1, 0.5, 3);
    expect(moetKortZijn(v, 1)).toBe(false);
    registreerEindoefening(v, 1, 0.8, 3);
    expect(moetKortZijn(v, 1)).toBe(true);
    registreerEindoefening(v, 1, 0.95, 3);
    expect(moetKortZijn(v, 1)).toBe(false);
  });
});

describe("resultaten bewaren", () => {
  it("houdt de beste nauwkeurigheid en de meeste sterren", () => {
    const v = nieuweVoortgang();
    registreerEindoefening(v, 1, 0.99, 4);
    registreerEindoefening(v, 1, 0.92, 6);
    const l = v.lessen["1"];
    expect(l.sterren).toBe(3);
    expect(l.besteNauwkeurigheid).toBe(0.99);
    expect(l.pogingen).toBe(2);
    expect(l.snelheden).toEqual([4, 6]);
    expect(l.afgewerkt).toBe(true);
  });
});
