import { describe, expect, it } from "vitest";
import { METING } from "../src/logica/instellingen";
import { datumNu, foutAandeel, mediaan, meestVerkeerd, nauwkeurigheidVan, overzichtPerToets, vatSamen, voegPogingToe, type PogingMeting } from "../src/logica/metingen";
import { nieuweOefening, sterren, typ, type TypOefening } from "../src/logica/typen";
import { isLesOpen, nieuweVoortgang, registreerEindoefening } from "../src/logica/voortgang";

/**
 * Typ een regel na. `toetsen` is een lijst van [getypte toets, tijd in ms sinds
 * de vorige aanslag]; de eerste tijd doet er niet toe.
 */
function regel(doel: string, toetsen: [string, number][]): TypOefening {
  const o = nieuweOefening(doel);
  let nu = 1000;
  for (const [toets, wacht] of toetsen) {
    nu += wacht;
    typ(o, toets, nu);
  }
  return o;
}

const INFO = { les: 1, blok: "reeks", datum: "2026-12-01T09:15:00" };

describe("een fout telt een keer per positie", () => {
  it("drie keer verkeerd drukken op een letter is een fout, maar elke verkeerde toets wordt onthouden", () => {
    const p = vatSamen([regel("fj", [["f", 0], ["f", 300], ["g", 300], ["f", 300], ["j", 300]])], INFO);
    expect(p.posities).toBe(2);
    expect(p.meteenJuist).toBe(1);
    expect(p.toetsen.j.aantal).toBe(1);
    expect(p.toetsen.j.fouten).toBe(1);
    expect(p.toetsen.j.verkeerd).toEqual({ f: 2, g: 1 });
    expect(p.toetsen.f).toMatchObject({ aantal: 1, fouten: 0, verkeerd: {} });
  });

  it("telt fouten bij de toets die moest komen, ook de spatie", () => {
    const p = vatSamen([regel("f j", [["f", 0], ["j", 300], [" ", 300], ["j", 300]])], INFO);
    expect(p.toetsen[" "]).toMatchObject({ aantal: 1, fouten: 1, verkeerd: { j: 1 } });
    expect(p.toetsen.j).toMatchObject({ aantal: 1, fouten: 0 });
  });
});

describe("nauwkeurigheid per positie", () => {
  it("is posities meteen juist gedeeld door posities", () => {
    // 10 posities, op 1 positie twee keer verkeerd gedrukt: 9 / 10 (en niet 10 / 12).
    const toetsen: [string, number][] = [];
    for (let i = 0; i < 10; i++) {
      if (i === 3) toetsen.push(["j", 300], ["j", 300]);
      toetsen.push(["f", 300]);
    }
    const p = vatSamen([regel("ffffffffff", toetsen)], INFO);
    expect(p.posities).toBe(10);
    expect(p.meteenJuist).toBe(9);
    expect(nauwkeurigheidVan(p)).toBe(0.9);
  });

  it("is 1 zonder posities", () => {
    expect(nauwkeurigheidVan(vatSamen([], INFO))).toBe(1);
  });

  it("telt de posities van alle regels samen", () => {
    const p = vatSamen([regel("fj", [["f", 0], ["j", 300]]), regel("jf", [["f", 0], ["j", 300], ["f", 300]])], INFO);
    expect(p.posities).toBe(4);
    expect(p.meteenJuist).toBe(3);
  });

  it("beslist over de 90%-regel en de sterren: 4 fouten op 40 posities is net genoeg, 5 niet", () => {
    const poging = (fouten: number) => {
      const toetsen: [string, number][] = [];
      for (let i = 0; i < 40; i++) {
        if (i < fouten) toetsen.push(["j", 300], ["j", 300], ["j", 300]); // wild drukken blijft een fout
        toetsen.push(["f", 300]);
      }
      return vatSamen([regel("f".repeat(40), toetsen)], { ...INFO, blok: "eindoefening" });
    };
    const v = nieuweVoortgang();
    expect(nauwkeurigheidVan(poging(5))).toBe(0.875);
    expect(registreerEindoefening(v, 1, nauwkeurigheidVan(poging(5)), 5).gehaald).toBe(false);
    expect(isLesOpen(v, 2, [0, 1, 2])).toBe(false);
    expect(nauwkeurigheidVan(poging(4))).toBe(0.9);
    expect(registreerEindoefening(v, 1, nauwkeurigheidVan(poging(4)), 5)).toEqual({ gehaald: true, sterren: 1 });
    expect(isLesOpen(v, 2, [0, 1, 2])).toBe(true);
    expect(sterren(nauwkeurigheidVan(poging(1)))).toBe(2); // 39 / 40 = 97,5%
    expect(sterren(nauwkeurigheidVan(poging(0)))).toBe(3);
  });
});

