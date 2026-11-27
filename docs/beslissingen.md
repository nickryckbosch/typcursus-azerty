# Technische beslissingen

Elke keuze met kort de argumenten voor en tegen. Alles blijft bijstuurbaar na de klastest. Didactische beslissingen staan in [08-ontwerp-leerlijn-en-les-1.md](08-ontwerp-leerlijn-en-les-1.md).

Beslist met Nick (27 november 2026):

- **Voorlezen staat standaard uit**, met een duidelijke knop om het aan te zetten.
- **Sterren:** 1 vanaf 90%, 2 vanaf 95%, 3 vanaf 98%.
- **Eigen login:** elk kind heeft een eigen Google-login van de school op de Chromebooks (zie document 01). De voortgang per browserprofiel is dus per kind; er komt geen "kies je naam"-scherm.

## 1. Vite + TypeScript, zonder framework

- **Voor:** de app heeft weinig schermen. Zonder framework (zoals React) is er minder om te leren voor wie later meewerkt, en minder dat veroudert. TypeScript vangt veel fouten op voor ze in de klas opduiken. Vite maakt er een kleine statische website van (ongeveer 25 kB gecomprimeerd).
- **Tegen:** bij veel meer schermen wordt het zonder framework meer werk.
- **Beslissing:** geen framework. Elk scherm en elk blok is een gewone functie die HTML maakt. Een kleine hulpfunctie `el()` in `src/weergave/dom.ts` houdt dat leesbaar.

## 2. Logica los van het scherm

- **Voor:** alles wat getest moet worden (cursor bij fout, nauwkeurigheid, sterren, statistieken, opslag, toetsenbordcheck, willekeurige reeksen) staat in `src/logica/` zonder iets van het scherm te weten. Daardoor zijn de tests eenvoudig en snel.
- **Tegen:** een extra laag om te begrijpen.
- **Beslissing:** zo doen.

## 3. Toetsdetectie: event.key en event.code

- `event.key` (het teken dat het toestel geeft) bepaalt of een aanslag juist is.
- `event.code` (de fysieke toets) bepaalt welke toets oplicht op het schermtoetsenbord, en in het spel "Licht aan" welke rij gedrukt werd. Zo werkt dat spel ook als het toestel verkeerd ingesteld staat.
- Aanslagen die niet meetellen: Shift, Ctrl, pijltjes, Backspace, dode toetsen (zoals ^), en een toets die blijft ingedrukt (anders telt een ingedrukte toets als een reeks fouten).

## 4. Toetsenbordcheck

- **Werkwijze:** eerst vraagt de app de indeling op aan Chrome (`navigator.keyboard.getLayoutMap`). Lukt dat niet, dan drukt het kind op de A en op de 6. Belgisch: de toets op de plaats van de Q geeft a, en de 6 zonder Shift geeft §. Frans geeft -, QWERTY geeft q.
- **Ook tijdens het typen:** geeft de fysieke toets KeyQ een q, dan staat het toestel zeker niet op AZERTY, en verschijnt de waarschuwing.
- **Bij elke les:** de app controleert de indeling stil opnieuw. Is het in orde gebracht, dan verdwijnt de waarschuwing.
- **Blokkeert niet**, zoals afgesproken in document 11.

## 5. Kleuren

- **Keuze:** het Okabe-Ito-palet, ontworpen om ook bij de meest voorkomende vormen van kleurenblindheid te onderscheiden. Wijsvinger blauw `#0072B2`, middelvinger oranje `#E69F00`, ringvinger blauwgroen `#009E73`, pink roze-paars `#CC79A7`, duimen grijs.
- **Tegen:** de "paarse" pink is eerder roze-paars, en het groen is blauwgroen. Een echt paars zou voor kleurenblinde kinderen te veel op het blauw lijken.
- **Nooit kleur alleen:** de juiste vinger krijgt op de getekende hand een dikke zwarte rand en een stip boven de vingertop, de juiste toets een dikke dubbele rand. Onder het podium staat het ook in woorden ("Druk op de F met je linkerwijsvinger").
- Op de toetsen staan lichte tinten met zwarte letters (hoog contrast). Alleen de toets die nu moet komen krijgt de volle kleur.

