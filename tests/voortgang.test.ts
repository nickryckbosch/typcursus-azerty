import { describe, expect, it } from "vitest";
import { isExtraOpen, isLesOpen, lesAanDeBeurt, markeerAfgewerkt, markeerEindeBereikt, moetKortZijn, nieuweVoortgang, registreerEindoefening, verderBij, zetBezigBij } from "../src/logica/voortgang";

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

describe("verdergaan na een onderbreking", () => {
  it("onthoudt het blok, behalve het eerste blok en de afsluiter", () => {
    const v = nieuweVoortgang();
    expect(verderBij(v, 1)).toBeNull();
    zetBezigBij(v, 1, 3, 7);
    expect(verderBij(v, 1)).toBe(3);
    zetBezigBij(v, 1, 6, 7); // afsluiter: les is rond
    expect(verderBij(v, 1)).toBeNull();
    zetBezigBij(v, 1, 0, 7);
    expect(verderBij(v, 1)).toBeNull();
  });
});

describe("de les die aan de beurt is (kaart Verder waar je was)", () => {
  it("is de eerste les die nog niet gelukt is", () => {
    const v = nieuweVoortgang();
    expect(lesAanDeBeurt(v, VOLGORDE)).toBe(0);
    markeerAfgewerkt(v, 0);
    expect(lesAanDeBeurt(v, VOLGORDE)).toBe(1);
    registreerEindoefening(v, 1, 0.5, 5);
    expect(lesAanDeBeurt(v, VOLGORDE)).toBe(1);
    registreerEindoefening(v, 1, 0.95, 5);
    expect(lesAanDeBeurt(v, VOLGORDE)).toBe(2);
  });

  it("is null als alle lessen klaar zijn", () => {
    const v = nieuweVoortgang();
    for (const id of VOLGORDE) markeerAfgewerkt(v, id);
    expect(lesAanDeBeurt(v, VOLGORDE)).toBeNull();
  });
});

describe("extra oefenen gaat open (K15)", () => {
  it("zodra de les een keer tot het einde gedaan is, ook zonder 90%", () => {
    const v = nieuweVoortgang();
    expect(isExtraOpen(v, 1)).toBe(false);
    registreerEindoefening(v, 1, 0.6, 5);
    expect(isExtraOpen(v, 1)).toBe(false); // nog niet bij de afsluiter geweest
    markeerEindeBereikt(v, 1);
    expect(isExtraOpen(v, 1)).toBe(true);
    // De volgende les blijft op slot tot 90% op de eindoefening.
    expect(isLesOpen(v, 2, VOLGORDE)).toBe(false);
  });

  it("is ook open voor een les die al gelukt was (oudere gegevens)", () => {
    const v = nieuweVoortgang();
    registreerEindoefening(v, 1, 0.95, 5);
    expect(isExtraOpen(v, 1)).toBe(true);
  });
});

describe("korte eindoefening", () => {
  it("laat twee fouten toe en geeft dan minstens een ster", () => {
    const v = nieuweVoortgang();
    const tekens = 15;
    const doel = Math.min(0.9, (tekens - 2) / tekens);
    expect(registreerEindoefening(v, 1, 12 / 15, 5, doel).gehaald).toBe(false);
    expect(registreerEindoefening(v, 1, 13 / 15, 5, doel)).toEqual({ gehaald: true, sterren: 1 });
  });
});
