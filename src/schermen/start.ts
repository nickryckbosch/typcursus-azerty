// Startscherm (K18): bovenaan de titel en de startzin, links Fien en Jef met
// een tekstballon, rechts de kaart "Verder waar je was" en daaronder "Alle
// lessen", met een tabblad per deel van het toetsenbordhuis en een compacte
// rij per les. De delen komen uit src/content/nl-BE/delen.json: een deel
// toevoegen is daar een stukje tekst, geen code.

import type { App, Scherm } from "../app";
import { DELEN, t, type TekstSleutel } from "../content";
import type { Deel, Les } from "../content/types";
import { isBeschikbaar } from "../blokken";
import { heeftExtraOefenen } from "../logica/extraoefenen";
import { kleurVanVinger, toetsVoorTeken } from "../logica/indeling";
import { isExtraOpen, isLesOpen, legeLesVoortgang, lesAanDeBeurt } from "../logica/voortgang";
import { el, svg } from "../weergave/dom";
import { fien, jef, slotje, sterIcoon, vinkje } from "../weergave/figuren";
import { voorleesKnop } from "../weergave/kop";
import { tekenTonen } from "../weergave/tekens";

type Toestand = "klaar" | "nu" | "slot" | "binnenkort";

/** Een kleine toets met de streep van zijn vinger, zoals op het schermtoetsenbord. */
function toetsChip(teken: string, klasse = ""): HTMLElement {
  const vinger = toetsVoorTeken(teken)?.toets.vinger;
  return el(
    "span",
    { class: `chip ${vinger ? `kleur-${kleurVanVinger(vinger)}` : ""} ${teken === " " ? "chip-spatie" : ""} ${klasse}` },
    tekenTonen(teken),
  );
}

/**
 * Het merkteken van Tokkeldorp: een huisje met onder het dak de toetsen f en j
 * (waar Fien en Jef wonen), in de klare lijn van het huis uit les 0.
 */
function merkteken(): SVGSVGElement {
  const toets = (x: number, letter: string) => [
    svg("rect", { x, y: 27, width: 21, height: 22, rx: 5, class: "merk-toets-rand" }),
    svg("rect", { x, y: 25, width: 21, height: 20.5, rx: 5, class: "merk-toets" }),
    svg("text", { x: x + 10.5, y: 35.5, "text-anchor": "middle", "dominant-baseline": "central", class: "merk-letter" }, letter),
  ];
  return svg(
    "svg",
    { class: "merkteken", viewBox: "0 0 62 52", "aria-hidden": "true" },
    svg("rect", { x: 43, y: 5, width: 7, height: 12, class: "merk-schouw" }),
    svg("polygon", { points: "3,23 31,3 59,23", class: "merk-dak" }),
    ...toets(8, "f"),
    ...toets(33, "j"),
  );
}

/** "Nieuwe letters voor je middelvingers": afgeleid uit de vingers van de nieuwe toetsen. */
function nieuwVoor(les: Les): string {
  const kleuren = new Set(les.nieuweToetsen.map((x) => toetsVoorTeken(x)?.toets.vinger).map((v) => (v ? kleurVanVinger(v) : "")));
  const sleutel = kleuren.size === 1 ? `start.nieuw.${[...kleuren][0]}` : "start.nieuw.gemengd";
  return t(sleutel as TekstSleutel);
}

