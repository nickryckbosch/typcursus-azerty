// Links, rechts, duim (les 0, stap 7): droog tikken, zoals in de oriëntatieles.
// Een kaart toont "Links", "Rechts" of "Duim". De getekende hand toont die
// vinger in kleur, de andere vingers in een lichtere tint. Het kind tikt met
// die vinger en legt hem terug.
//
// - links = de toets met het bultje onder de linkerwijsvinger (KeyF), rechts =
//   die onder de rechterwijsvinger (KeyJ), duim = de spatiebalk (Space). De app
//   werkt met toetscodes, los van de indeling, en noemt geen letters.
// - De wijsvinger van de verkeerde hand: "Andere hand!". Een andere toets:
//   "Andere vinger. Kijk naar de hand.". De app wacht op de juiste toets en
//   het schermtoetsenbord wijst ze dan aan.
// - Een aanslag gaat nooit verloren; een ingehouden toets telt een keer.

import type { TikBlok } from "../content/types";
import type { Vinger } from "../logica/indeling";
import { el } from "../weergave/dom";
import { vinkje } from "../weergave/figuren";
import type { BlokFunctie } from "./context";
import { isAanslag, maakMelding } from "./melding";
import { oefenscherm } from "./oefenscherm";

type Kant = "links" | "rechts" | "duim";
const CODE: Record<Kant, string> = { links: "KeyF", rechts: "KeyJ", duim: "Space" };
const VINGER: Record<Kant, Vinger> = { links: "linkerwijs", rechts: "rechterwijs", duim: "duim" };

export const tik: BlokFunctie<TikBlok> = (blok, ctx) => {
  const reeks = blok.volgorde;
  let i = 0;
  let klaar = false;

  const scherm = oefenscherm(ctx, { figuren: "blij", klasse: "blok-groep blok-tik", doel: "", figuurHoogte: 150, enterPlaats: "opdracht" });
  const woord = el("span", {});
  const kaart = el("div", { class: "tik-kaart" }, woord);
  const melding = maakMelding();
  scherm.veld.append(kaart, melding.element);
  scherm.zetOpdracht(blok.tekst ?? "");

  function toonHuidige(): void {
    const kant = reeks[i];
    scherm.voortgang.zetBalk(i, reeks.length);
    woord.textContent = blok.opKaart[kant];
    kaart.className = `tik-kaart kleur-${kant === "duim" ? "grijs" : "blauw"}`;
    // Twee keer na elkaar hetzelfde woord: de teller onderaan ("7 van 12") en
    // de toets die oplicht tonen dat de vorige tik geteld is. Er beweegt niets (K16).
    ctx.handen.toon([VINGER[kant]]);
    ctx.toetsenbord.markeer([]);
    melding.verberg();
  }

  toonHuidige();

  return {
    opToets(e) {
      if (klaar) {
        if (e.key === "Enter" && !e.repeat) ctx.volgende();
        return;
      }
      if (!isAanslag(e)) return;
      const kant = reeks[i];
      if (e.code !== CODE[kant]) {
        // De app wacht op de juiste toets en wijst ze aan.
        ctx.toetsenbord.markeer([CODE[kant]]);
        ctx.handen.benadruk();
        const andereHand = kant !== "duim" && e.code === CODE[kant === "links" ? "rechts" : "links"];
        melding.toon(andereHand ? blok.foutHand : blok.foutVinger);
        return;
      }
      ctx.toetsenbord.lichtOp(e.code);
      i++;
      if (i < reeks.length) {
        toonHuidige();
        return;
      }
      // Het slot: op de kaart komt een vinkje (klaar), Fien en Jef zeggen de slotzin.
      klaar = true;
      scherm.voortgang.zetBalk(reeks.length, reeks.length);
      kaart.className = "tik-kaart tik-klaar";
      woord.replaceChildren(vinkje(72));
      ctx.handen.toon([]);
      ctx.toetsenbord.markeer([]);
      melding.verberg();
      scherm.zetFiguren("duim");
      scherm.zetDoel(blok.slot, false);
      scherm.verbergOpdracht();
      ctx.zeg(blok.slot);
      scherm.toonEnter();
    },
    opruimen() {
      ctx.toetsenbord.doof();
    },
  };
};
