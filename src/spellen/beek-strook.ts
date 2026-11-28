// De strook van "Over de beek": de prent van het spel, die ook toont hoe ver
// je bent. De app tekent ze zelf, in de klare lijn van de prenten (dunne zwarte
// lijn, egale vlakken; docs/stijlgids.md, deel 7 en 8).
//
// Drie lagen, van achter naar voor:
//   1. de achtergrond: lucht, heuvel met knotwilgen, beek, twee oevers, het huis;
//   2. de stenen: 3 rijen van 12, een per toets;
//   3. Fien en Jef: tijdens het spel op de linkeroever, op het einde bij hun huis.
//
// Later een prent uit een beeldgenerator gebruiken? Vervang dan alleen laag 1
// door een <image> met dezelfde maat (BREEDTE x HOOGTE), en pas hieronder de
// plaats van de stenen (RIJEN, EERSTE_X, LAATSTE_X) en van de figuren aan. De
// stenen, de figuren en het spel zelf blijven werken.
//
// Er beweegt niets: een steen ligt er of ligt er niet. Fien en Jef staan stil;
// ze wisselen een keer van oever, op het einde.

import { t } from "../content";
import { svg } from "../weergave/dom";
import fienZwaai from "../beelden/fien-zwaai.png";
import jefZwaai from "../beelden/jef-zwaai.png";

export const BREEDTE = 1270;
export const HOOGTE = 150;

/** de hoogte (y) van de drie rijen stenen in het water, van ver naar dichtbij */
const RIJEN = [99, 117, 136];
/** elke rij ligt iets verder naar rechts dan de vorige: de beek loopt schuin */
const RIJ_VERSCHUIVING = 8;
const EERSTE_X = 244;
const LAATSTE_X = 792;

const LIJN = "#1f1f1f";

export interface BeekStrook {
  element: SVGSVGElement;
  /** zoveel stenen liggen er al; de volgende plaats krijgt een donkere rand */
  zetStenen(gelegd: number): void;
  /** het einde: alle stenen liggen er, Fien en Jef staan bij hun huis */
  toonThuis(): void;
}

/** Laag 1. Alles wat nooit verandert. De vlakken lopen ver door buiten het
 *  kader, zodat de strook ook op een smaller of lager scherm gevuld blijft. */