describe("de tijd van een aanslag telt alleen bij een propere aanslag", () => {
  it("regel 1: deze positie moet meteen juist zijn", () => {
    const p = vatSamen([regel("fj", [["f", 0], ["f", 300], ["j", 300]])], INFO);
    expect(p.toetsen.j.tijdMetingen).toBe(0);
    expect(p.toetsen.j.tijdMediaanMs).toBeNull();
  });

  it("regel 2: de vorige positie moet ook meteen juist zijn", () => {
    // f: fout en dan juist; de j erna is meteen juist, maar telt niet (vertraging na een fout).
    const p = vatSamen([regel("fjf", [["j", 0], ["f", 300], ["j", 300], ["f", 500]])], INFO);
    expect(p.toetsen.j.tijdMetingen).toBe(0);
    // De laatste f volgt op een propere j: die telt wel.
    expect(p.toetsen.f.tijdMetingen).toBe(1);
    expect(p.toetsen.f.tijdMediaanMs).toBe(500);
  });

  it("regel 3: de eerste positie van een regel telt niet", () => {
    const p = vatSamen([regel("fj", [["f", 0], ["j", 300]]), regel("jf", [["j", 9999], ["f", 400]])], INFO);
    expect(p.toetsen.j.tijdMetingen).toBe(1); // alleen de j van de eerste regel
    expect(p.toetsen.j.tijdMediaanMs).toBe(300);
    expect(p.toetsen.f.tijdMetingen).toBe(1); // alleen de f van de tweede regel
    expect(p.toetsen.f.tijdMediaanMs).toBe(400);
    expect(p.toetsen.j.langePauzes).toBe(0);
  });

  it("regel 4: een herhaling van dezelfde toets telt niet (zoals in fff)", () => {
    const p = vatSamen([regel("fff j", [["f", 0], ["f", 200], ["f", 200], [" ", 350], ["j", 450]])], INFO);
    expect(p.toetsen.f.tijdMetingen).toBe(0);
    expect(p.toetsen[" "].tijdMediaanMs).toBe(350);
    expect(p.toetsen.j.tijdMediaanMs).toBe(450);
  });

  it("regel 5: de tijd moet tussen 40 en 4000 ms liggen", () => {
    const t = (ms: number) => vatSamen([regel("fj", [["f", 0], ["j", ms]])], INFO).toetsen.j;
    expect(METING.minTijdMs).toBe(40);
    expect(METING.maxTijdMs).toBe(4000);
    expect(t(39).tijdMetingen).toBe(0);
    expect(t(40).tijdMetingen).toBe(1);
    expect(t(4000).tijdMetingen).toBe(1);
    expect(t(4001).tijdMetingen).toBe(0);
  });
});

describe("lange pauzes", () => {
  it("een propere aanslag boven 4000 ms telt niet voor de tijd, maar wel als lange pauze", () => {
    const p = vatSamen([regel("fjf", [["f", 0], ["j", 6000], ["f", 500]])], INFO);
    expect(p.toetsen.j).toMatchObject({ tijdMetingen: 0, tijdMediaanMs: null, langePauzes: 1 });
    expect(p.toetsen.f).toMatchObject({ tijdMetingen: 1, tijdMediaanMs: 500, langePauzes: 0 });
  });

  it("een lange wachttijd na een fout of bij een te snelle aanslag is geen lange pauze", () => {
    const naFout = vatSamen([regel("fj", [["j", 0], ["f", 300], ["j", 9000]])], INFO);
    expect(naFout.toetsen.j.langePauzes).toBe(0);
    const teSnel = vatSamen([regel("fj", [["f", 0], ["j", 10]])], INFO);
    expect(teSnel.toetsen.j.langePauzes).toBe(0);
  });
});

describe("mediaan", () => {
  it("is de middelste waarde, niet het gemiddelde", () => {
    expect(mediaan([])).toBeNull();
    expect(mediaan([500])).toBe(500);
    expect(mediaan([300, 3900, 500])).toBe(500);
    expect(mediaan([400, 200, 600, 800])).toBe(500);
  });

  it("per toets wordt de mediaan van de tijden bewaard", () => {
    const p = vatSamen([regel("jfjfjf", [["j", 0], ["f", 300], ["j", 100], ["f", 3900], ["j", 100], ["f", 500]])], INFO);
    expect(p.toetsen.f.tijdMetingen).toBe(3);
    expect(p.toetsen.f.tijdMediaanMs).toBe(500); // het gemiddelde zou 1567 zijn
  });
});

