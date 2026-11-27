// Belgisch AZERTY: elke fysieke toets (event.code) met zijn teken,
// de vinger die hem typt en de rij (verdieping van het toetsenbordhuis).
// Bron: vingerverdeling in docs/08-ontwerp-leerlijn-en-les-1.md, deel 3.

export type Vinger =
  | "linkerpink"
  | "linkerring"
  | "linkermiddel"
  | "linkerwijs"
  | "rechterwijs"
  | "rechtermiddel"
  | "rechterring"
  | "rechterpink"
  | "duim";

/** dak = cijferrij, zolder = bovenste rij, woonkamer = thuisrij, kelder = onderste rij */
export type Rij = "dak" | "zolder" | "woonkamer" | "kelder" | "spatie";

export type Kleur = "blauw" | "oranje" | "groen" | "paars" | "grijs";

export interface Toets {
  code: string;
  basis: string;
  shift: string;
  vinger: Vinger;
  rij: Rij;
  bultje?: boolean;
}

type Rijdata = [code: string, basis: string, shift: string, vinger: Vinger][];

const DAK: Rijdata = [
  ["Backquote", "²", "³", "linkerpink"],
  ["Digit1", "&", "1", "linkerpink"],
  ["Digit2", "é", "2", "linkerring"],
  ["Digit3", '"', "3", "linkermiddel"],
  ["Digit4", "'", "4", "linkerwijs"],
  ["Digit5", "(", "5", "linkerwijs"],
  ["Digit6", "§", "6", "rechterwijs"],
  ["Digit7", "è", "7", "rechterwijs"],
  ["Digit8", "!", "8", "rechtermiddel"],
  ["Digit9", "ç", "9", "rechterring"],
  ["Digit0", "à", "0", "rechterpink"],
  ["Minus", ")", "°", "rechterpink"],
  ["Equal", "-", "_", "rechterpink"],
];

const ZOLDER: Rijdata = [
  ["KeyQ", "a", "A", "linkerpink"],
  ["KeyW", "z", "Z", "linkerring"],
  ["KeyE", "e", "E", "linkermiddel"],
  ["KeyR", "r", "R", "linkerwijs"],
  ["KeyT", "t", "T", "linkerwijs"],
  ["KeyY", "y", "Y", "rechterwijs"],
  ["KeyU", "u", "U", "rechterwijs"],
  ["KeyI", "i", "I", "rechtermiddel"],
  ["KeyO", "o", "O", "rechterring"],
  ["KeyP", "p", "P", "rechterpink"],
  ["BracketLeft", "^", "¨", "rechterpink"],
  ["BracketRight", "$", "*", "rechterpink"],
];

const WOONKAMER: Rijdata = [
  ["KeyA", "q", "Q", "linkerpink"],
  ["KeyS", "s", "S", "linkerring"],
  ["KeyD", "d", "D", "linkermiddel"],
  ["KeyF", "f", "F", "linkerwijs"],
  ["KeyG", "g", "G", "linkerwijs"],
  ["KeyH", "h", "H", "rechterwijs"],
  ["KeyJ", "j", "J", "rechterwijs"],
  ["KeyK", "k", "K", "rechtermiddel"],
  ["KeyL", "l", "L", "rechterring"],
  ["Semicolon", "m", "M", "rechterpink"],
  ["Quote", "ù", "%", "rechterpink"],
  ["Backslash", "µ", "£", "rechterpink"],
];

const KELDER: Rijdata = [
  ["IntlBackslash", "<", ">", "linkerpink"],
  ["KeyZ", "w", "W", "linkerpink"],
  ["KeyX", "x", "X", "linkerring"],
  ["KeyC", "c", "C", "linkermiddel"],
  ["KeyV", "v", "V", "linkerwijs"],
  ["KeyB", "b", "B", "linkerwijs"],
  ["KeyN", "n", "N", "rechterwijs"],
  ["KeyM", ",", "?", "rechterwijs"],
  ["Comma", ";", ".", "rechtermiddel"],
  ["Period", ":", "/", "rechterring"],
  ["Slash", "=", "+", "rechterpink"],
];

function maakRij(data: Rijdata, rij: Rij): Toets[] {
  return data.map(([code, basis, shift, vinger]) => ({
    code,
    basis,
    shift,
    vinger,
    rij,
    ...(code === "KeyF" || code === "KeyJ" ? { bultje: true } : {}),
  }));
}

export const RIJEN: { rij: Rij; toetsen: Toets[] }[] = [
  { rij: "dak", toetsen: maakRij(DAK, "dak") },
  { rij: "zolder", toetsen: maakRij(ZOLDER, "zolder") },
  { rij: "woonkamer", toetsen: maakRij(WOONKAMER, "woonkamer") },
  { rij: "kelder", toetsen: maakRij(KELDER, "kelder") },
  { rij: "spatie", toetsen: [{ code: "Space", basis: " ", shift: " ", vinger: "duim", rij: "spatie" }] },
];

export const ALLE_TOETSEN: Toets[] = RIJEN.flatMap((r) => r.toetsen);

const PER_CODE = new Map(ALLE_TOETSEN.map((t) => [t.code, t]));

export function toetsVoorCode(code: string): Toets | undefined {
  return PER_CODE.get(code);
}

/** Welke toets typt dit teken? Werkt voor kleine letters, spatie en tekens met Shift. */
export function toetsVoorTeken(teken: string): { toets: Toets; shift: boolean } | undefined {
  for (const toets of ALLE_TOETSEN) {
    if (toets.basis === teken) return { toets, shift: false };
  }
  for (const toets of ALLE_TOETSEN) {
    if (toets.shift === teken && toets.code !== "Space") return { toets, shift: true };
  }
  return undefined;
}

export function kleurVanVinger(vinger: Vinger): Kleur {
  if (vinger === "duim") return "grijs";
  if (vinger.endsWith("wijs")) return "blauw";
  if (vinger.endsWith("middel")) return "oranje";
  if (vinger.endsWith("ring")) return "groen";
  return "paars";
}

export function handVanVinger(vinger: Vinger): "links" | "rechts" | "beide" {
  if (vinger === "duim") return "beide";
  return vinger.startsWith("links") ? "links" : "rechts";
}