const ACHTERGROND = `
<rect x="-3000" y="-600" width="7270" height="700" fill="#d9edfb"/>
<g fill="#ffffff" stroke="${LIJN}" stroke-width="1.2" stroke-linejoin="round">
  <path d="M286 30 a9 9 0 0 1 12-10 a12 12 0 0 1 22-3 a10 10 0 0 1 16 5 a8 8 0 0 1 4 8 z"/>
  <path d="M700 22 a8 8 0 0 1 11-8 a11 11 0 0 1 20-2 a9 9 0 0 1 14 5 a7 7 0 0 1 3 5 z"/>
</g>
<path d="M-3000 62 L0 60 C150 46 300 40 470 50 C620 59 760 62 900 54 C1040 46 1180 50 1270 56 L4270 58 L4270 90 L-3000 90 Z" fill="#cde09a" stroke="${LIJN}" stroke-width="1.2"/>
<g stroke="${LIJN}" stroke-width="1.1" stroke-linejoin="round">
  <g transform="translate(352 47) scale(0.82)"><path d="M-4 -20 C-24 -23 -27 -43 -14 -52 C-7 -60 7 -60 14 -52 C27 -43 24 -23 4 -20 Z" fill="#cdd46a"/><path d="M0 -21 L-13 -42 M0 -21 L-6 -51 M0 -21 L6 -51 M0 -21 L13 -42" fill="none" stroke-width=".8"/><path d="M-5 0 L-5 -12 C-9 -15 -8 -22 0 -23 C8 -22 9 -15 5 -12 L5 0 Z" fill="#a9825a"/></g>
  <g transform="translate(398 45) scale(0.92)"><path d="M-4 -20 C-24 -23 -27 -43 -14 -52 C-7 -60 7 -60 14 -52 C27 -43 24 -23 4 -20 Z" fill="#cdd46a"/><path d="M0 -21 L-13 -42 M0 -21 L-6 -51 M0 -21 L6 -51 M0 -21 L13 -42" fill="none" stroke-width=".8"/><path d="M-5 0 L-5 -12 C-9 -15 -8 -22 0 -23 C8 -22 9 -15 5 -12 L5 0 Z" fill="#a9825a"/></g>
  <g transform="translate(446 47) scale(0.82)"><path d="M-4 -20 C-24 -23 -27 -43 -14 -52 C-7 -60 7 -60 14 -52 C27 -43 24 -23 4 -20 Z" fill="#cdd46a"/><path d="M0 -21 L-13 -42 M0 -21 L-6 -51 M0 -21 L6 -51 M0 -21 L13 -42" fill="none" stroke-width=".8"/><path d="M-5 0 L-5 -12 C-9 -15 -8 -22 0 -23 C8 -22 9 -15 5 -12 L5 0 Z" fill="#a9825a"/></g>
</g>
<rect x="-3000" y="78" width="7270" height="700" fill="#7fc5f7"/>
<path d="M-3000 78 H4270" stroke="${LIJN}" stroke-width="1.2"/>
<g fill="none" stroke="#ffffff" stroke-opacity=".75" stroke-width="1.4" stroke-linecap="round">
  <path d="M232 88 q7 -3 14 0"/><path d="M520 86 q7 -3 14 0"/><path d="M812 90 q6 -3 12 0"/>
  <path d="M226 146 q7 -3 14 0"/><path d="M830 144 q6 -3 12 0"/>
</g>
<path d="M190 78 C218 96 188 124 216 150 L218 760" fill="none" stroke="#c9a56c" stroke-width="7"/>
<path d="M858 78 C826 98 858 126 828 150 L826 760" fill="none" stroke="#c9a56c" stroke-width="7"/>
<path d="M-3000 78 H186 C214 96 184 124 212 150 L214 760 H-3000 Z" fill="#b5cd72" stroke="${LIJN}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M4270 78 H862 C830 98 862 126 832 150 L830 760 H4270 Z" fill="#b5cd72" stroke="${LIJN}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M843 112 C900 104 990 112 1052 124 L1078 124 C1050 138 930 146 836 142 C842 133 846 121 843 112 Z" fill="#f7ddaa" stroke="${LIJN}" stroke-width="1.2" stroke-linejoin="round"/>
<g transform="translate(1124 30)" stroke="${LIJN}" stroke-width="1.1" stroke-linejoin="round">
  <path d="M-4 52 L-5 22 L5 22 L4 52 Z" fill="#a9825a"/>
  <path d="M0 26 C-30 28 -40 6 -27 -6 C-30 -22 -8 -30 2 -22 C16 -32 38 -20 32 -4 C44 8 30 28 0 26 Z" fill="#8fb556"/>
</g>
<path d="M1118 96 H1196 a5 5 0 0 1 5 5 V124 H1113 V101 a5 5 0 0 1 5 -5 Z" fill="#6f9a47" stroke="${LIJN}" stroke-width="1.2" stroke-linejoin="round"/>
<g transform="translate(1000 4)" stroke="${LIJN}" stroke-width="1.25" stroke-linejoin="round">
  <ellipse cx="14" cy="112" rx="13" ry="10" fill="#86ac4e"/>
  <ellipse cx="117" cy="113" rx="12" ry="9" fill="#86ac4e"/>
  <rect x="84" y="9" width="14" height="27" fill="#c9774a"/>
  <rect x="82" y="5" width="18" height="5" fill="#c9774a"/>
  <path d="M14 64 L65 18 L116 64 V120 H14 Z" fill="#fbe8d2"/>
  <rect x="14" y="107" width="102" height="13" fill="#cbc5ba"/>
  <path d="M3 68 L65 9 L127 68 L119 73 L65 22 L11 73 Z" fill="#e0683a"/>
  <rect x="56" y="40" width="18" height="16" fill="#6a9bd1"/>
  <path d="M65 40 V56 M56 48 H74" stroke-width="1"/>
  <rect x="54" y="56" width="22" height="3" fill="#cbc5ba"/>
  <rect x="24" y="76" width="18" height="20" fill="#6a9bd1"/>
  <rect x="88" y="76" width="18" height="20" fill="#6a9bd1"/>
  <path d="M33 76 V96 M24 86 H42 M97 76 V96 M88 86 H106" stroke-width="1"/>
  <rect x="18" y="76" width="6" height="20" fill="#7fa24a"/><rect x="42" y="76" width="6" height="20" fill="#7fa24a"/>
  <rect x="82" y="76" width="6" height="20" fill="#7fa24a"/><rect x="106" y="76" width="6" height="20" fill="#7fa24a"/>
  <rect x="22" y="96" width="22" height="3" fill="#cbc5ba"/><rect x="86" y="96" width="22" height="3" fill="#cbc5ba"/>
  <rect x="26" y="110" width="14" height="7" fill="#6a9bd1"/>
  <rect x="52" y="72" width="26" height="5" fill="#cbc5ba"/>
  <rect x="55" y="77" width="20" height="38" fill="#c98a4b"/>
  <path d="M61 77 V115 M69 77 V115" stroke-width=".8" stroke-opacity=".5"/>
  <circle cx="71.5" cy="97" r="1.4" fill="${LIJN}" stroke="none"/>
  <rect x="51" y="115" width="28" height="6" fill="#cbc5ba"/>
</g>`;