describe("de samenvatting van een poging", () => {
  it("heeft het formaat van projectdocument 12, zonder losse aanslagen of getypte tekst", () => {
    const p = vatSamen([regel("fj f", [["f", 0], ["j", 820], ["g", 300], [" ", 300], ["f", 610]])], { les: 1, blok: "eindoefening", datum: "2026-12-01T09:15:00" });
    expect(p).toEqual({
      les: 1,
      blok: "eindoefening",
      datum: "2026-12-01T09:15:00",
      posities: 4,
      meteenJuist: 3,
      toetsen: {
        f: { aantal: 2, fouten: 0, verkeerd: {}, tijdMediaanMs: null, tijdMetingen: 0, langePauzes: 0 },
        j: { aantal: 1, fouten: 0, verkeerd: {}, tijdMediaanMs: 820, tijdMetingen: 1, langePauzes: 0 },
        " ": { aantal: 1, fouten: 1, verkeerd: { g: 1 }, tijdMediaanMs: null, tijdMetingen: 0, langePauzes: 0 },
      },
    });
  });

  it("schrijft de datum als lokale tijd zonder tijdzone", () => {
    expect(datumNu(new Date(2026, 11, 1, 9, 5, 7))).toBe("2026-12-01T09:05:07");
  });
});

const poging = (les: number, blok: string, f: Partial<PogingMeting["toetsen"][string]>): PogingMeting => ({
  les,
  blok,
  datum: "2026-12-01T09:15:00",
  posities: f.aantal ?? 0,
  meteenJuist: (f.aantal ?? 0) - (f.fouten ?? 0),
  toetsen: { f: { aantal: 0, fouten: 0, verkeerd: {}, tijdMediaanMs: null, tijdMetingen: 0, langePauzes: 0, ...f } },
});

describe("bewaren en samenvatten", () => {
  it("bewaart hoogstens het maximum aantal pogingen; oudere worden opgeteld per toets", () => {
    const opslag = { metingen: [] as PogingMeting[], metingenOuder: {} };
    for (let i = 0; i < 5; i++) voegPogingToe(opslag, poging(1, "reeks", { aantal: 10, fouten: 1, verkeerd: { j: 1 }, langePauzes: 1, tijdMediaanMs: 500 + i, tijdMetingen: 4 }), 3);
    expect(opslag.metingen).toHaveLength(3);
    expect(opslag.metingen.map((p) => p.toetsen.f.tijdMediaanMs)).toEqual([502, 503, 504]); // de laatste drie
    expect(opslag.metingenOuder).toEqual({ f: { aantal: 20, fouten: 2, verkeerd: { j: 2 }, langePauzes: 2 } });
    // In het overzicht gaat niets verloren van de tellingen.
    expect(overzichtPerToets(opslag).f).toMatchObject({ aantal: 50, fouten: 5, verkeerd: { j: 5 }, langePauzes: 5 });
  });

  it("het overzicht per toets gebruikt de mediaan van de medianen per poging", () => {
    const opslag = { metingen: [] as PogingMeting[], metingenOuder: {} };
    voegPogingToe(opslag, poging(1, "reeks", { aantal: 10, tijdMediaanMs: 400, tijdMetingen: 5 }));
    voegPogingToe(opslag, poging(1, "reeks", { aantal: 10, tijdMediaanMs: 3000, tijdMetingen: 2 }));
    voegPogingToe(opslag, poging(1, "reeks", { aantal: 10, tijdMediaanMs: 600, tijdMetingen: 6 }));
    voegPogingToe(opslag, poging(1, "reeks", { aantal: 10 })); // geen tijdmetingen: telt niet mee in de mediaan
    const f = overzichtPerToets(opslag).f;
    expect(f.tijdMediaanMs).toBe(600);
    expect(f.tijdMetingen).toBe(13);
    expect(f.aantal).toBe(40);
  });

  it("zoekt de meest getypte verkeerde toets en het aandeel fouten", () => {
    expect(meestVerkeerd({})).toBeNull();
    expect(meestVerkeerd({ j: 2, g: 5, d: 1 })).toEqual({ toets: "g", aantal: 5 });
    expect(foutAandeel({ aantal: 20, fouten: 5 })).toBe(0.25);
    expect(foutAandeel({ aantal: 0, fouten: 0 })).toBe(0);
  });
});

describe("extra oefenen telt niet mee, maar bewaart wel", () => {
  it("een poging met blok extra komt bij de metingen, en verandert niets aan sterren of slot", () => {
    const v = nieuweVoortgang();
    registreerEindoefening(v, 1, 0.7, 5); // les 1 niet gehaald
    const voor = JSON.stringify(v.lessen);
    const p = vatSamen([regel("fj jf", [["f", 0], ["j", 300], [" ", 300], ["j", 300], ["f", 300]])], { les: 1, blok: "extra" });
    voegPogingToe(v, p);
    expect(nauwkeurigheidVan(p)).toBe(1); // foutloos, en toch ...
    expect(JSON.stringify(v.lessen)).toBe(voor); // ... geen sterren, geen poging, geen les die opengaat
    expect(isLesOpen(v, 2, [0, 1, 2])).toBe(false);
    expect(v.metingen).toHaveLength(1);
    expect(v.metingen[0].blok).toBe("extra");
    expect(overzichtPerToets(v).f.aantal).toBe(2);
  });
});
