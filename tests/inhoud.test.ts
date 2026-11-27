import { describe, expect, it } from "vitest";
import { DELEN, LESSEN, t } from "../src/content";
import tekstenNl from "../src/content/nl-BE/teksten.json";
import { controleerRegel } from "../src/logica/regelcheck";

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

  it("voldoet aan de regelcontrole: hoogstens 4 keer dezelfde vinger en 7 letters dezelfde hand na elkaar", () => {
    for (const les of LESSEN) {
      const regels = [...les.groepjes, ...les.woorden, ...les.zinnen];
      for (const blok of les.online) {
        if ("regels" in blok) regels.push(...blok.regels);
        if ("regelsKort" in blok && blok.regelsKort) regels.push(...blok.regelsKort);
        if ("woorden" in blok && blok.woorden) regels.push(...blok.woorden);
      }
      for (const regel of regels) expect(controleerRegel(regel, les.geleerdeToetsen), `les ${les.id}: "${regel}"`).toEqual({ ok: true });
    }
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

  // K26 (projectdocument 14, docs/stijlgids.md deel "Opdrachten en teksten"):
  // elke oefening zegt wat je doet, elk spel zegt waar je naartoe werkt.
  describe("opdrachten en doelzinnen (K26)", () => {
    const zinnen = (tekst: string) => tekst.split(/(?<=[.!?])\s+/).filter((z) => z.trim() !== "");

    it("elke oefening en elk spel heeft een korte opdracht", () => {
      for (const les of LESSEN) {
        for (const blok of les.online) {
          if (!["zoek-toets", "reeks", "spel", "eindoefening"].includes(blok.type)) continue;
          // Twee blokken halen hun opdracht uit teksten.json: het spel "Licht aan"
          // (de opdracht verandert per ronde) en "Klaar voor de start".
          let opdracht = blok.tekst;
          if (blok.type === "spel" && blok.spel === "licht-aan") opdracht = t("lichtaan.opdracht", { rij: "woonkamer" });
          if (blok.type === "eindoefening" && blok.soort === "houding") opdracht = t("houding.opdracht");
          expect(opdracht, `les ${les.id}: ${blok.titel} heeft geen opdracht`).toBeTruthy();
          expect(zinnen(opdracht!).length, `les ${les.id}: ${blok.titel}: hoogstens drie korte zinnen`).toBeLessThanOrEqual(3);
        }
      }
    });

    it("elk spel heeft een doelzin: waar werk je naartoe", () => {
      for (const les of LESSEN) {
        for (const blok of les.online) {
          if (blok.type !== "spel") continue;
          expect(blok.doel?.trim(), `les ${les.id}: ${blok.titel} heeft geen doelzin`).toBeTruthy();
          expect(zinnen(blok.doel).length, `les ${les.id}: ${blok.titel}: doelzin te lang`).toBeLessThanOrEqual(3);
        }
      }
    });

    it("gebruikt nooit \"terug naar huis\": het huis is het hele toetsenbord", () => {
      const alles = JSON.stringify(LESSEN) + JSON.stringify(tekstenNl);
      expect(alles).not.toMatch(/terug naar huis/i);
    });
  });
});