## 6. Wanneer is de hulp zichtbaar?

- **Zoek de toets:** altijd. Daar leert het kind waar de toets is.
- **Oefenregels, eindoefening en spel "Over de beek":** na een fout, of als het kind langer dan 3 seconden wacht. Anders kijkt het kind de hele tijd naar het schermtoetsenbord in plaats van te voelen.
- **Tegen:** voor sommige kinderen is dat in het begin moeilijk. Na de klastest kunnen we die 3 seconden aanpassen (`HULP_NA_MS` in `src/blokken/typregels.ts`).

## 7. Nauwkeurigheid en snelheid

- **Nauwkeurigheid** = juiste aanslagen gedeeld door alle aanslagen. Omdat de cursor wacht, zijn er altijd evenveel juiste aanslagen als tekens; elke fout verlaagt het percentage.
- **Snelheid** in woorden per minuut (5 tekens = 1 woord), gemeten per regel (de pauze tussen twee regels telt niet). Ze wordt bewaard en staat op het leerkrachtscherm, maar het kind ziet ze nooit.
- **Gemiddelde tijd per toets:** de tijd sinds de vorige aanslag, alleen voor juiste aanslagen. Pauzes langer dan 5 seconden tellen niet mee.
- **Fouten worden geteld bij de toets die moest komen:** typt het kind j waar f moest staan, dan is dat een fout op de f. Zo zie je welke toetsen moeilijk zijn.

## 8. Voortgang en opslag

- **localStorage**, onder de sleutel `typcursus-azerty`, met een versienummer (nu 1). Elke lees- en schrijfactie zit in try/catch: lukt het niet, dan werkt de app gewoon verder, alleen zonder te bewaren.
- **Kapotte of onbekende gegevens** worden vervangen door een lege voortgang, veld per veld (`zetOm` in `src/logica/opslag.ts`). Komt er ooit een versie 2, dan komt de omzetting daar.
- **Tegen:** de voortgang hoort bij het browserprofiel. Dat is geen probleem: elk kind heeft een eigen Google-login van de school, dus een eigen profiel.

## 9. Lessen openen

- Les 0 is altijd open. Les 0 is af na de houdingsoefening (er wordt niets gemeten).
- Een volgende les gaat open bij minstens 90% op de eindoefening, ook als dat de korte versie was.
- Na twee mislukte pogingen op rij komt de korte versie met een aanmoediging. Na een geslaagde poging begint de teller opnieuw.
- Een les waarvan nog niet alle blokken of spelletjes gebouwd zijn, staat op "Komt binnenkort". Dat gebeurt automatisch: zodra het spel van les 2 bestaat, gaat les 2 open.

## 9b. Verdergaan na een onderbreking

- **Waarom:** in de klas moet een les soms vroeger stoppen.
- **Hoe:** de app onthoudt per les bij welke stap het kind is (`bezigBij`). Opent het kind de les later opnieuw, dan vraagt de app "Verder bij stap 4: Over de beek?" (Enter) of "Opnieuw beginnen". Op het startscherm staat "Bezig: stap 4 van 7".
- **Per stap, niet per toets:** stopt een kind midden in een stap, dan begint het die stap opnieuw. Dat is eenvoudiger en duidelijker voor kinderen, en een stap duurt maar een paar minuten.
- Bij de afsluiter is de les rond en wordt er niets meer onthouden.
- Oudere opgeslagen gegevens zonder dit veld werken gewoon verder (versienummer blijft 1).

## 10. Leerkrachtscherm

- **Verborgen** achter Ctrl + Shift + L, zodat kinderen er niet per ongeluk terechtkomen. In de waarschuwing over het toetsenbord staat wel een knop "Uitleg voor de leerkracht".
- **Wissen** vraagt om het woord "wissen" te typen. Een gewoon "Ben je zeker?" klikt een kind te makkelijk weg.
- **Lesfiches:** het klassikale deel van elke les komt uit dezelfde JSON als de app. Zo zijn de handleiding en de app altijd gelijk.

## 11. Voorlezen