export function startScherm(app: App, wortel: HTMLElement): Scherm {
  const volgorde = app.lessen.map((l) => l.id);
  const lv = (les: Les) => app.voortgang.lessen[String(les.id)] ?? legeLesVoortgang();
  const vorigeVan = (les: Les): Les | undefined => app.lessen[app.lessen.indexOf(les) - 1];

  function toestand(les: Les): Toestand {
    if (!isBeschikbaar(les)) return "binnenkort";
    if (lv(les).afgewerkt) return "klaar";
    return isLesOpen(app.voortgang, les.id, volgorde) ? "nu" : "slot";
  }

  /** Extra oefenen (K15): open zodra de les een keer tot het einde gedaan is. Les 0 heeft er geen. */
  const magExtra = (les: Les) => heeftExtraOefenen(les) && isExtraOpen(app.voortgang, les.id);

  const beurtId = lesAanDeBeurt(app.voortgang, volgorde);
  const beurt = app.lessen.find((l) => l.id === beurtId);

  // ---------- kaart "Verder waar je was" ----------

  function verderKaart(): HTMLElement {
    const knoppen: HTMLElement[] = [];
    let inhoud: (Node | null)[];
    if (!beurt) {
      inhoud = [el("h2", { class: "verder-titel" }, t("start.allesKlaar")), el("p", { class: "verder-uitleg" }, t("start.allesKlaarUitleg"))];
    } else {
      const staat = toestand(beurt);
      const bezig = lv(beurt).bezigBij;
      inhoud = [
        el("h2", { class: "verder-titel" }, t("les.kop", { nummer: beurt.id, titel: beurt.titel })),
        el(
          "div",
          { class: "verder-toetsen" },
          ...beurt.nieuweToetsen.map((x) => toetsChip(x, "chip-groot")),
          el("span", { class: "verder-uitleg" }, staat === "binnenkort" ? t("start.binnenkort") : nieuwVoor(beurt)),
        ),
        bezig !== null && staat === "nu"
          ? el("p", { class: "verder-bezig" }, t("les.bezig", { nummer: bezig + 1, totaal: beurt.online.length }))
          : null,
      ];
      if (staat === "nu") {
        knoppen.push(
          el(
            "button",
            { class: "knop knop-hoofd knop-start", type: "button", onclick: () => app.naarLes(beurt) },
            t("knop.startLes"),
            svg("svg", { class: "icoon", viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": "true" }, svg("path", { d: "M9 6l6 6-6 6" })),
          ),
        );
      }
    }
    // "Extra oefenen bij les X": de les die aan de beurt is als ze al eens tot het
    // einde gedaan is, anders de laatste les ervoor waar extra oefenen open is.
    const plaats = beurt ? app.lessen.indexOf(beurt) : app.lessen.length - 1;
    const extraLes = app.lessen.slice(0, plaats + 1).reverse().find(magExtra);
    if (extraLes) {
      knoppen.push(
        el(
          "button",
          { class: `knop knop-tweede ${knoppen.length === 0 ? "knop-start" : ""}`, type: "button", onclick: () => app.naarExtra(extraLes) },
          t("knop.extraBij", { nummer: extraLes.id }),
        ),
      );
    }
    return el(
      "section",
      { class: "kaart verder-kaart", "aria-label": t("start.verder") },
      el("div", { class: "verder-links" }, el("p", { class: "verder-label" }, t("start.verder")), ...inhoud),
      el("div", { class: "verder-knoppen" }, ...knoppen),
    );
  }

  // ---------- "Alle lessen": een rij per les ----------

  function lesRij(les: Les): HTMLElement {
    const staat = toestand(les);
    const voortgang = lv(les);
    const heeftMeting = les.online.some((b) => b.type === "eindoefening" && b.doelNauwkeurigheid !== null);
    const vorige = vorigeVan(les);

    const icoon =
      staat === "klaar"
        ? el("span", { class: "rij-status", role: "img", "aria-label": t("status.klaar") }, vinkje(22))
        : staat === "nu"
          ? el("span", { class: "rij-status", role: "img", "aria-label": t("status.nu") }, el("span", { class: "stip-nu" }))
          : el("span", { class: "rij-status", role: "img", "aria-label": t("status.slot") }, slotje(18));

    const acties: (Node | null)[] = [];
    if (staat === "klaar") {
      acties.push(el("button", { class: "knop knop-rij", type: "button", onclick: () => app.naarLes(les, 0) }, t("knop.lesOpnieuw")));
    } else if (staat === "nu") {
      acties.push(el("button", { class: "knop knop-rij knop-hoofd", type: "button", onclick: () => app.naarLes(les) }, t("knop.startLes")));
    } else if (staat === "binnenkort") {
      acties.push(el("span", { class: "rij-tekst" }, t("les.binnenkort")));
    } else if (vorige) {
      acties.push(el("span", { class: "rij-tekst" }, t("les.na", { nummer: vorige.id })));
    }
    if ((staat === "klaar" || staat === "nu") && magExtra(les)) {
      acties.push(el("button", { class: "knop knop-rij knop-tweede", type: "button", onclick: () => app.naarExtra(les) }, t("knop.extra")));
    }

    return el(
      "li",
      { class: `les-rij les-rij-${staat}` },
      icoon,
      el("span", { class: "rij-nummer" }, t("les.nummer", { nummer: les.id })),
      el("span", { class: "rij-titel" }, les.titel),
      el("span", { class: "rij-toetsen" }, ...les.nieuweToetsen.map((x) => toetsChip(x))),
      el(
        "span",
        { class: "rij-sterren" },
        staat === "klaar" && heeftMeting
          ? el(
              "span",
              { class: "sterren-klein", role: "img", "aria-label": t("les.sterren", { aantal: voortgang.sterren }) },
              ...[1, 2, 3].map((i) => sterIcoon(i <= voortgang.sterren, 18)),
            )
          : null,
      ),
      el("span", { class: "rij-acties" }, ...acties),
    );
  }

  // ---------- tabbladen per deel ----------

  const lessenVan = (deel: Deel): Les[] => deel.lessen.map((id) => app.lessen.find((l) => l.id === id)).filter((l): l is Les => l !== undefined);
  // Een deel is op slot zolang geen enkele les ervan open of klaar is.
  const deelOpSlot = (deel: Deel) => lessenVan(deel).every((l) => toestand(l) === "slot" || toestand(l) === "binnenkort") && !lessenVan(deel).some((l) => l.id === beurtId);
  const startDeel = DELEN.find((d) => beurtId !== null && d.lessen.includes(beurtId)) ?? DELEN[DELEN.length - 1];

  const lijst = el("ul", { class: "les-rijen" });
  const tabs = el("div", { class: "tabs", role: "tablist", "aria-label": t("start.delen") });
  function kiesDeel(deel: Deel): void {
    lijst.replaceChildren(...lessenVan(deel).map(lesRij));
    for (const knop of tabs.children) {
      const gekozen = knop.getAttribute("data-deel") === String(deel.nummer);
      knop.setAttribute("aria-selected", String(gekozen));
    }
  }
  for (const deel of DELEN) {
    const slot = deelOpSlot(deel);
    tabs.append(
      el(
        "button",
        { class: "tab", type: "button", role: "tab", "data-deel": deel.nummer, disabled: slot, onclick: () => kiesDeel(deel) },
        slot ? slotje(13) : null,
        t("start.deel", { nummer: deel.nummer, titel: deel.titel }),
      ),
    );
  }
  if (startDeel) kiesDeel(startDeel);

  // ---------- Fien en Jef met een tekstballon ----------

  const begroeting = !beurt
    ? t("begroeting.allesKlaar")
    : toestand(beurt) === "binnenkort"
      ? t("begroeting.binnenkort")
      : (beurt.begroeting ?? t("begroeting.standaard"));

  wortel.append(
    el(
      "div",
      { class: "scherm scherm-start" },
      el(
        "header",
        { class: "start-kop" },
        // Links het merk (het huisje met de toetsen f en j, de naam), in het midden
        // de startzin, rechts de twee knoppen: drie rustige blokken.
        el("div", { class: "start-merk" }, merkteken(), el("div", { class: "start-titel" }, el("h1", {}, t("app.titel")), el("p", {}, t("app.ondertitel")))),
        el("p", { class: "startzin" }, t("startzin")),
        el(
          "div",
          { class: "start-knoppen" },
          voorleesKnop(app),
          el("button", { class: "knop knop-klein", type: "button", onclick: () => app.naarOefenbord() }, t("knop.oefenbord")),
        ),
      ),
      el(
        "main",
        { class: "start-inhoud" },
        el(
          "aside",
          { class: "start-figuren" },
          el("p", { class: "ballon staart-onder" }, begroeting),
          el("div", { class: "figuren" }, fien("zwaai", 320), jef("zwaai", 320)),
        ),
        el(
          "div",
          { class: "start-kolom" },
          verderKaart(),
          el(
            "section",
            { class: "kaart lessen-kaart", "aria-label": t("start.alleLessen") },
            el("div", { class: "lessen-kop" }, el("h2", {}, t("start.alleLessen")), tabs),
            lijst,
          ),
        ),
      ),
    ),
  );

  // Zet de focus op "Start de les": Enter start ze meteen.
  (wortel.querySelector<HTMLButtonElement>(".knop-start") ?? wortel.querySelector<HTMLButtonElement>(".les-rij-nu .knop"))?.focus();
  return {};
}
