import { describe, expect, it } from "vitest";
import { LESSEN } from "../src/content";
import type { Les } from "../src/content/types";
import { EXTRA, heeftExtraOefenen, maakExtraBeurt, maakExtraRegels } from "../src/logica/extraoefenen";
import { controleerRegel } from "../src/logica/regelcheck";
import type { Toeval } from "../src/logica/reeksen";

/** Een voorspelbare toevalsfunctie (mulberry32), zodat de tests altijd hetzelfde doen. */
function toeval(zaad: number): Toeval {
  let a = zaad;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const les = (id: number): Les => LESSEN.find((l) => l.id === id)!;
const vroegere = (id: number): Les[] => LESSEN.filter((l) => l.id < id);
const MET_EXTRA = [1, 2, 3, 4, 5];
const BEURTEN = 200;

describe("extra oefenen (K15)", () => {
  it("les 0 heeft geen extra oefenen, les 1 tot 5 wel", () => {
    expect(heeftExtraOefenen(les(0))).toBe(false);
    for (const id of MET_EXTRA) expect(heeftExtraOefenen(les(id)), `les ${id}`).toBe(true);
  });

  it("maakt 4 regels van 15 tot 25 tekens", () => {
    for (const id of MET_EXTRA) {
      for (let zaad = 1; zaad <= BEURTEN; zaad++) {
        const regels = maakExtraRegels(les(id), vroegere(id), toeval(zaad));
        expect(regels).toHaveLength(EXTRA.aantalRegels);
        for (const regel of regels) {
          expect(regel.length, `les ${id}: "${regel}"`).toBeGreaterThanOrEqual(EXTRA.minLengte);
          expect(regel.length, `les ${id}: "${regel}"`).toBeLessThanOrEqual(EXTRA.maxLengte);
        }
      }
    }
  });

  it("elke regel voldoet aan de regelcontrole: geleerde toetsen, vinger en hand", () => {
    for (const id of MET_EXTRA) {
      for (let zaad = 1; zaad <= BEURTEN; zaad++) {
        for (const regel of maakExtraRegels(les(id), vroegere(id), toeval(zaad))) {
          expect(controleerRegel(regel, les(id).geleerdeToetsen), `les ${id}: "${regel}"`).toEqual({ ok: true });
        }
      }
    }
  });

  it("gebruikt alleen items uit de lijsten van de les en van vroegere lessen", () => {
    for (const id of MET_EXTRA) {
      const lijst = (l: Les) => [...l.groepjes, ...l.woorden, ...l.zinnen];
      const huidig = new Set(lijst(les(id)));
      const vroeger = new Set(vroegere(id).flatMap(lijst));
      for (let zaad = 1; zaad <= 50; zaad++) {
        for (const item of maakExtraBeurt(les(id), vroegere(id), toeval(zaad)).items.flat()) {
          expect((item.uit === "huidig" ? huidig : vroeger).has(item.tekst), `les ${id}: "${item.tekst}"`).toBe(true);
        }
      }
    }
  });

  it("neemt nooit twee keer hetzelfde item na elkaar, ook niet over twee regels heen", () => {
    for (const id of MET_EXTRA) {
      for (let zaad = 1; zaad <= BEURTEN; zaad++) {
        const items = maakExtraBeurt(les(id), vroegere(id), toeval(zaad)).items.flat();
        for (let i = 1; i < items.length; i++) expect(items[i].tekst, `les ${id}, zaad ${zaad}`).not.toBe(items[i - 1].tekst);
      }
    }
  });

  it("in les 1 komt alles uit les 1", () => {
    for (let zaad = 1; zaad <= BEURTEN; zaad++) {
      for (const item of maakExtraBeurt(les(1), vroegere(1), toeval(zaad)).items.flat()) expect(item.uit).toBe("huidig");
    }
  });

  it("neemt ongeveer drie kwart uit de huidige les en de rest uit vroegere lessen", () => {
    for (const id of [2, 3, 4, 5]) {
      let huidig = 0;
      let totaal = 0;
      for (let zaad = 1; zaad <= BEURTEN; zaad++) {
        for (const item of maakExtraBeurt(les(id), vroegere(id), toeval(zaad)).items.flat()) {
          totaal++;
          if (item.uit === "huidig") huidig++;
        }
      }
      const aandeel = huidig / totaal;
      expect(aandeel, `les ${id}`).toBeGreaterThan(0.65);
      expect(aandeel, `les ${id}`).toBeLessThan(0.85);
    }
  });

  it("gebruikt groepjes in les 1 en 2, woorden vanaf les 3 en zinnen vanaf les 4", () => {
    const telt = (id: number) => {
      const l = les(id);
      const soort = { groepjes: 0, woorden: 0, zinnen: 0 };
      for (let zaad = 1; zaad <= 50; zaad++) {
        for (const item of maakExtraBeurt(l, vroegere(id), toeval(zaad)).items.flat()) {
          if (item.uit !== "huidig") continue;
          if (l.zinnen.includes(item.tekst)) soort.zinnen++;
          else if (l.woorden.includes(item.tekst)) soort.woorden++;
          else soort.groepjes++;
        }
      }
      return soort;
    };
    expect(telt(1)).toMatchObject({ woorden: 0, zinnen: 0 });
    expect(telt(2)).toMatchObject({ woorden: 0, zinnen: 0 });
    expect(telt(3).woorden).toBeGreaterThan(0);
    expect(telt(3).zinnen).toBe(0);
    expect(telt(4).zinnen).toBeGreaterThan(0);
    expect(telt(5).zinnen).toBeGreaterThan(0);
  });

  it("geeft elke beurt andere regels", () => {
    const a = maakExtraRegels(les(2), vroegere(2), toeval(1));
    const b = maakExtraRegels(les(2), vroegere(2), toeval(2));
    expect(a).not.toEqual(b);
  });

  it("loopt niet vast als er te weinig items zijn: dan komt een vaste oefenregel van de les", () => {
    const arm: Les = { ...les(1), groepjes: ["fj"], woorden: [], zinnen: [] };
    const regels = maakExtraRegels(arm, [], toeval(1));
    expect(regels).toHaveLength(EXTRA.aantalRegels);
    const vast = les(1).online.flatMap((b) => (b.type === "reeks" ? b.regels : []));
    for (const regel of regels) expect(vast).toContain(regel);
  });
});
