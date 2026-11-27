// Oefenregels (type "reeks"). Er wordt niets gemeten voor het openen van de
// volgende les, maar de aanslagen tellen mee in de statistieken per toets.

import type { ReeksBlok } from "../content/types";
import type { BlokFunctie } from "./context";
import { typRegels } from "./typregels";

export const reeks: BlokFunctie<ReeksBlok> = (blok, ctx) =>
  typRegels(ctx, blok.regels, blok.tekst ?? "", (oefeningen) => {
    ctx.bewaarAanslagen(oefeningen.flatMap((o) => o.aanslagen));
    ctx.volgende();
  });