- Web Speech API van de browser, met een Vlaamse stem (nl-BE) als het toestel die heeft, anders een andere Nederlandse stem. Er wordt niets doorgestuurd.
- **Tegen:** de kwaliteit van de stem hangt af van het toestel.

## 12. Fien en Jef

- **Bron:** het goedgekeurde modelblad `docs/beelden/fien-en-jef-modelblad.png` (gemaakt met ChatGPT, vrij te gebruiken in dit project).
- **Uitknippen:** `scripts/knip-figuren.py` knipt de zwaaiende Fien en Jef en vier gezichtjes (blij, trots, nadenkend, aanmoedigend) uit, maakt de witte achtergrond doorzichtig en bewaart ze in `src/beelden/`. Alleen het wit dat aan de rand raakt wordt doorzichtig, zodat het wit van ogen en tanden blijft.
- **Bestandsgrootte:** de prenten zijn verkleind tot 256 kleuren: samen 164 kB in plaats van 760 kB, zonder zichtbaar verschil. Belangrijk als een hele klas tegelijk laadt.
- **Waar welke uitdrukking:**
  - zwaaien: startscherm, intro van elke les, einde van "Licht aan";
  - blij: toetsenbord klopt, houdingsoefening, springers in "Over de beek", afsluiter met 1 of 2 sterren;
  - trots: afsluiter met 3 sterren;
  - aanmoedigend: korte eindoefening na twee mislukte pogingen, afsluiter als het doel niet gehaald is;
  - nadenkend: toetsenbord staat niet goed.
- **Een uitdrukking toevoegen:** zet een zone in het script, voer het uit (`python3 scripts/knip-figuren.py`) en voeg de naam toe aan `Uitdrukking` in `src/weergave/figuren.ts`.

## 12b. Indeling van het lesscherm: altijd alles zichtbaar

- **Probleem bij de eerste test:** op de Chromebook van de klas was er minder hoogte dan verwacht (schaalinstelling, bladwijzerbalk, zoom). Het bovenste deel paste niet meer, je moest scrollen om de knop Verder te vinden, en bij "Licht aan in het huis" viel de zolder weg.
- **Oplossing:**
  - Het toetsenbord en de handen krijgen een vast deel van de schermhoogte.
  - Alles in het middelste deel (tekst, Fien en Jef, het huis, de beek, de oefenregels) schaalt mee met de hoogte die overblijft. Daarvoor gebruiken we "container query units" (`cqh`) van CSS: 1cqh is 1% van de hoogte van het middelste deel. Elke maat heeft een onder- en een bovengrens.
  - Waar niets te typen valt (afsluiter, aanmoediging), verdwijnen het toetsenbord en de handen.
  - "Druk op Enter om verder te gaan" en de knop Verder staan op dezelfde regel.
- **Getest** op 1366 x 768, 1366 x 657, 1280 x 600, 1280 x 560, 1024 x 600 en 1280 x 500: in geen enkele stap van les 0 en les 1 moet er nog gescrold worden.
- **Tegen:** op een heel klein scherm worden de letters en figuren kleiner. De ondergrenzen zorgen dat ze leesbaar blijven.

## 12c. Rustige schermen: vaste zones, niets verspringt

**Steunt op:** eigen keuze, en een vaststelling van Nick bij het testen (27 november 2026). Sluit aan bij K16 in document 14.

**Wat Nick zag:**
- In les 0, "Duim op de spatiebalk", verscheen de grote kaart "spatie" pas als de lamp aanging, en de lamp sprong dan naar boven.
- In "Klaar voor de start" was het scherm te druk. De opdracht viel weg in het geheel: zelfs als volwassene had Nick niet door dat hij op de spatiebalk moest drukken.
- Op het eindscherm van "Licht aan in het huis" kwam een schuifbalk, en "Druk op Enter" en de knop Verder vielen half weg.

**Waarom dit belangrijk is:** een kind van 9 of 10 dat leert typen, moet zijn aandacht bij de toetsen en het scherm houden. Een element dat verspringt, trekt de blik weg van de opdracht. En een opdracht die niet opvalt, kan het kind niet uitvoeren.

