// Staat het toestel op Belgisch AZERTY?
//
// Werkwijze (docs/11-lessen-data.md, les 0):
// 1. Vraag de indeling op aan de browser (navigator.keyboard.getLayoutMap,
//    werkt in Chrome). De fysieke toets KeyQ geeft "a" op AZERTY, en
//    Digit6 geeft "§" op Belgisch en "-" op Frans AZERTY.
// 2. Lukt dat niet, dan drukt het kind op de toets met de A en op de 6.

export type Indeling = "belgisch" | "frans" | "qwerty" | "anders";

export interface IndelingKaart {
  get(code: string): string | undefined;
}

export function beoordeelKaart(kaart: IndelingKaart): Indeling | null {
  const q = kaart.get("KeyQ");
  const zes = kaart.get("Digit6");
  if (q === undefined || zes === undefined) return null;
  return beoordeel(q, zes);
}

/**
 * @param letterA wat de toets op de plaats van de A (code KeyQ) geeft
 * @param zes wat de toets met de 6 geeft zonder Shift
 */
export function beoordeel(letterA: string, zes: string): Indeling {
  const a = letterA.toLowerCase();
  if (a === "q") return "qwerty";
  if (a !== "a") return "anders";
  if (zes === "§") return "belgisch";
  if (zes === "-") return "frans";
  return "anders";
}

/**
 * Het kind drukte op de toets met de A erop. Op een Belgisch toetsenbord is
 * dat de fysieke toets KeyQ en geeft hij "a". Geeft hij iets anders, dan staat
 * het toestel op een andere indeling.
 */
export function stapA(key: string): "ok" | "fout" {
  return key.toLowerCase() === "a" ? "ok" : "fout";
}

/** Het kind drukte op de 6 zonder Shift. */
export function stapZes(key: string): "belgisch" | "frans" | "anders" {
  if (key === "§") return "belgisch";
  if (key === "-") return "frans";
  return "anders";
}

/**
 * Tijdens het typen: verraadt deze aanslag een verkeerde indeling?
 * Op AZERTY geeft de fysieke toets KeyQ nooit een q, en KeyA nooit een a.
 */
export function verraadtVerkeerdeIndeling(code: string, key: string): boolean {
  const k = key.toLowerCase();
  return (code === "KeyQ" && k === "q") || (code === "KeyA" && k === "a") || (code === "KeyW" && k === "w");
}

interface KeyboardMetLayoutMap {
  getLayoutMap(): Promise<IndelingKaart>;
}

/** Vraag de indeling op aan de browser. Geeft null als dat niet kan. */
export async function vraagIndelingOp(): Promise<Indeling | null> {
  try {
    const kb = (navigator as unknown as { keyboard?: KeyboardMetLayoutMap }).keyboard;
    if (!kb?.getLayoutMap) return null;
    const kaart = await kb.getLayoutMap();
    return beoordeelKaart(kaart);
  } catch {
    return null;
  }
}