/** waar Fien en Jef staan: [x van Fien, x van Jef], met hun voeten op y = 142 */
const PLAATS_START = [62, 116];
const PLAATS_THUIS = [884, 938];
const FIGUUR_HOOGTE = 120;
const FIGUUR_VOETEN = 142;

function plaatsVanSteen(nummer: number, perRij: number): { x: number; y: number } {
  const rij = Math.floor(nummer / perRij);
  const kolom = nummer % perRij;
  const stap = (LAATSTE_X - EERSTE_X) / (perRij - 1);
  return { x: EERSTE_X + kolom * stap + (rij - 1) * RIJ_VERSCHUIVING, y: RIJEN[rij] ?? RIJEN[RIJEN.length - 1] };
}

/** Een platte stapsteen: een bovenkant, met eronder een donkere rand (de dikte). */
function steen(x: number, y: number, toestand: "gelegd" | "nu" | "later"): SVGElement {
  if (toestand === "later") {
    // waar nog een steen komt: een dun stippellijntje op het water
    return svg("ellipse", { cx: x, cy: y, rx: 18, ry: 6, class: "beek-steen-later" });
  }
  if (toestand === "nu") {
    // de plaats van de volgende steen: een donkere rand, niet blauw (blauw is de wijsvinger)
    return svg("ellipse", { cx: x, cy: y, rx: 19.5, ry: 6.8, class: "beek-steen-nu" });
  }
  return svg(
    "g",
    { class: "beek-steen" },
    svg("ellipse", { cx: x, cy: y + 2.4, rx: 19.5, ry: 6.8, class: "beek-steen-rand" }),
    svg("ellipse", { cx: x, cy: y, rx: 19.5, ry: 6.8, class: "beek-steen-boven" }),
  );
}

// Breedte gedeeld door hoogte van de zwaaiprenten (scripts/maak-figuren.py):
// pas ze aan als de prenten veranderen.
const FIEN_BREEDTE = 271 / 720;
const JEF_BREEDTE = 291 / 720;

/**
 * Het midden tussen Fien en Jef, als deel van de breedte van de strook: daar
 * wijst het staartje van de tekstballon naar (sjabloon.ts).
 */
function middenVan([xFien, xJef]: number[]): number {
  const links = xFien;
  const rechts = xJef + FIGUUR_HOOGTE * JEF_BREEDTE;
  return (links + rechts) / 2 / BREEDTE;
}
export const BEEK_FIGUREN = { start: middenVan(PLAATS_START), einde: middenVan(PLAATS_THUIS) };

export function beekStrook(aantal: number, perRij: number): BeekStrook {
  const stenen = svg("g", {});
  const figuren = svg("g", {});
  const achtergrond = svg("g", {});
  achtergrond.innerHTML = ACHTERGROND;

  const element = svg(
    "svg",
    { class: "strook beek-strook", viewBox: `0 0 ${BREEDTE} ${HOOGTE}`, preserveAspectRatio: "xMidYMid meet", role: "img" },
    achtergrond,
    stenen,
    figuren,
  );

  function zetFiguren([xFien, xJef]: number[]): void {
    const y = FIGUUR_VOETEN - FIGUUR_HOOGTE;
    figuren.replaceChildren(
      // een schaduw onder de voeten, zoals op de prenten
      svg("ellipse", { cx: xFien + 26, cy: FIGUUR_VOETEN - 2, rx: 27, ry: 4.5, class: "beek-schaduw" }),
      svg("ellipse", { cx: xJef + 24, cy: FIGUUR_VOETEN - 2, rx: 26, ry: 4.5, class: "beek-schaduw" }),
      svg("image", { href: fienZwaai, x: xFien, y, height: FIGUUR_HOOGTE, width: FIGUUR_HOOGTE * FIEN_BREEDTE }),
      svg("image", { href: jefZwaai, x: xJef, y, height: FIGUUR_HOOGTE, width: FIGUUR_HOOGTE * JEF_BREEDTE }),
    );
  }

  function zetStenen(gelegd: number, metVolgende = true): void {
    stenen.replaceChildren(
      ...Array.from({ length: aantal }, (_, i) => {
        const { x, y } = plaatsVanSteen(i, perRij);
        return steen(x, y, i < gelegd ? "gelegd" : i === gelegd && metVolgende ? "nu" : "later");
      }),
    );
    element.setAttribute("aria-label", t("beek.strook", { gelegd: Math.min(gelegd, aantal), totaal: aantal }));
  }

  zetFiguren(PLAATS_START);
  zetStenen(0);

  return {
    element,
    zetStenen: (gelegd) => zetStenen(gelegd),
    toonThuis() {
      zetStenen(aantal, false);
      zetFiguren(PLAATS_THUIS);
      element.setAttribute("aria-label", t("beek.thuis"));
    },
  };
}
