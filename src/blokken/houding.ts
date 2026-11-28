// Goed zitten (les 0, stap 2): de houding, voor het kind iets typt. Fien en Jef
// zeggen "Voeten plat, rug recht, schouders los!" in hun tekstballon. Drie
// rustige kaartjes zeggen wat dat betekent. Het kind gaat goed zitten en drukt
// op Verder. Er is geen lamp en er wordt niets nagekeken: de houding kan de
// app niet zien.
//
// Alle teksten staan in de lesdata (opdracht, tekstballon, kaartjes).

import type { HoudingBlok } from "../content/types";
import { el } from "../weergave/dom";
import type { BlokFunctie } from "./context";
import { oefenscherm } from "./oefenscherm";

export const houding: BlokFunctie<HoudingBlok> = (blok, ctx) => {
  const scherm = oefenscherm(ctx, { figuren: "blij", klasse: "blok-groep blok-zitten", doel: blok.zegt, figuurHoogte: 150 });
  scherm.veld.append(
    el(
      "div",
      { class: "zit-kaartjes" },
      ...blok.kaartjes.map((k) => el("div", { class: "zit-kaartje" }, el("b", {}, k.titel), el("span", {}, k.tekst))),
    ),
    // De knop Verder staat bij de kaartjes: wat bij elkaar hoort, staat bij elkaar (K27).
    scherm.enter,
  );
  ctx.zeg(blok.zegt);
  scherm.zetOpdracht(blok.tekst ?? "");
  scherm.toonEnter();

  return {
    opToets(e) {
      // Een ingehouden Enter van het vorige scherm telt niet.
      if (e.key === "Enter" && !e.repeat) ctx.volgende();
    },
  };
};