**De regel, voor elk oefenscherm, ook voor toekomstige oefeningen en spelletjes:**
1. **Vaste zones.** Elk oefenscherm gebruikt dezelfde zones, met een vaste plaats en hoogte:
   - de opdracht bovenaan;
   - Fien en Jef links;
   - de prent of het spel in het midden;
   - "Druk op Enter" onderaan;
   - daaronder de hulpregel, de handen en het toetsenbord.

   De code staat in `src/blokken/oefenscherm.ts`. Een nieuw blok of spel gebruikt `oefenscherm()` en zet zijn inhoud in `veld`.
2. **Wat later verschijnt, staat er van bij het begin.** Het neemt zijn ruimte al in. Tonen en verbergen gaat via zichtbaarheid (`startVerborgen()`, `toon()`), nooit door elementen toe te voegen of weg te halen. Dat geldt ook voor het toetsenbord en de handen: waar niets te typen valt, worden ze onzichtbaar, maar ze houden hun plaats.
3. **Fien en Jef, de lamp en de prent veranderen nooit van plaats**, ook niet als de opdracht langer of korter wordt. Een andere uitdrukking van Fien en Jef verschijnt in hetzelfde vak.
4. **Verschijnen gaat met een korte, rustige overgang** van 180 ms. Vraagt het toestel om minder beweging (`prefers-reduced-motion`), dan gebeurt het meteen.
5. **De opdracht is het duidelijkste element:** groot en vet, altijd op dezelfde plek. De toets die het kind moet indrukken, staat getekend in de zin. In de teksten schrijf je dat als `[spatie]`, `[A]` of `[Enter ↵]`, en vet als `**zolder**`.
6. **Een signaal**, zoals de lamp of "Klap!", staat op een vaste plek in het midden, dicht bij de opdracht. Het verschijnt en verdwijnt alleen, en concurreert niet met de opdracht.
7. **Ook de hulpregel onder het podium** ("Druk op [F] met je linkerwijsvinger") heeft een vaste hoogte. De waarschuwing over het toetsenbord ligt als een laag erboven en duwt niets weg.

**Hoe we het controleren:** een testscript (Playwright) doorloopt elke les op zeven schermformaten, van 1920 x 950 tot 1280 x 500. Per stap meet het of er gescrold moet worden, of een zone te vol is, en of de opdracht, Fien en Jef, de lamp, het huis, de beek of het toetsenbord tijdens die stap van plaats veranderen. Les 0 en 1 zijn getest in de gepubliceerde versie. Bij les 2 tot 5 zijn alle stappen getest in de ontwikkelversie, waar een spel dat nog niet gebouwd is tijdelijk wordt vervangen.

**Tegen:**
- Een vaste zone laat soms lege ruimte, bijvoorbeeld onder de opdracht tot "Druk op Enter" verschijnt, of bij de afsluiter, waar het toetsenbord onzichtbaar is maar zijn plaats houdt. Dat is bewust: liever een rustige lege plek dan iets dat verspringt.
- Overgangen tussen stappen met een andere indeling (bijvoorbeeld van de aanmoediging naar de oefenregels, die de hele breedte gebruiken) gebeuren alleen nadat het kind zelf op Enter drukt. De opdrachtzone en het toetsenbord blijven dan op hun plaats.

**Later:** het huis van "Licht aan" krijgt een mooiere tekening. Het heeft nu al zijn vaste zone in het midden.

## 13. Privacy en veiligheid

- Geen externe bronnen: geen lettertypes, geen CDN, geen analytics. Het systeemlettertype van het toestel wordt gebruikt.
- Een Content-Security-Policy in `index.html` verbiedt dat de pagina iets van een andere website laadt.

## 14. Publiceren

- GitHub Actions voert bij elke push de tests uit en bouwt de website. Alleen bij een push naar `main` wordt ze op GitHub Pages gezet.
- `base: "./"` in `vite.config.ts`: de website werkt in elke map, dus ook op `https://<gebruiker>.github.io/typcursus-azerty/`.

## 15. Keybr

- Er is geen code of data van Keybr (of een ander project) hergebruikt. Alles is zelf geschreven, dus er is geen vermelding nodig.
