import { describe, expect, it } from "vitest";
import { soortFout, spiegelToets, zijnBuren } from "../src/logica/foutsoort";
import { toetsVoorTeken } from "../src/logica/indeling";

const code = (teken: string) => toetsVoorTeken(teken)!.toets.code;

// De spiegelparen uit projectdocument 12, hoofdstuk 3.
const SPIEGELPAREN = [
  ["a", "p"], ["z", "o"], ["e", "i"], ["r", "u"], ["t", "y"],
  ["q", "m"], ["s", "l"], ["d", "k"], ["f", "j"], ["g", "h"],
  ["w", "="], ["x", ":"], ["c", ";"], ["v", ","], ["b", "n"],
];

describe("spiegelfout: zelfde vinger, zelfde plaats, andere hand", () => {
  it("kent alle spiegelparen van Belgisch AZERTY, in beide richtingen", () => {
    for (const [a, b] of SPIEGELPAREN) {
      expect(spiegelToets(code(a)), `${a}-${b}`).toBe(code(b));
      expect(spiegelToets(code(b)), `${b}-${a}`).toBe(code(a));
      expect(soortFout(a, b), `${a}-${b}`).toMatch(/^spiegel/);
    }
  });

  it("de spiegeltoets wordt met dezelfde soort vinger getypt, maar met de andere hand", () => {
    for (const [a, b] of SPIEGELPAREN) {
      const va = toetsVoorTeken(a)!.toets.vinger;
      const vb = toetsVoorTeken(b)!.toets.vinger;
      expect(va.replace("linker", "rechter"), `${a}-${b}`).toBe(vb);
    }
  });

  it("toetsen buiten de tien vingerkolommen hebben geen spiegeltoets", () => {
    expect(spiegelToets(code("<"))).toBeNull();
    expect(spiegelToets(code("ù"))).toBeNull();
    expect(spiegelToets("Space")).toBeNull();
  });
});

describe("buurfout: een toets die er fysiek direct naast, boven of onder ligt", () => {
  it("naast elkaar in dezelfde rij", () => {
    expect(zijnBuren(code("f"), code("d"))).toBe(true);
    expect(zijnBuren(code("f"), code("g"))).toBe(true);
    expect(zijnBuren(code("f"), code("s"))).toBe(false);
    expect(zijnBuren(code("f"), code("f"))).toBe(false);
  });

  it("boven en onder: de rijen verspringen, dus een toets raakt er twee boven en twee onder", () => {
    // Boven de f liggen de r en de t, onder de f de c en de v.
    for (const buur of ["r", "t", "c", "v"]) expect(zijnBuren(code("f"), code(buur)), `f-${buur}`).toBe(true);
    for (const geen of ["e", "y", "x", "b"]) expect(zijnBuren(code("f"), code(geen)), `f-${geen}`).toBe(false);
    // Twee rijen verder is geen buur.
    expect(zijnBuren(code("r"), code("v"))).toBe(false);
  });

  it("de spatiebalk ligt onder de kelder", () => {
    expect(zijnBuren("Space", code("v"))).toBe(true);
    expect(zijnBuren("Space", code("n"))).toBe(true);
    expect(zijnBuren("Space", code("f"))).toBe(false);
  });

  it("werkt met de fysieke toets (event.code), niet met het teken", () => {
    expect(zijnBuren("KeyA", "KeyS")).toBe(true); // op AZERTY: q en s
    expect(zijnBuren("KeyQ", "KeyA")).toBe(true); // op AZERTY: a en q
  });
});

describe("soort fout", () => {
  it("spiegelfout", () => {
    expect(soortFout("f", "j")).toBe("spiegel");
    expect(soortFout("d", "k")).toBe("spiegel");
    expect(soortFout("e", "i")).toBe("spiegel");
  });

  it("buurfout", () => {
    expect(soortFout("f", "d")).toBe("buur");
    expect(soortFout("f", "r")).toBe("buur");
    expect(soortFout("j", "k")).toBe("buur");
    expect(soortFout("v", " ")).toBe("buur");
  });

  it("paren die naast elkaar liggen en elkaars spiegelbeeld zijn, zijn allebei", () => {
    expect(soortFout("g", "h")).toBe("spiegel-en-buur");
    expect(soortFout("t", "y")).toBe("spiegel-en-buur");
    expect(soortFout("b", "n")).toBe("spiegel-en-buur");
  });

  it("andere fout", () => {
    expect(soortFout("f", "l")).toBe("ander");
    expect(soortFout("f", "k")).toBe("ander");
    expect(soortFout("f", "8")).toBe("ander"); // een cijfer (met Shift) ligt niet naast de f
    expect(soortFout("f", "?")).toBe("ander");
    expect(soortFout("f", "€")).toBe("ander"); // een teken dat niet op het toetsenbord staat
  });

  it("een hoofdletter is dezelfde fysieke toets", () => {
    expect(soortFout("f", "J")).toBe("spiegel");
    expect(soortFout("f", "F")).toBe("ander");
  });
});
