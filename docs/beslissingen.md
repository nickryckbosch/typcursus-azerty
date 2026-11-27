# Technische beslissingen

Elke keuze met kort de argumenten voor en tegen. Alles blijft bijstuurbaar na de klastest. Didactische beslissingen staan in [08-ontwerp-leerlijn-en-les-1.md](08-ontwerp-leerlijn-en-les-1.md).

Beslist met Nick (27 november 2026):

- **Voorlezen staat standaard uit**, met een duidelijke knop om het aan te zetten.
- **Sterren:** 1 vanaf 90%, 2 vanaf 95%, 3 vanaf 98%.

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
- **Tegen:** de voortgang hoort bij het browserprofiel. Delen kinderen een Chromebook met dezelfde login, dan lopen hun gegevens door elkaar. Zie de open vraag onderaan.

## 9. Lessen openen

- Les 0 is altijd open. Les 0 is af na de houdingsoefening (er wordt niets gemeten).
- Een volgende les gaat open bij minstens 90% op de eindoefening, ook als dat de korte versie was.
- Na twee mislukte pogingen op rij komt de korte versie met een aanmoediging. Na een geslaagde poging begint de teller opnieuw.
- Een les waarvan nog niet alle blokken of spelletjes gebouwd zijn, staat op "Komt binnenkort". Dat gebeurt automatisch: zodra het spel van les 2 bestaat, gaat les 2 open.

## 10. Leerkrachtscherm

- **Verborgen** achter Ctrl + Shift + L, zodat kinderen er niet per ongeluk terechtkomen. In de waarschuwing over het toetsenbord staat wel een knop "Uitleg voor de leerkracht".
- **Wissen** vraagt om het woord "wissen" te typen. Een gewoon "Ben je zeker?" klikt een kind te makkelijk weg.
- **Lesfiches:** het klassikale deel van elke les komt uit dezelfde JSON als de app. Zo zijn de handleiding en de app altijd gelijk.

## 11. Voorlezen

- Web Speech API van de browser, met een Vlaamse stem (nl-BE) als het toestel die heeft, anders een andere Nederlandse stem. Er wordt niets doorgestuurd.
- **Tegen:** de kwaliteit van de stem hangt af van het toestel.

## 12. Fien en Jef

- Voorlopig eenvoudige vormen in SVG (`src/weergave/figuren.ts`). Fien en Jef hebben een ander uiterlijk. Voor de echte prenten vervang je alleen die twee functies.

## 13. Privacy en veiligheid

- Geen externe bronnen: geen lettertypes, geen CDN, geen analytics. Het systeemlettertype van het toestel wordt gebruikt.
- Een Content-Security-Policy in `index.html` verbiedt dat de pagina iets van een andere website laadt.

## 14. Publiceren

- GitHub Actions voert bij elke push de tests uit en bouwt de website. Alleen bij een push naar `main` wordt ze op GitHub Pages gezet.
- `base: "./"` in `vite.config.ts`: de website werkt in elke map, dus ook op `https://<gebruiker>.github.io/typcursus-azerty/`.

## 15. Keybr

- Er is geen code of data van Keybr (of een ander project) hergebruikt. Alles is zelf geschreven, dus er is geen vermelding nodig.

## Open vraag voor Nick

**Heeft elk kind een eigen Chromebook of een eigen Google-login?** Met een eigen login werkt alles zoals het nu is. Delen kinderen een toestel met dezelfde login, dan kan ik een eenvoudig "kies je naam"-scherm toevoegen (alleen op het toestel, zonder wachtwoord).
