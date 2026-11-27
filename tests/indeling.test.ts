import { describe, expect, it } from "vitest";
import { kleurVanVinger, toetsVoorCode, toetsVoorTeken, type Vinger } from "../src/logica/indeling";

// De tabel uit docs/08-ontwerp-leerlijn-en-les-1.md, deel 3.
const VERDELING: Record<Exclude<Vinger, "duim">, string[]> = {
  linkerpink: ["a", "q", "w"],
  linkerring: ["z", "s", "x"],
  linkermiddel: ["e", "d", "c"],
  linkerwijs: ["r", "t", "f", "g", "v", "b"],
  rechterwijs: ["y", "u", "h", "j", "n", ","],
  rechtermiddel: ["i", "k", ";"],
  rechterring: ["o", "l", ":"],
  rechterpink: ["p", "m", "="],
};

describe("Belgisch AZERTY", () => {
  it("volgt de vingerverdeling uit het ontwerp", () => {
    for (const [vinger, tekens] of Object.entries(VERDELING)) {
      for (const teken of tekens) expect(toetsVoorTeken(teken)?.toets.vinger, teken).toBe(vinger);
    }
    expect(toetsVoorTeken(" ")?.toets.vinger).toBe("duim");
  });

  it("de punt vraagt Shift, de komma niet", () => {
    expect(toetsVoorTeken(".")).toMatchObject({ shift: true, toets: { code: "Comma" } });
    expect(toetsVoorTeken(",")).toMatchObject({ shift: false, toets: { code: "KeyM" } });
  });

  it("a staat bovenaan links, m op de thuisrij", () => {
    expect(toetsVoorCode("KeyQ")).toMatchObject({ basis: "a", rij: "zolder" });
    expect(toetsVoorCode("Semicolon")).toMatchObject({ basis: "m", rij: "woonkamer" });
    expect(toetsVoorCode("KeyF")?.bultje).toBe(true);
    expect(toetsVoorCode("KeyJ")?.bultje).toBe(true);
  });

  it("kleuren zijn gespiegeld", () => {
    expect(kleurVanVinger("linkerwijs")).toBe("blauw");
    expect(kleurVanVinger("rechterwijs")).toBe("blauw");
    expect(kleurVanVinger("linkermiddel")).toBe("oranje");
    expect(kleurVanVinger("rechterring")).toBe("groen");
    expect(kleurVanVinger("linkerpink")).toBe("paars");
    expect(kleurVanVinger("duim")).toBe("grijs");
  });
});
