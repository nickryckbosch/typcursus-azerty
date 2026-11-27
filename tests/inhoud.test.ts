import { describe, expect, it } from "vitest";
import { DELEN, LESSEN } from "../src/content";

// Dezelfde controle als in docs/11-lessen-data.md: elk item bevat alleen
// geleerde toetsen plus de spatie.
describe("lesinhoud", () => {
  it("bevat les 0 tot 5 in volgorde", () => {
    expect(LESSEN.map((l) => l.id)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("gebruikt alleen geleerde toetsen", () => {
    let aantal = 0;
    for (const les of LESSEN) {
      const geleerd = new Set(les.geleerdeToetsen);
      const items = [...les.groepjes, ...les.woorden, ...les.zinnen];
      for (const blok of les.online) {
        if ("regels" in blok) items.push(...blok.regels);
        if ("regelsKort" in blok && blok.regelsKort) items.push(...blok.regelsKort);
        if ("toetsen" in blok) items.push(...blok.toetsen);
        if ("tekens" in blok) items.push(...blok.tekens);
        if ("woorden" in blok && blok.woorden) items.push(...blok.woorden);
      }
      for (const item of items) {
        aantal++;
        for (const teken of item) expect(geleerd.has(teken), `les ${les.id}: "${item}"`).toBe(true);
      }
    }
    expect(aantal).toBe(262);
  });

  it("zet elke les in precies een deel van het toetsenbordhuis", () => {
    const inDelen = DELEN.flatMap((d) => d.lessen).sort((a, b) => a - b);
    expect(inDelen).toEqual(LESSEN.map((l) => l.id));
    expect(DELEN.map((d) => d.nummer)).toEqual(DELEN.map((_, i) => i + 1));
  });

  it("heeft een tip bij elk oefenblok en elke eindoefening van les 1 tot 5, en een begroeting per les", () => {
    for (const les of LESSEN) {
      expect(les.begroeting, `les ${les.id}`).toBeTruthy();
      if (les.id === 0) continue;
      for (const blok of les.online) {
        if (blok.type === "reeks" || blok.type === "eindoefening") expect(blok.tip, `les ${les.id}: ${blok.titel}`).toBeTruthy();
      }
    }
  });

  it("beschrijft geen beweging in de spelletjes (K16)", () => {
    for (const les of LESSEN) {
      for (const blok of les.online) {
        if (blok.type !== "spel" || !blok.beschrijving) continue;
        expect(blok.beschrijving, `les ${les.id}: ${blok.titel}`).not.toMatch(/wiebel|schud|spring|rolt|glijdt|vliegt|knippert en/);
      }
    }
  });

  it("heeft een eindoefening met doel 90% in les 1 tot 5", () => {
    for (const les of LESSEN.filter((l) => l.id > 0)) {
      const eind = les.online.find((b) => b.type === "eindoefening");
      expect(eind && "doelNauwkeurigheid" in eind ? eind.doelNauwkeurigheid : null).toBe(0.9);
    }
  });
});
