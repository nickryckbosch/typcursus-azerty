import { describe, expect, it } from "vitest";
import { schaalVoor } from "../src/logica/schaal";

describe("schalen als een dia", () => {
  it("is 1 op de ontwerpmaat", () => {
    expect(schaalVoor(1366, 768)).toBe(1);
  });

  it("wordt nooit kleiner dan 1: een Chromebook met adresbalk blijft zoals het is", () => {
    expect(schaalVoor(1366, 650)).toBe(1);
    expect(schaalVoor(1280, 600)).toBe(1);
    expect(schaalVoor(1024, 768)).toBe(1);
    // breder maar niet hoger, of hoger maar niet breder: ook geen schaal
    expect(schaalVoor(1920, 700)).toBe(1);
    expect(schaalVoor(1366, 1000)).toBe(1);
  });

  it("vult een groter venster in dezelfde verhouding", () => {
    expect(schaalVoor(2732, 1536)).toBe(2);
    expect(schaalVoor(1920, 1080)).toBeCloseTo(1920 / 1366, 6);
    // 2560 x 1300: de hoogte bepaalt de schaal, links en rechts blijft er achtergrond
    expect(schaalVoor(2560, 1300)).toBeCloseTo(1300 / 768, 6);
  });

  it("geeft 1 bij een onbekende maat", () => {
    expect(schaalVoor(0, 0)).toBe(1);
    expect(schaalVoor(Number.NaN, 768)).toBe(1);
  });
});
