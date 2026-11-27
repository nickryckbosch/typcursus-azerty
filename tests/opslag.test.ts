import { describe, expect, it } from "vitest";
import { bewaarVoortgang, leesVoortgang, SLEUTEL, wisVoortgang, zetOm, type Opslag } from "../src/logica/opslag";
import { METING } from "../src/logica/instellingen";
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
    v.lessen["1"] = { afgewerkt: true, pogingen: 2, mislukt: 0, besteNauwkeurigheid: 0.95, sterren: 2, snelheden: [6.5], bezigBij: 3, eindeBereikt: true };
    v.metingen.push({
      les: 1,
      blok: "eindoefening",
      datum: "2026-12-01T09:15:00",
      posities: 40,
      meteenJuist: 37,
      toetsen: {
        f: { aantal: 20, fouten: 2, verkeerd: { j: 1, g: 1 }, tijdMediaanMs: 820, tijdMetingen: 14, langePauzes: 1 },
        " ": { aantal: 9, fouten: 0, verkeerd: {}, tijdMediaanMs: null, tijdMetingen: 0, langePauzes: 0 },
      },
    });
    v.metingenOuder.j = { aantal: 100, fouten: 7, verkeerd: { f: 5, h: 2 }, langePauzes: 3 };
    v.instellingen.voorlezen = true;
    v.toetsenbord = "ok";
    expect(bewaarVoortgang(v, o)).toBe(true);
    expect(leesVoortgang(o)).toEqual(v);
    expect(JSON.parse(o.data.get(SLEUTEL)!).versie).toBe(VERSIE);
  });

  it("hulp is standaard altijd zichtbaar, en de instelling wordt bewaard", () => {
    const o = geheugen();
    const v = nieuweVoortgang();
    expect(v.instellingen.hulpPasNaFout).toBe(false);
    v.instellingen.hulpPasNaFout = true;
    bewaarVoortgang(v, o);
    expect(leesVoortgang(o).instellingen.hulpPasNaFout).toBe(true);
    // Oudere gegevens zonder dit veld: de hulp blijft altijd zichtbaar.
    o.setItem(SLEUTEL, JSON.stringify({ versie: VERSIE, instellingen: { voorlezen: true } }));
    expect(leesVoortgang(o).instellingen).toEqual({ voorlezen: true, hulpPasNaFout: false });
  });

  it("oudere gegevens zonder eindeBereikt: een gelukte les telt als tot het einde gedaan", () => {
    const o = geheugen();
    o.setItem(SLEUTEL, JSON.stringify({ versie: VERSIE, lessen: { "1": { afgewerkt: true }, "2": { afgewerkt: false, pogingen: 1 } } }));
    const v = leesVoortgang(o);
    expect(v.lessen["1"].eindeBereikt).toBe(true);
    expect(v.lessen["2"].eindeBereikt).toBe(false);
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
    const v = zetOm({
      versie: VERSIE,
      lessen: { "0": { afgewerkt: true, pogingen: "veel" } },
      metingen: [null, "kapot", { les: 1, blok: "reeks", toetsen: { f: { aantal: 3, verkeerd: { j: "veel", g: 2 } }, j: null } }],
      metingenOuder: { f: null, j: { aantal: 4 } },
      toetsenbord: "raar",
    });
    expect(v.lessen["0"].afgewerkt).toBe(true);
    expect(v.lessen["0"].pogingen).toBe(0);
    expect(v.metingen).toEqual([
      {
        les: 1,
        blok: "reeks",
        datum: "",
        posities: 0,
        meteenJuist: 0,
        toetsen: { f: { aantal: 3, fouten: 0, verkeerd: { g: 2 }, tijdMediaanMs: null, tijdMetingen: 0, langePauzes: 0 } },
      },
    ]);
    expect(v.metingenOuder).toEqual({ j: { aantal: 4, fouten: 0, verkeerd: {}, langePauzes: 0 } });
    expect(v.toetsenbord).toBe("onbekend");
  });

  it("leest oude gegevens zonder bezigBij", () => {
    const v = zetOm({ versie: VERSIE, lessen: { "1": { afgewerkt: true } } });
    expect(v.lessen["1"].bezigBij).toBeNull();
  });

  it("zet voortgang van versie 1 om zonder iets te verliezen", () => {
    const oud = {
      versie: 1,
      lessen: {
        "0": { afgewerkt: true, pogingen: 0, mislukt: 0, besteNauwkeurigheid: null, sterren: 0, snelheden: [], bezigBij: null },
        "1": { afgewerkt: true, pogingen: 3, mislukt: 0, besteNauwkeurigheid: 0.96, sterren: 2, snelheden: [6.5, 7], bezigBij: 4 },
      },
      // Versie 1 telde elke aanslag, ook de verkeerde: 50 aanslagen waarvan 6 verkeerd.
      toetsen: { f: { aanslagen: 50, fouten: 6, totaleTijdMs: 30000, getimed: 40 }, j: { aanslagen: 2, fouten: 2, totaleTijdMs: 0, getimed: 0 } },
      instellingen: { voorlezen: true },
      toetsenbord: "ok",
      allesOpen: true,
    };
    const v = zetOm(oud);
    expect(v.versie).toBe(2);
    expect(v.lessen["0"].afgewerkt).toBe(true);
    expect(v.lessen["1"]).toEqual({ afgewerkt: true, pogingen: 3, mislukt: 0, besteNauwkeurigheid: 0.96, sterren: 2, snelheden: [6.5, 7], bezigBij: 4, eindeBereikt: true });
    expect(v.instellingen).toEqual({ voorlezen: true, hulpPasNaFout: false });
    expect(v.toetsenbord).toBe("ok");
    expect(v.allesOpen).toBe(true);
    // 44 posities (de juiste aanslagen), 6 fouten; de tijd en de verkeerde toetsen beginnen opnieuw.
    expect(v.metingenOuder).toEqual({ f: { aantal: 44, fouten: 6, verkeerd: {}, langePauzes: 0 } });
    expect(v.metingen).toEqual([]);
  });

  it("een bewaarde voortgang van versie 1 wordt bij het lezen omgezet en daarna als versie 2 bewaard", () => {
    const o = geheugen();
    o.setItem(SLEUTEL, JSON.stringify({ versie: 1, lessen: { "1": { afgewerkt: true, sterren: 3 } }, toetsen: { f: { aanslagen: 10, fouten: 1 } } }));
    const v = leesVoortgang(o);
    expect(v.lessen["1"].sterren).toBe(3);
    bewaarVoortgang(v, o);
    expect(JSON.parse(o.data.get(SLEUTEL)!).versie).toBe(2);
    expect(leesVoortgang(o)).toEqual(v);
  });

  it("schuift te veel bewaarde pogingen door naar de tellingen per toets", () => {
    const poging = (n: number) => ({
      les: 1,
      blok: "reeks",
      datum: `2026-12-01T09:00:${String(n % 60).padStart(2, "0")}`,
      posities: 2,
      meteenJuist: 1,
      toetsen: { f: { aantal: 2, fouten: 1, verkeerd: { j: 1 }, tijdMediaanMs: 500, tijdMetingen: 1, langePauzes: 0 } },
    });
    const v = zetOm({ versie: VERSIE, metingen: Array.from({ length: METING.maxPogingen + 5 }, (_, i) => poging(i)) });
    expect(v.metingen).toHaveLength(METING.maxPogingen);
    expect(v.metingenOuder.f).toEqual({ aantal: 10, fouten: 5, verkeerd: { j: 5 }, langePauzes: 0 });
  });

  it("wist de voortgang", () => {
    const o = geheugen();
    bewaarVoortgang(nieuweVoortgang(), o);
    expect(wisVoortgang(o)).toBe(true);
    expect(o.data.has(SLEUTEL)).toBe(false);
  });
});
