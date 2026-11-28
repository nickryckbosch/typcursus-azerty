import { describe, expect, it } from "vitest";
import { DELEN, LESSEN, t } from "../src/content";
import type { Blok } from "../src/content/types";
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
    expect(aantal).toBe(261);
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

  // Een intro heeft een tekst (in een tekstballon), of de velden van de intro
  // in stukken: tekstBoven, fien, jef en tekstOnder (docs/stijlgids.md, deel 10).
  it("heeft in elke les een intro met een tekst of met volledige stukken", () => {
    for (const les of LESSEN) {
      const intros = les.online.filter((b) => b.type === "intro");
      expect(intros.length, `les ${les.id}`).toBeGreaterThan(0);
      for (const blok of intros) {
        const waar = `les ${les.id}: ${blok.titel}`;
        const stukken = [blok.tekstBoven, blok.fien, blok.jef, blok.tekstOnder];
        if (stukken.every((x) => x === undefined)) {
          expect(blok.tekst?.trim(), `${waar}: geen tekst`).toBeTruthy();
          continue;
        }
        // in stukken: Fien en Jef zeggen elk iets, en er is geen tweede tekst ernaast
        expect(blok.fien?.trim(), `${waar}: fien ontbreekt`).toBeTruthy();
        expect(blok.jef?.trim(), `${waar}: jef ontbreekt`).toBeTruthy();
        expect(blok.tekst, `${waar}: tekst en stukken samen`).toBeUndefined();
        expect(Array.isArray(blok.tekstBoven) && blok.tekstBoven.length, `${waar}: tekstBoven`).toBeTruthy();
        expect(blok.tekstBoven!.length, `${waar}: hoogstens twee regels bovenaan`).toBeLessThanOrEqual(2);
        for (const zin of blok.tekstBoven!) expect(zin.trim(), `${waar}: lege regel in tekstBoven`).toBeTruthy();
        expect(blok.tekstOnder?.trim(), `${waar}: tekstOnder`).toBeTruthy();
        // een tekstballon naast een figuur is smal: een korte zin
        for (const zin of [blok.fien!, blok.jef!]) expect(zin.length, `${waar}: "${zin}" is te lang voor een tekstballon`).toBeLessThanOrEqual(60);
      }
    }
  });

  it("heeft een eindoefening met doel 90% in les 1 tot 5", () => {
    for (const les of LESSEN.filter((l) => l.id > 0)) {
      const eind = les.online.find((b) => b.type === "eindoefening");
      expect(eind && "doelNauwkeurigheid" in eind ? eind.doelNauwkeurigheid : null).toBe(0.9);
    }
  });

  // Les 0 is de oriëntatieles in het klein (docs/beslissingen.md, 12u): dezelfde
  // stappen, in dezelfde volgorde.
  describe("les 0: de oriëntatieles in het klein", () => {
    const les0 = LESSEN[0];
    const blok = <T extends Blok["type"]>(type: T) => les0.online.find((b) => b.type === type) as Extract<Blok, { type: T }>;

    it("heeft acht stappen in de volgorde van de oriëntatieles, samen ongeveer 7 minuten", () => {
      expect(les0.online.map((b) => b.type)).toEqual(["intro", "houding", "toetsenbordcheck", "spel", "toetsenjacht", "bultjes", "tik", "afsluiter"]);
      const duur = les0.online.reduce((som, b) => som + b.duurMinuten, 0);
      expect(duur).toBeGreaterThanOrEqual(6.5);
      expect(duur).toBeLessThanOrEqual(7.5);
    });

    it("meet niets: geen eindoefening, geen lamp", () => {
      expect(les0.online.some((b) => b.type === "eindoefening" || b.type === "zoek-toets")).toBe(false);
    });

    it("Goed zitten: drie kaartjes", () => {
      expect(blok("houding").kaartjes).toHaveLength(3);
    });

    it("Licht aan: 6 rondes", () => {
      expect(blok("spel").rondes).toBe(6);
    });

    it("Toetsenjacht: vier toetsen met naam en zin, daarna dezelfde vier door elkaar", () => {
      const jacht = blok("toetsenjacht");
      expect(jacht.naamtoetsen.map((x) => x.toets)).toEqual(["spatie", "enter", "backspace", "shift"]);
      for (const x of jacht.naamtoetsen) {
        expect(x.naam.trim()).toBeTruthy();
        expect(x.zin.trim()).toBeTruthy();
      }
      expect([...jacht.herhaling].sort()).toEqual(["backspace", "enter", "shift", "spatie"]);
    });

    it("Toetsenjacht: de laatste gevraagde toets is nooit Enter (anders slaat die Enter het slot over)", () => {
      expect(blok("toetsenjacht").herhaling.at(-1)).not.toBe("enter");
    });

    it("Links, rechts, duim: twaalf keer, elke vinger vier keer", () => {
      const volgorde = blok("tik").volgorde;
      expect(volgorde).toHaveLength(12);
      for (const kant of ["links", "rechts", "duim"]) expect(volgorde.filter((k) => k === kant)).toHaveLength(4);
    });

    it("noemt de letters f en j nog niet: dat doet les 1", () => {
      for (const b of [blok("bultjes"), blok("tik"), blok("afsluiter")]) {
        expect(JSON.stringify(b)).not.toMatch(/\b(de|een|letter) [fj]\b/i);
        expect(JSON.stringify(b)).not.toMatch(/\[[fj]\]/i);
      }
    });
  });

  // K26 (projectdocument 14, docs/stijlgids.md deel "Opdrachten en teksten"):
  // elke oefening zegt wat je doet, elk spel zegt waar je naartoe werkt.
  describe("opdrachten en doelzinnen (K26)", () => {
    const zinnen = (tekst: string) => tekst.split(/(?<=[.!?])\s+/).filter((z) => z.trim() !== "");

    it("elke oefening en elk spel heeft een korte opdracht", () => {
      for (const les of LESSEN) {
        for (const blok of les.online) {
          if (!["zoek-toets", "reeks", "spel", "eindoefening", "houding", "toetsenjacht", "bultjes", "tik"].includes(blok.type)) continue;
          // Een blok haalt zijn opdracht uit teksten.json: het spel "Licht aan"
          // (de opdracht verandert per ronde).
          let opdracht = blok.tekst;
          if (blok.type === "spel" && blok.spel === "licht-aan") opdracht = t("lichtaan.opdracht", { rij: "woonkamer" });
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

    it("elke stap van de oriëntatieles (les 0) heeft een slotzin: wat kan je nu", () => {
      for (const les of LESSEN) {
        for (const blok of les.online) {
          if (blok.type !== "toetsenjacht" && blok.type !== "bultjes" && blok.type !== "tik") continue;
          expect(blok.slot.trim(), `les ${les.id}: ${blok.titel} heeft geen slotzin`).toBeTruthy();
          expect(zinnen(blok.slot).length, `les ${les.id}: ${blok.titel}: slotzin te lang`).toBeLessThanOrEqual(3);
        }
      }
    });

    it("gebruikt nooit \"terug naar huis\": het huis is het hele toetsenbord", () => {
      const alles = JSON.stringify(LESSEN) + JSON.stringify(tekstenNl);
      expect(alles).not.toMatch(/terug naar huis/i);
    });
  });
});
