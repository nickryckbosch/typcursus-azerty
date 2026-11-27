// Alleen tijdens het ontwikkelen (npm run dev): een spel dat nog niet gebouwd
// is, wordt vervangen door dit scherm. Zo kan je de andere stappen van les 2
// tot 5 al bekijken. In de gepubliceerde versie staat zo een les op "Komt binnenkort".

import type { SpelBlok } from "../content/types";
import type { BlokFunctie } from "./context";
import { oefenscherm } from "./oefenscherm";

export const spelInOpbouw: BlokFunctie<SpelBlok> = (blok, ctx) => {
  const scherm = oefenscherm(ctx, { kop: blok.titel, figuren: "nadenkend" });
  scherm.zetOpdracht(`Het spel "${blok.titel}" (${blok.spel}) is nog niet gebouwd.`, false);
  scherm.toonEnter();
  return {
    opToets(e) {
      if (e.key === "Enter") ctx.volgende();
    },
  };
};
