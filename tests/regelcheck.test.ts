import { describe, expect, it } from "vitest";
import { handVanVinger } from "../src/logica/indeling";
import { controleerRegel } from "../src/logica/regelcheck";

const THUISRIJ = [..."qsdfghjklm "];

describe("regelcontrole (het controlescript)", () => {
  it("weet welke hand een vinger is", () => {
    expect(handVanVinger("linkerwijs")).toBe("links");
    expect(handVanVinger("linkerpink")).toBe("links");
    expect(handVanVinger("rechterring")).toBe("rechts");
    expect(handVanVinger("duim")).toBe("beide");
  });

  it("laat alleen geleerde toetsen toe", () => {
    expect(controleerRegel("fj jf", ["f", "j", " "]).ok).toBe(true);
    expect(controleerRegel("fd jf", ["f", "j", " "])).toEqual({ ok: false, reden: '"d" is nog niet geleerd' });
    // De spatie moet ook geleerd zijn.
    expect(controleerRegel("f j", ["f", "j"]).ok).toBe(false);
  });

  it("laat hoogstens vier aanslagen na elkaar met dezelfde vinger toe", () => {
    expect(controleerRegel("ffff", THUISRIJ).ok).toBe(true);
    expect(controleerRegel("fffff", THUISRIJ).ok).toBe(false);
    // f en g zijn allebei de linkerwijsvinger.
    expect(controleerRegel("fgfg", THUISRIJ).ok).toBe(true);
    expect(controleerRegel("fgfgf", THUISRIJ).ok).toBe(false);
    // Een andere vinger ertussen: de telling begint opnieuw.
    expect(controleerRegel("ffffjffff", THUISRIJ).ok).toBe(true);
  });

  it("laat hoogstens zeven letters na elkaar met dezelfde hand toe", () => {
    expect(controleerRegel("sdfsdfs", THUISRIJ).ok).toBe(true);
    expect(controleerRegel("sdfsdfsd", THUISRIJ).ok).toBe(false);
    expect(controleerRegel("sdfsdfsj", THUISRIJ).ok).toBe(true);
  });

  it("de spatie onderbreekt een reeks", () => {
    expect(controleerRegel("fff fff", THUISRIJ).ok).toBe(true);
    expect(controleerRegel("sdfsdfs dfs", THUISRIJ).ok).toBe(true);
  });
});
