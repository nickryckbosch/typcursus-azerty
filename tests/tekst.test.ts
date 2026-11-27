import { describe, expect, it } from "vitest";
import { zonderOpmaak } from "../src/weergave/tekst";

describe("tekst met toetsen", () => {
  it("haalt de opmaak weg om voor te lezen", () => {
    expect(zonderOpmaak("Druk op [spatie] als de lamp aangaat.")).toBe("Druk op spatie als de lamp aangaat.");
    expect(zonderOpmaak("Druk op [Enter ↵] om verder te gaan.")).toBe("Druk op Enter om verder te gaan.");
    expect(zonderOpmaak("Een toets van de **zolder**.")).toBe("Een toets van de zolder.");
  });
});
