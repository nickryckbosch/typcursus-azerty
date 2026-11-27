// Voorlezen met de Web Speech API, in het Vlaams (nl-BE) als het toestel die
// stem heeft, anders een andere Nederlandse stem. Alles blijft op het toestel.

let aan = false;

export function zetVoorlezen(waarde: boolean): void {
  aan = waarde;
  if (!aan) stopVoorlezen();
}

export function kanVoorlezen(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function kiesStem(): SpeechSynthesisVoice | undefined {
  const stemmen = window.speechSynthesis.getVoices();
  return (
    stemmen.find((s) => s.lang.toLowerCase() === "nl-be") ??
    stemmen.find((s) => s.lang.toLowerCase().startsWith("nl"))
  );
}

export function spreek(tekst: string): void {
  if (!aan || !kanVoorlezen() || !tekst) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(tekst);
    u.lang = "nl-BE";
    u.rate = 0.95;
    const stem = kiesStem();
    if (stem) u.voice = stem;
    window.speechSynthesis.speak(u);
  } catch {
    // Voorlezen is een extraatje; als het niet lukt, gaat de les gewoon door.
  }
}

export function stopVoorlezen(): void {
  try {
    if (kanVoorlezen()) window.speechSynthesis.cancel();
  } catch {
    /* niets */
  }
}
