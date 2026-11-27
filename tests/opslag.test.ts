import { describe, expect, it } from "vitest";
import { bewaarVoortgang, leesVoortgang, SLEUTEL, wisVoortgang, zetOm, type Opslag } from "../src/logica/opslag";
import { nieuweVoortgang, VERSIE } from "../src/logica/voortgang";

function geheugen(): Opslag & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const kapot: Opslag = {
  getItem: () => { throw new Error("geen toegang"); },
  setItem: () => { throw new Error("vol"); },
  removeItem: () => { throw new Error("geen toegang"); },
};

describe("opslag", () => {
  it("bewaart en leest dezelfde voortgang", () => {
    const o = geheugen();
    const v = nieuweVoortgang();
    v.lessen["1"] = { afgewerkt: true, pogingen: 2, mislukt: 0, besteNauwkeurigheid: 0.95, sterren: 2, snelheden: [6.5] };
    v.toetsen.f = { aanslagen: 10, fouten: 1, totaleTijdMs: 4000, getimed: 9 };
    v.instellingen.voorlezen = true;
    v.toetsenbord = "ok";
    expect(bewaarVoortgang(v, o)).toBe(true);
    expect(leesVoortgang(o)).toEqual(v);
    expect(JSON.parse(o.data.get(SLEUTEL)!).versie).toBe(VERSIE);
  });

  it("geeft een nieuwe voortgang als er niets is", () => {
    expect(leesVoortgang(geheugen())).toEqual(nieuweVoortgang());
    expect(leesVoortgang(null)).toEqual(nieuweVoortgang());
  });

  it("overleeft kapotte gegevens", () => {
    const o = geheugen();
    o.setItem(SLEUTEL, "{dit is geen json");
    expect(leesVoortgang(o)).toEqual(nieuweVoortgang());
  });

  it("overleeft een opslag die fouten gooit", () => {
    expect(leesVoortgang(kapot)).toEqual(nieuweVoortgang());
    expect(bewaarVoortgang(nieuweVoortgang(), kapot)).toBe(false);
    expect(wisVoortgang(kapot)).toBe(false);
  });

  it("negeert gegevens met een andere versie", () => {
    expect(zetOm({ versie: 999, allesOpen: true })).toEqual(nieuweVoortgang());
  });

  it("vult ontbrekende of foute velden aan", () => {
    const v = zetOm({ versie: VERSIE, lessen: { "0": { afgewerkt: true, pogingen: "veel" } }, toetsen: { f: null }, toetsenbord: "raar" });
    expect(v.lessen["0"].afgewerkt).toBe(true);
    expect(v.lessen["0"].pogingen).toBe(0);
    expect(v.toetsen.f).toBeUndefined();
    expect(v.toetsenbord).toBe("onbekend");
  });

  it("wist de voortgang", () => {
    const o = geheugen();
    bewaarVoortgang(nieuweVoortgang(), o);
    expect(wisVoortgang(o)).toBe(true);
    expect(o.data.has(SLEUTEL)).toBe(false);
  });
});
