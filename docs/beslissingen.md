# Technische beslissingen

Elke keuze met kort de argumenten voor en tegen. Alles blijft bijstuurbaar na de klastest. Didactische beslissingen staan in [08-ontwerp-leerlijn-en-les-1.md](08-ontwerp-leerlijn-en-les-1.md). De ontwerpregels voor elk scherm staan in [stijlgids.md](stijlgids.md).

**Waarop steunt een keuze?** Bij de keuzes over vormgeving en didactiek (K15 tot K19, punt 5, 6, 12 en 16 tot 19) staat een van deze labels:

- **onderzoek**: er is onderzoek, met de bron erbij;
- **andere cursussen**: andere typcursussen doen het ook zo;
- **eigen keuze**: onze eigen keuze, te toetsen in de klastest.

De volledige bronnenlijst staat in projectdocument 13 (onderzoeksagenda) en 14 (functies van de app) van het claude.ai-project "Typcursus azerty".

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

## 5. Kleuren (K19)

- **Keuze:** palet C, door Nick gekozen na een vergelijking van drie paletten. Vol / licht: wijsvinger `#1F5FC8` / `#D6E4FA`, middelvinger `#F0A030` / `#FCE6C4`, ringvinger `#2E9D63` / `#D3EEDF`, pink `#C9A3F0` / `#F1E7FC`, duim `#8A94A6` / `#E3E7EE`.
- **Waarop steunt dit? Onderzoek (een nabootsing).** We bootsten na hoe kinderen met een rood-groenzwakte de kleuren zien, met de simulatiematrices van Machado, Oliveira en Fernandes (2009, IEEE Transactions on Visualization and Computer Graphics 15(6)) voor deuteranopie en protanopie, en maten het verschil tussen twee kleuren in CIELAB.
  - Vorig palet (Okabe en Ito, Color Universal Design, https://jfly.uni-koeln.de/color/): ringvinger, pink en duim vielen voor rood-groenzwakke kijkers bijna samen. Kleinste verschil, tussen pink en duim: ongeveer 7.
  - Eerste ontwerp van K19: wijsvinger en pink vielen voor roodzwakke kijkers bijna samen (ongeveer 13).
  - Palet C: kleinste verschil ongeveer 25 (deuteranopie) en 28 (protanopie).
- **Tegen:** het is een nabootsing, geen test met kinderen. Te controleren in de klastest.
- **Nooit kleur alleen:** de plaats van de vinger op de getekende hand en de zin in woorden onder het toetsenbord ("Typ de k met je rechtermiddelvinger") blijven. De volle pinkkleur is licht; daarom krijgt de vinger die moet typen op de hand ook een dikkere, donkere omtrek, zodat vol en licht niet alleen in kleur verschillen. De zware zwarte rand en de stip van het eerste prototype zijn weg.
- **In de code:** alle kleuren staan bovenaan `src/stijl.css` als variabelen. Een kleur aanpassen is een regel.
- De andere kleuren (achtergrond, kaarten, tekst, accent) staan in de [stijlgids](stijlgids.md), deel 2: **eigen keuze**.

## 6. Wanneer is de hulp zichtbaar? (K17, eerste stap)

- **Keuze:** in les 0 tot 5 is de hulp altijd zichtbaar: de toets en de vinger die moeten komen, lichten op voor het kind typt, en eronder staat de zin in woorden. Dat geldt voor "Zoek de toets", de oefenregels, de eindoefening en het spel "Over de beek".
- **Na een fout** blijft de cursor staan en lichten de juiste toets en vinger even sterker op (een dikkere ring). Er schudt niets.
- **Het vorige gedrag** (hulp pas na een fout of na 3 seconden wachten) is niet weggegooid: het is een instelling, standaard uit. Ze staat op het leerkrachtscherm ("Hulp op het schermtoetsenbord") en in de code als `instellingen.hulpPasNaFout`. Zo kan K17 de hulp later afbouwen (met een hulpknop) zonder dat er code terug moet komen. De afbouw per toets is nog niet gebouwd.
- **Waarop steunt dit? Onderzoek, met een eigen keuze erbovenop.** Bij volwassenen leert minder feedback soms beter; bij kinderen is daar geen steun voor:
  - Sullivan, Kantak en Burtner (2008), Motor learning in children: feedback effects on skill acquisition, Physical Therapy.
  - Goh, Kantak en Sullivan (2012), Research Quarterly for Exercise and Sport.
  - van der Veer e.a. (2022), systematic review in PLOS ONE: geen steun voor minder feedback bij kinderen.
  - Yechiam, Erev, Yehene en Gopher (2003), Human Factors: na een typcursus vallen mensen terug op kijken. Daarom bouwen we de hulp later wel af.
- **Tegen:** er is geen studie bij kinderen over schermtoetsenborden. Hoe lang de hulp zichtbaar blijft, is een eigen keuze, te toetsen in de klastest. Het risico is dat een kind naar het schermtoetsenbord blijft kijken in plaats van te voelen.

## 7. Nauwkeurigheid en snelheid

- **Nauwkeurigheid** = juiste aanslagen gedeeld door alle aanslagen. Omdat de cursor wacht, zijn er altijd evenveel juiste aanslagen als tekens; elke fout verlaagt het percentage.
- **Snelheid** in woorden per minuut (5 tekens = 1 woord), gemeten per regel (de pauze tussen twee regels telt niet). Ze wordt bewaard en staat op het leerkrachtscherm, maar het kind ziet ze nooit.
- **Gemiddelde tijd per toets:** de tijd sinds de vorige aanslag, alleen voor juiste aanslagen. Pauzes langer dan 5 seconden tellen niet mee.
- **Fouten worden geteld bij de toets die moest komen:** typt het kind j waar f moest staan, dan is dat een fout op de f. Zo zie je welke toetsen moeilijk zijn.

## 8. Voortgang en opslag

- **localStorage**, onder de sleutel `typcursus-azerty`, met een versienummer (nu 1). Elke lees- en schrijfactie zit in try/catch: lukt het niet, dan werkt de app gewoon verder, alleen zonder te bewaren.
- **Velden die later bijkwamen** (zoals `bezigBij`, `eindeBereikt` en de instelling voor de hulp) krijgen een standaardwaarde als ze ontbreken; het versienummer blijft 1.
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

## 12. Fien en Jef (K16)

- **Bron:** het goedgekeurde modelblad `docs/beelden/fien-en-jef-modelblad.png` (gemaakt met ChatGPT, vrij te gebruiken in dit project).
- **Uitknippen:** `scripts/knip-figuren.py` knipt de zwaaiende Fien en Jef en vier gezichtjes (blij, trots, nadenkend, aanmoedigend) uit, maakt de witte achtergrond doorzichtig en bewaart ze in `src/beelden/`. De twee prenten "duim omhoog" (`fien-duim.png`, `jef-duim.png`) zijn uitsneden die Nick aanleverde; ze zijn op dezelfde manier verkleind tot 256 kleuren.
- **Bestandsgrootte:** alle prenten van Fien en Jef samen ongeveer 190 kB. Belangrijk als een hele klas tegelijk laadt.
- **Ze staan stil.** Fien en Jef bewegen nooit. Ze veranderen alleen van houding bij de start en op het einde, niet bij elke toets of fout:
  - zwaaien (start): startscherm, intro van elke les, "verdergaan waar je was", einde van "Licht aan";
  - duim omhoog: naast de oefenregels (met een korte tip), einde van "Over de beek", afsluiter als het doel gehaald is;
  - aanmoedigend: korte eindoefening na twee mislukte pogingen, afsluiter als het doel niet gehaald is;
  - blij: toetsenbord klopt, houdingsoefening, "Licht aan" tijdens het spel;
  - nadenkend: toetsenbord staat niet goed.
- **Geen beweging in de app.** Er zijn geen animaties meer: geen schuddende letters of stenen, geen knipperende verdieping, geen springende figuurtjes. Een spel heeft een vaste prent bovenaan en toont de vooruitgang eronder. Bij een fout lichten alleen de juiste toets en vinger op.
- **Waarop steunt dit? Onderzoek.** Versiering die niets met de leerstof te maken heeft, leidt af en doet minder leren:
  - Rey (2012), A review of research and a meta-analysis of the seductive detail effect, Educational Research Review 7(3).
  - Sundararajan en Adesope (2020), Keep it coherent: a meta-analysis of the seductive details effect, Educational Psychology Review 32.
  - Wong en Adesope (2021), Meta-analysis of emotional designs in multimedia learning, Educational Psychology Review 33: meer motivatie bij stilstaand dan bij geanimeerd materiaal.
- **Tegen:** dat onderzoek gaat over leren uit tekst en uitleg, niet over typen. Kinderen kunnen de spelletjes minder leuk vinden zonder beweging: te toetsen in de klastest.
- **Beekprent:** "Over de beek" gebruikt de prent op maat van Nick (Fien en Jef links, het huisje rechts, een brede beek zonder stenen), verkleind tot 1100 x 440 en bewaard als WebP (38 kB). Alleen lucht bovenaan en gras onderaan zijn weggesneden; de figuren en het huisje blijven volledig in beeld. De app toont de prent gecentreerd met afgeronde hoeken en tekent de rij van 12 stenen zelf, eronder.
- **Spelbeschrijvingen:** de beschrijvingen in de lesinhoud (les 1 tot 5) zijn aangepast aan K16. De repository (`src/content/nl-BE`) is vanaf nu de bron voor de lesinhoud.
- **Een uitdrukking toevoegen:** zet een zone in het script, voer het uit (`python3 scripts/knip-figuren.py`) en voeg de naam toe aan `Uitdrukking` in `src/weergave/figuren.ts`.

## 12b. Indeling van het lesscherm: altijd alles zichtbaar

- **Probleem bij de eerste test:** op de Chromebook van de klas was er minder hoogte dan verwacht (schaalinstelling, bladwijzerbalk, zoom). Het bovenste deel paste niet meer, je moest scrollen om de knop Verder te vinden, en bij "Licht aan in het huis" viel de zolder weg.
- **Oplossing:**
  - Het toetsenbord en de handen krijgen een vast deel van de schermhoogte.
  - Alles in het middelste deel (tekst, Fien en Jef, het huis, de beek, de oefenregels) schaalt mee met de hoogte die overblijft. Daarvoor gebruiken we "container query units" (`cqh`) van CSS: 1cqh is 1% van de hoogte van het middelste deel. Elke maat heeft een onder- en een bovengrens.
  - Waar niets te typen valt (afsluiter, aanmoediging), verdwijnen het toetsenbord en de handen.
  - "Druk op Enter om verder te gaan" en de knop Verder staan op dezelfde regel.
- **Getest** op 1366 x 768, 1366 x 657, 1280 x 600, 1280 x 560 en 1024 x 600, opnieuw na de nieuwe vormgeving (K19): in geen enkele stap van les 0 en les 1 moet er nog gescrold worden. Dat is nagekeken door beide lessen automatisch te doorlopen in Chrome, ook de melding "je toetsenbord staat niet goed" en extra oefenen. Niet nagekeken op een echte Chromebook.
- **Tegen:** op een heel klein scherm worden de letters en figuren kleiner. De ondergrenzen zorgen dat ze leesbaar blijven.

## 13. Privacy en veiligheid

- Geen externe bronnen: geen CDN, geen analytics, geen Google Fonts.
- **Lettertypes zitten in de repository** (`src/lettertypes/`): Andika (alles wat kinderen lezen en typen) en Nunito (koppen en knoppen), als woff2, alleen de Latijnse tekens (vier bestanden, samen ongeveer 72 kB). Ze komen uit de npm-pakketten van Fontsource (versie 5.3.0) en zijn gekopieerd, zodat er geen extra afhankelijkheid is. Beide vallen onder de SIL Open Font License 1.1; de licentieteksten staan in dezelfde map.
- **Waarop steunt de keuze voor Andika? Eigen keuze.** Andika is door SIL ontworpen voor beginnende lezers; er is geen effectstudie die we kennen.
- Een Content-Security-Policy in `index.html` verbiedt dat de pagina iets van een andere website laadt. De eigen lettertypes vallen onder `default-src 'self'`.

## 14. Publiceren

- GitHub Actions voert bij elke push de tests uit en bouwt de website. Alleen bij een push naar `main` wordt ze op GitHub Pages gezet.
- `base: "./"` in `vite.config.ts`: de website werkt in elke map, dus ook op `https://<gebruiker>.github.io/typcursus-azerty/`.

## 15. Keybr

- Er is geen code of data van Keybr (of een ander project) hergebruikt. Alles is zelf geschreven, dus er is geen vermelding nodig.

## 16. Vormgeving (K19)

- **Keuze:** een rustige vormgeving volgens de mockups van Nick: havermoutkleurige achtergrond, witte kaarten met afgeronde hoeken, donkerblauwe tekst, een blauw accent voor knoppen. Alle regels staan in de [stijlgids](stijlgids.md); elk nieuw scherm volgt ze.
- **Schermtoetsenbord:** drie letterrijen en de spatiebalk, geen cijferrij. Kleine letters op de toetsen, zoals het kind ze leest en typt. De toetsenbordcheck van les 0 vraagt nog altijd de 6; die staat groot in het blok zelf.
- **Randtoetsen** zijn vaag en zonder opschrift. De Enter-toets licht wel op, met opschrift, als het kind op Enter moet drukken (bestaande beslissing, behouden).
- **Balkjes bovenaan:** een balkje per blok van de les. De les-JSON bepaalt het aantal (nu 7, in les 0 zijn het er 6), niet de mockup (die er 8 toont).
- **Tips:** de korte tip naast de oefenregels staat in de les-JSON (veld `tip` bij een oefenblok of eindoefening). De begroeting op het startscherm ook (veld `begroeting` van de les).
- **Waarop steunt dit? Eigen keuze**, te toetsen in de klastest. Kleurstrepen per vinger en getekende handen: **andere cursussen** doen dat ook.

## 17. Startscherm (K18)

- **Keuze:** bovenaan de titel en de startzin; links Fien en Jef met een tekstballon; een grote kaart "Verder waar je was" met de les die aan de beurt is (de eerste les die nog niet gelukt is); daaronder "Alle lessen" met een compacte rij per les.
- **Tabbladen per deel:** de delen van het toetsenbordhuis staan in `src/content/nl-BE/delen.json` (nu alleen "1 · Woonkamer"). Een deel toevoegen is daar een stukje tekst (nummer, titel, lesnummers), geen code. Een test controleert dat elke les in precies een deel zit.
- **Sterren** staan klein in de lesrij. **Voorlezen** en het **oefenbord** zijn kleine knoppen bovenaan; het oefenbord is nodig voor de klassikale start.
- **Waarop steunt dit? Eigen keuze**, te toetsen in de klastest.

## 18. Extra oefenen (K15)

- **Keuze:** bij elke les (behalve les 0) kan het kind extra oefenen. Een beurt is 4 nieuw samengestelde oefenregels van 15 tot 25 tekens, en daarna een korte afsluiter van Fien en Jef.
- **Wanneer gaat het open?** Zodra het kind de les een keer tot het einde gedaan heeft (tot bij de afsluiter), ook als het de 90% niet haalde. De volgende les gaat nog altijd pas open bij 90% op de eindoefening. In de voortgang is dat een nieuw veld per les, `eindeBereikt`; het versienummer blijft 1, en een les die al gelukt was, telt meteen mee.
- **Telt niet mee:** de score van extra oefenen verandert niets aan sterren, pogingen of het slot van de volgende les. De metingen per toets (fouten en tijd) worden wel bewaard, voor het leerkrachtscherm.
- **Waar vind je het?** Op het startscherm: de knop "Extra oefenen bij les X" in de kaart "Verder waar je was", en "Extra oefenen" in de rij van de les. Ook op het einde van een les.
- **De generator** (`src/logica/extraoefenen.ts`), zelf geschreven, zonder code van Keybr of een ander project:
  - items uit de lijsten van de les: groepjes (les 1 en 2), woorden (les 3 tot 5), zinnen (vanaf les 4; ongeveer de helft van de regels begint dan met een zin);
  - ongeveer drie kwart uit de huidige les, de rest uit vroegere lessen (in les 1 alles uit les 1);
  - nooit twee keer hetzelfde item na elkaar, ook niet over twee regels heen;
  - elke regel moet door de regelcontrole; zo niet, dan wordt ze opnieuw samengesteld. Na 50 pogingen komt een vaste oefenregel van de les, zodat het scherm nooit vastloopt;
  - het toeval wordt meegegeven aan de functie, zodat de tests altijd hetzelfde doen.
- **De regelcontrole** (`src/logica/regelcheck.ts`) is het controlescript in de repository: alleen geleerde toetsen, hoogstens vier aanslagen na elkaar met dezelfde vinger, hoogstens zeven letters na elkaar met dezelfde hand. De spatie onderbreekt een reeks (de duim typt ze). De test op de lesinhoud en de generator gebruiken dezelfde functie; alle bestaande groepjes, woorden, zinnen en oefenregels van les 1 tot 5 voldoen eraan.
- **Hetzelfde scherm:** extra oefenen gebruikt het gewone typscherm in een "extra"-stand. Zo ziet het er hetzelfde uit en is er geen dubbele code.
- **Waarop steunt dit? Andere cursussen en eigen keuze.** Typing.com en Keybr bieden ook extra oefening. De grenzen (4 regels, 15 tot 25 tekens, drie kwart uit de huidige les, vier keer dezelfde vinger, zeven letters dezelfde hand) zijn een eigen keuze, te toetsen in de klastest.
- **Tegen:** samengestelde regels zijn minder mooi dan met de hand geschreven regels (bijvoorbeeld een groepje uit een vroegere les tussen woorden).

