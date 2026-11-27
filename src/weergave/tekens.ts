import { t } from "../content";

/** Hoe een teken op het scherm genoemd wordt: letters als hoofdletter (zoals op de toets), de spatie als woord. */
export function tekenNaam(teken: string): string {
  return teken === " " ? t("teken.spatie") : teken.toUpperCase();
}

/** Hoe een teken in een oefening getoond wordt: zoals het getypt wordt, de spatie als woord. */
export function tekenTonen(teken: string): string {
  return teken === " " ? t("teken.spatie") : teken;
}
