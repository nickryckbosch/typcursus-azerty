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

## 7. Nauwkeurigheid, snelheid en metingen per toets

De volledige uitleg staat in projectdocument 12 ("Metingen per toets") van het claude.ai-project. De code staat in `src/logica/metingen.ts` en `src/logica/foutsoort.ts`; alle drempels staan in `src/logica/instellingen.ts`.

**Definities**

- **Positie:** elk teken in de oefentekst. **Meteen juist:** op die positie meteen de juiste toets.
- **Fout:** minstens een verkeerde toets op die positie. Een positie telt hoogstens een fout, hoe vaak het kind ook verkeerd drukt. De app onthoudt wel elke verkeerde toets die getypt werd.
  - Voor: past bij de cursor die wacht; drie keer mis drukken op een letter is een moeilijkheid, geen drie.
  - Tegen: een kind dat wild drukt, lijkt beter dan het is. Daarom bewaren we ook welke toetsen het typte.
  - Steunt op: **andere cursussen** (Keybr telt zo) en **eigen keuze**.
- **Nauwkeurigheid van een oefening** = posities meteen juist / posities. Dit is het getal voor de 90%-regel en de sterren, ook bij de korte eindoefening.
  - Vroeger was het: juiste aanslagen / alle aanslagen. Voor een kind dat per fout een keer verkeerd drukt, verandert er bijna niets: in de eindoefening van les 1 (40 posities) mag het in beide gevallen 4 fouten maken. Een kind dat op een letter meerdere keren verkeerd drukt, wordt nu minder zwaar gestraft.
- **Snelheid** in woorden per minuut (5 tekens = 1 woord), gemeten per regel (de pauze tussen twee regels telt niet). Ze wordt bewaard en staat op het leerkrachtscherm, maar het kind ziet ze nooit, en ze beslist niets. Steunt op: **eigen keuze** (eerst juist, dan vlot).

**Tijd per toets**

- **Tijd van een aanslag** = van het indrukken van de vorige toets tot het indrukken van deze toets. Ze telt alleen mee bij een "propere" aanslag:
  1. deze positie was meteen juist;
  2. de vorige positie was ook meteen juist (na een fout vertraagt iedereen);
  3. het is niet de eerste positie van een regel;
  4. de vorige toets was niet dezelfde toets (zoals in "fff"): zo'n herhaling gaat bij beginners veel sneller en vertekent het beeld;
  5. de tijd ligt tussen 40 en 4000 ms.
- **Lange pauze:** een propere aanslag boven 4000 ms telt niet voor de tijd, maar wordt apart geteld. Het beslist niets; in de klastest kijken we of het iets zegt (zoeken, kijken naar de handen, of gewoon afleiding).
- **Mediaan, niet het gemiddelde:** per toets bewaren we de middelste tijd. Een paar lange pauzes trekken een gemiddelde te hoog. Over meerdere pogingen heen toont het leerkrachtscherm de mediaan van de medianen per poging.
- **Vergelijken met het kind zelf:** de tijd zegt iets over een toets tegenover de andere toetsen van hetzelfde kind, niet tegenover een norm.
- **Waarop steunt dit?**
  - Tijd alleen bij propere aanslagen, herhalingen weg, vergelijken met het kind zelf: **onderzoek** (Van den Bergh, Schmittmann, Hofman en Van der Maas, 2015, Tracing the development of typewriting skills in an adaptive e-learning environment, Perceptual and Motor Skills 121(3)).
  - De ondergrens van 40 ms: **andere cursussen** (Keybr gebruikt ze ook).
  - De precieze grenzen (40 en 4000 ms) en de mediaan: **eigen keuze**, te toetsen in de klastest. Een kind van 9 jaar zoekt in les 1 soms langer dan 4 seconden; daarom tellen we die pauzes apart.
- **Tegen:** er blijven minder tijdmetingen over, zeker in les 1 met veel "fff jjj".

**Soort fout**

- Uit de verkeerde toets leidt de app het soort fout af:
  - **spiegelfout:** dezelfde vinger op dezelfde plaats, maar met de andere hand (bijvoorbeeld j in plaats van f). Tip voor het kind: "andere hand";
  - **buurfout:** een toets die er fysiek direct naast, boven of onder ligt (bijvoorbeeld g in plaats van f). Tip: "terug naar je plek";
  - **andere fout:** de rest.
- De paren g-h, t-y en b-n zijn allebei; het leerkrachtscherm zegt dan "spiegelfout en buurfout".
- Alles wordt afgeleid uit de fysieke ligging van de toetsen (via `event.code`), niet uit een lijst met de hand. De rijen verspringen, dus een toets raakt twee toetsen in de rij erboven en twee in de rij eronder. De plaats van de spatiebalk (onder x tot ;) is een benadering.
- Steunt op: **onderzoek** (Grudin, 1983, Error patterns in novice and skilled transcription typing): buurfouten komen het meest voor, daarna spiegelfouten.
- Wat de app niet kan meten: met welke vinger een kind typt. Dat blijft observatie door de leerkracht.

**Wat we bewaren**

- Per poging van een oefening (oefenregels, eindoefening, zoek de toets, spel, extra oefenen) een samenvatting: les, blok, datum, posities, meteen juist, en per toets (ook de spatie) aantal, fouten, verkeerde toetsen, tijdmediaan, aantal tijdmetingen en lange pauzes. Geen losse aanslagen en geen getypte tekst: dat is genoeg, en beter voor de privacy.
- Een poging wordt bewaard als de oefening af is. Stopt een kind midden in een oefening, dan wordt die poging niet bewaard.
- Extra oefenen bewaart ook (blok "extra"), zonder invloed op sterren of slot.
- **Begrenzing:** de laatste 300 pogingen blijven volledig bewaard. Oudere pogingen worden opgeteld per toets (aantal, fouten, verkeerde toetsen, lange pauzes) en daarna weggegooid; hun tijden vallen weg. Een poging is ongeveer 1 kB, dus 300 pogingen blijven ruim onder de grens van localStorage (ongeveer 5 MB), en ze zijn goed voor ongeveer 60 keer een hele les. Steunt op: **eigen keuze**.
- **Niets hiervan ziet het kind.** Het leerkrachtscherm toont per toets: aantal, fouten, de meest getypte verkeerde toets (met spiegelfout of buurfout), tijdmediaan en lange pauzes.

## 8. Voortgang en opslag

- **localStorage**, onder de sleutel `typcursus-azerty`, met een versienummer (nu 2). Elke lees- en schrijfactie zit in try/catch: lukt het niet, dan werkt de app gewoon verder, alleen zonder te bewaren.
- **Versie 2 (metingen per toets):** de oude tellingen per toets zijn vervangen door samenvattingen per poging (zie punt 7). Omdat de betekenis van de cijfers verandert (een fout telt nu een keer per positie, de tijd is een mediaan met andere regels), gaat het versienummer omhoog. Voortgang van versie 1 wordt bij het lezen omgezet (`zetOm` in `src/logica/opslag.ts`): lessen, sterren, instellingen en de toetsenbordstatus blijven zoals ze zijn; de oude tellingen per toets worden tellingen van "oudere pogingen" (het aantal fouten is daar een benadering); de oude gemiddelde tijden vallen weg, want ze zijn anders gemeten. Er gaat geen voortgang verloren.
- **Velden die later bijkwamen** (zoals `bezigBij`, `eindeBereikt` en de instelling voor de hulp) krijgen een standaardwaarde als ze ontbreken; daarvoor moest het versienummer niet omhoog.
- **Kapotte of onbekende gegevens** worden vervangen door een lege voortgang, veld per veld (`zetOm` in `src/logica/opslag.ts`). Komt er ooit een versie 2, dan komt de omzetting daar.
- **Tegen:** de voortgang hoort bij het browserprofiel. Dat is geen probleem: elk kind heeft een eigen Google-login van de school, dus een eigen profiel.

## 9. Lessen openen

- Les 0 is altijd open. Les 0 is af na de houdingsoefening (er wordt niets gemeten).
- Een volgende les gaat open bij minstens 90% op de eindoefening (90% van de posities meteen juist, zie punt 7), ook als dat de korte versie was.
- Na twee mislukte pogingen op rij komt de korte versie met een aanmoediging. Na een geslaagde poging begint de teller opnieuw.
- Een les waarvan nog niet alle blokken of spelletjes gebouwd zijn, staat op "Komt binnenkort". Dat gebeurt automatisch: zodra het spel van les 2 bestaat, gaat les 2 open.

## 9b. Verdergaan na een onderbreking

- **Waarom:** in de klas moet een les soms vroeger stoppen.
- **Hoe:** de app onthoudt per les bij welke stap het kind is (`bezigBij`). Opent het kind de les later opnieuw, dan vraagt de app "Verder bij stap 4: Over de beek?" (Enter) of "Opnieuw beginnen". Op het startscherm staat "Bezig: stap 4 van 7".
- **Per stap, niet per toets:** stopt een kind midden in een stap, dan begint het die stap opnieuw. Dat is eenvoudiger en duidelijker voor kinderen, en een stap duurt maar een paar minuten.
- Bij de afsluiter is de les rond en wordt er niets meer onthouden.
- Oudere opgeslagen gegevens zonder dit veld werken gewoon verder.

## 10. Leerkrachtscherm

- **Verborgen** achter Ctrl + Shift + L, zodat kinderen er niet per ongeluk terechtkomen. In de waarschuwing over het toetsenbord staat wel een knop "Uitleg voor de leerkracht".
- **Wissen** vraagt om het woord "wissen" te typen. Een gewoon "Ben je zeker?" klikt een kind te makkelijk weg.
- **Lesfiches:** het klassikale deel van elke les komt uit dezelfde JSON als de app. Zo zijn de handleiding en de app altijd gelijk.

## 11. Voorlezen

- Web Speech API van de browser, met een Vlaamse stem (nl-BE) als het toestel die heeft, anders een andere Nederlandse stem. Er wordt niets doorgestuurd.
- **Tegen:** de kwaliteit van de stem hangt af van het toestel.

## 12. Fien en Jef (K16)

- **Bron:** het modelblad in klare lijn `docs/beelden/fien-en-jef-modelblad.png` (gemaakt met ChatGPT, vrij te gebruiken in dit project). Zie 12f voor de keuze van de stijl.
- **Uitknippen:** `scripts/knip-figuren.py` knipt per kind vijf houdingen uit (zwaai, blij, duim, nadenkend, aanmoedigend), maakt de achtergrond doorzichtig en bewaart ze in `src/beelden/`. "trots" is dezelfde prent als "duim".
- **Bestandsgrootte:** alle prenten van Fien en Jef samen ongeveer 155 kB. Belangrijk als een hele klas tegelijk laadt.
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
- **Beekprent:** "Over de beek" gebruikt de beekprent in klare lijn (Fien en Jef links vooraan, het huis aan de overkant, een brede beek zonder stenen), verkleind tot 1080 x 720 en bewaard als WebP (89 kB). De prent is niet bijgesneden: de figuren nemen de halve hoogte in, dus bijsnijden zou voeten of dak kosten. Ze is daardoor minder breed dan de vroegere strook van 1100 x 440. De app toont de prent gecentreerd met afgeronde hoeken en tekent de rij van 12 stenen zelf, eronder.
- **Spelbeschrijvingen:** de beschrijvingen in de lesinhoud (les 1 tot 5) zijn aangepast aan K16. De repository (`src/content/nl-BE`) is vanaf nu de bron voor de lesinhoud.
- **Een uitdrukking toevoegen:** zet een zone in het script, voer het uit (`python3 scripts/knip-figuren.py`) en voeg de naam toe aan `Uitdrukking` in `src/weergave/figuren.ts`.

## 12b. Indeling van het lesscherm: altijd alles zichtbaar

- **Probleem bij de eerste test:** op de Chromebook van de klas was er minder hoogte dan verwacht (schaalinstelling, bladwijzerbalk, zoom). Het bovenste deel paste niet meer, je moest scrollen om de knop Verder te vinden, en bij "Licht aan in het huis" viel de zolder weg.
- **Oplossing:**
  - Het toetsenbord en de handen krijgen een vast deel van de schermhoogte.
  - Alles in het middelste deel (tekst, Fien en Jef, het huis, de beek, de oefenregels) schaalt mee met de hoogte die overblijft. Daarvoor gebruiken we "container query units" (`cqh`) van CSS: 1cqh is 1% van de hoogte van het middelste deel. Elke maat heeft een onder- en een bovengrens.
  - Waar niets te typen valt (afsluiter, vraag om verder te gaan), worden het toetsenbord en de handen onzichtbaar. Ze houden wel hun plaats (zie 12c).
  - "Druk op Enter om verder te gaan" en de knop Verder staan rechts in de kaart, boven de Enter-toets (zie 12c).
- **Getest** op 1366 x 768, 1366 x 657, 1280 x 600, 1280 x 560 en 1024 x 600, opnieuw na de nieuwe vormgeving (K19): in geen enkele stap van les 0 en les 1 moet er nog gescrold worden. Dat is nagekeken door beide lessen automatisch te doorlopen in Chrome, ook de melding "je toetsenbord staat niet goed" en extra oefenen. Niet nagekeken op een echte Chromebook.
- **Tegen:** op een heel klein scherm worden de letters en figuren kleiner. De ondergrenzen zorgen dat ze leesbaar blijven.

## 12c. Rustige schermen: vaste zones, niets verspringt

**Steunt op:** eigen keuze, en vaststellingen van Nick bij het testen (27 november 2026). Sluit aan bij K16 in projectdocument 14.

**Wat Nick zag:**
- In les 0, "Duim op de spatiebalk", verscheen de kaart "spatie" pas als de lamp aanging, en de lamp sprong dan naar boven.
- In "Klaar voor de start" was het scherm te druk. De opdracht viel weg in het geheel: zelfs als volwassene had Nick niet door dat hij op de spatiebalk moest drukken.
- Op het eindscherm van "Licht aan in het huis" kwam een schuifbalk, en "Druk op Enter" en de knop Verder vielen half weg.

**Waarom dit belangrijk is:** een kind dat leert typen, moet zijn aandacht bij de opdracht en de toetsen houden. Een element dat verspringt, trekt de blik weg. En een opdracht die niet opvalt, kan het kind niet uitvoeren.

**De regel, voor elk oefenscherm, ook voor toekomstige oefeningen en spelletjes:**
1. **Vaste zones in de witte kaart.** De opdracht staat bovenaan, Fien en Jef links, de prent of het signaal in het midden, "Druk op Enter" rechts (boven de Enter-toets van het toetsenbord), en de voortgang langs de onderrand. Onder de kaart staan de handen, het toetsenbord en de hulpregel. De code staat in `src/blokken/oefenscherm.ts`: een nieuw blok of spel roept `oefenscherm()` op en zet zijn inhoud in `veld`.
2. **Wat later verschijnt, staat er van bij het begin.** Het neemt zijn ruimte al in. Tonen en verbergen gaat via zichtbaarheid (`startVerborgen()`, `toon()`), nooit door elementen toe te voegen of weg te halen. Dat geldt ook voor het toetsenbord: waar niets te typen valt, wordt het onzichtbaar, maar het houdt zijn plaats.
3. **Fien en Jef, de lamp en de prent veranderen nooit van plaats**, ook niet als de opdracht langer of korter wordt. Elk figuurtje heeft een vak met een vaste maat: een andere houding verschijnt op dezelfde plek.
4. **Verschijnen gaat met een korte, rustige overgang** van 180 ms. Vraagt het toestel om minder beweging (`prefers-reduced-motion`), dan gebeurt het meteen. Dit is de enige beweging naast de toets en de vinger die oplichten (stijlgids, deel 1).
5. **De opdracht is het duidelijkste element van de kaart:** groot en vet, altijd op dezelfde plek. De toets die het kind moet indrukken, staat getekend in de zin. In de teksten schrijf je dat als `[spatie]` of `[A]`, en vet als `**zolder**`.
6. **Een signaal op een vaste plek.** De lamp staat in het midden, dicht bij de opdracht. Het verschijnt en verdwijnt alleen, en concurreert niet met de opdracht.
7. **De oefenregels en "Over de beek" houden hun eigen indeling van K19** (tip links, kaart met regels; prent boven, stenen onder). Ook daar staat alles er van bij het begin: de volgende regels nemen altijd twee regels in, het einde van de beek verschijnt alleen, en de steen die aan de beurt is wordt groter zonder de andere stenen te verschuiven.

**Hoe we het controleren:** een testscript (Playwright) doorloopt les 0 en les 1 op zes schermformaten, van 1920 x 950 tot 1280 x 500. Per stap meet het of er gescrold moet worden en of de zones, Fien en Jef, de lamp, het huis, de prent van de beek, de stenen of het toetsenbord van plaats of grootte veranderen.

**Tegen:**
- Een vaste zone laat soms lege ruimte: bij de afsluiter blijft de plaats van het toetsenbord leeg. Dat is bewust: liever een rustige lege plek dan iets dat verspringt.
- "Druk op Enter" staat rechts in plaats van midden onderaan. Zo blijft er meer hoogte voor de prent, en staat de aanwijzing boven de toets waar het over gaat.

## 12d. Een aanslag gaat nooit verloren

**Steunt op:** eigen keuze, na een vaststelling van Nick: als hij snel typte op het moment dat een nieuwe letter verscheen, telde zijn toets niet.

**Wat we vonden** (in de code, en bevestigd met een test):
- "Over de beek" negeerde na elke beek 0,9 seconde alle toetsen.
- "Licht aan in het huis" negeerde na een juiste toets 0,5 seconde alle toetsen.
- "Zoek de toets" en de oefenregels wachtten op het einde 0,4 seconde voor het volgende blok kwam; wat het kind in die tijd typte, ging verloren.
- Een knop in de bovenbalk met de focus (bijvoorbeeld "Voorlezen", na een muisklik) slokte een spatie of Enter op.
- De regel tegen een ingedrukt gehouden toets was niet de oorzaak: die filtert alleen herhalingen van dezelfde ingedrukte toets.

**De regel:** de volgende letter, regel, beek of ronde is geldig vanaf het moment dat de vorige juist getypt is. Overgangen zijn alleen visueel en blokkeren geen invoer.

**Bewuste uitzonderingen:**
- In "Licht aan" telt na een **foute** toets 0,9 seconde niets, zodat rammen niet helpt (afspraak uit document 11).
- In "Duim op de spatiebalk" en "Klaar voor de start" telt de spatiebalk alleen als de lamp brandt: dat is de oefening zelf. Wie te vroeg drukt, krijgt "Wacht op de lamp." te zien (zie 12f, punt 2).

**Test:** `tests/snel-typen.test.ts` stuurt juiste toetsen telkens 30 ms na elkaar, in "zoek de toets", de oefenregels (ook over de grens tussen twee regels), "Over de beek" (ook meteen na een beek) en "Licht aan", en kijkt na dat elke aanslag telt.

**Twee keer dezelfde letter na elkaar:** in "zoek de toets" verschijnt de letter bij elke nieuwe kaart kort opnieuw (180 ms, alleen doorzichtigheid, geen beweging). Zo zie je ook bij twee keer dezelfde letter dat de vorige toets telde. Steunt op: eigen keuze, door Nick goedgekeurd.

## 12e. De grote letter, de lamp, de voortgang en het huis

- **De grote letter op haar kaart (zoek de toets).** De kaart heeft een vaste maat en elke letter staat op dezelfde basislijn, met ruimte boven voor stokletters, hoofdletters en accenten en onder voor staartletters (g, j, p, q, y). Bij de spatie staat een getekende spatiebalk in dezelfde kaart (zie 12f, punt 4). Nagekeken met een schermafbeelding van alle 26 kleine letters, de hoofdletters, de leestekens en de accentletters. Steunt op: vaststelling van Nick (de j stond te laag en raakte de rand).
- **De lamp van "Duim op de spatiebalk" (les 0).** Een getekende gloeilamp die van bij het begin (uit) in beeld staat en zichtbaar aangaat: uit donker `#3B4256`, aan lichtgeel `#FFEE99` met stralen errond, omtrek `#1F1F1F` zoals het huis. De stralen zorgen dat je het ook zonder kleur ziet. In de opdracht staat een klein beeldje van dezelfde lamp naast het woord "lamp". De opdracht is nu: "Leg je duimen op de spatiebalk. Gaat de lamp aan? Druk!" De kaart "spatie" die er vroeger bij verscheen, is weg. Waarom: de oude zin verwees naar een huis dat niet in beeld stond, en Nicks dochter van 11 vroeg "welk lampje?". Een doel, een voorwerp, een signaal. Steunt op: eigen keuze, te toetsen door een kind de oefening zonder uitleg te laten doen.
- **De voortgang van een oefening (K20).** Op elk oefenscherm op dezelfde plek: een dunne, grijze balk langs de onderrand van de witte kaart, met rechts klein de teller ("10 van 12"). Geen vingerkleur. Bij "Over de beek" tonen de stenen zelf hoe ver je bent; daar staan alleen drie bolletjes voor de beken. Waarom: de opdracht en de prent zijn waar het kind moet kijken; de voortgang bekijkt het maar af en toe en hoort dus aan de rand. Steunt op: eigen keuze (K20 in projectdocument 14).
- **Het huis van "Licht aan in het huis" (K21).** Een vectortekening in de code, volgens de referentie van Nick. Vier even hoge lagen van 66: het dak, de zolder, de woonkamer en de kelder (onder de grondlijn). Het dak is in de cursus de cijferrij, een vierde rij boven de zolder (projectdocumenten 08, 10 en 18): de zolder zit dus niet in het dak. In les 0 tot 5 blijft het dak leeg; de plaats voor een vierde rij ramen en het woord "dak" is al voorzien in de code. Negen gelijke ramen, omdat de rijen op het toetsenbord ook gelijk zijn. De woorden staan in een eigen kolom links, nooit over de tekening. De vakjes zijn groter dan in de referentie (150 x 40 in plaats van 100 x 28, letters van 24 in plaats van 17), omdat de woorden op een kleine Chromebook anders maar 11 tot 13 pixels groot waren; door Nick goedgekeurd. Er knippert niets (K16): het vakje van het woord dat aan de beurt is, wordt donker en blijft stil staan. Fien en Jef staan naast het huis, niet in een raam; de slotzin is daarom "Alle lichten branden! Goed gedaan!" (vroeger: "Fien en Jef zwaaien uit het raam"). Steunt op: eigen keuze. De raamkleuren (aan `#FFEE99`, uit `#3B4256`) steunen op onderzoek (methode): zie de stijlgids, deel 8.

## 12f. Tekenstijl: klare lijn

- **Keuze:** alle prenten en de voorwerpen die de app zelf tekent, staan in klare lijn (stripstijl): een dunne zwarte omtrek, vlakke en zachtere kleuren, levendige ogen. De indeling van de schermen, het toetsenbord, de handen, de vingerkleuren en de achtergrond zijn niet veranderd.
- **Wat is omgezet:** de twaalf prenten van Fien en Jef (nieuw modelblad), de beekprent, het huis van "Licht aan" en de lamp. In het huis en de lamp: omtrek van bruin `#4A2E1A` (3 dik) naar zwart `#1F1F1F` (1,8 dik) en zachtere vlakken (dak `#D8693B`, muur `#FBE8D3`, kelder `#BDB8AE`, grond `#D9C3A0`, struiken `#A9BF6B`). De opbouw van het huis (K21, vier lagen, negen ramen) is dezelfde.
- **Raamkleuren ongewijzigd:** licht aan `#FFEE99` en licht uit `#3B4256` blijven. De meting tegen de vingerkleuren (stijlgids deel 8) geldt dus nog.
- **Waarom:** Nick vond de eerste stijl te kleuterachtig voor kinderen van 10 tot 12 jaar. Hij koos uit drie uitgewerkte stijlen de klare lijn (27 november 2026, projectdocument 17, W7). Een stijl die ook bij Belgische strips aansluit, helpt bovendien om anders te zijn dan Typ10.
- **Waarop steunt dit? Eigen keuze.** Er is geen onderzoek dat zegt welke tekenstijl beter werkt bij deze leeftijd. Te toetsen: vragen aan de kinderen in de klastest.
- **Tegen:** de prenten van Fien en Jef zijn wat smaller en rustiger; ze vallen minder op naast de opdracht. De beekprent toont het huis kleiner dan vroeger.

## 12f. Kleine bijsturingen (K23, projectdocument 14)

Steunt op: eigen keuze van Nick, na het testen. De tekenstijl en de indeling blijven ongewijzigd.

1. **"Klaar voor de start" (les 0) gebruikt de lamp, geen klap meer.** Fien en Jef zeggen "Voeten plat, rug recht!". Daarna is de opdracht: "Leg je handen in de woonkamer. Gaat de lamp aan? Druk op de spatiebalk." Het kind drukt drie keer. Waarom: zo is er in heel les 0 een enkel signaal voor "druk nu". De oude zin zei bovendien dat Jef klapt, terwijl hij stilstaat.
2. **Te vroeg drukken bij beide lampoefeningen:** onder de lamp verschijnt "Wacht op de lamp.". Die plek is van bij het begin voorzien, zodat er niets verspringt. De zin verdwijnt als de lamp aangaat, en het telt niet als fout. Waarom: een toets zonder reactie voelt alsof hij kapot is. Test: `tests/snel-typen.test.ts`.
3. **"Licht aan in het huis": er is niets veranderd.** Na een juiste toets is de volgende verdieping meteen aan de beurt, en het raam dat aanging blijft branden. De enige wachttijd (900 ms) komt na een foute toets: zo telt alleen de eerste toets per ronde, en helpt rammen niet (zie 12d).
4. **"Zoek de toets": bij de spatie staat een getekende spatiebalk in de kaart** in plaats van het woord "spatie". De kaart houdt dezelfde maat. De opdracht in les 1 is nu "Druk op de toets die je ziet." in plaats van "de letter". Waarom: de spatie is geen letter.
5. **De afsluiter voegt zelf "Nog niet alle sterren? Probeer de eindoefening nog eens, wij wachten op je." toe** als het kind minder dan drie sterren heeft, voor elke les (tekst `eind.nietAlleSterren`). De zin staat niet meer in de lestekst van les 1. Waarom: vroeger stond hij er ook bij drie sterren.
6. **De intro van les 0 toont het huis van "Licht aan in het huis"**, met alle ramen uit, het dak leeg en de woorden zolder, woonkamer en kelder links, naast de tekst "Dit is ons huis: het toetsenbord...". Het is dezelfde tekening (`maakHuis` in `src/spellen/lichtaan.ts`), en het veld `"prent": "huis"` in de lesdata zet ze aan. Waarom: woord en beeld kloppen, en het kind kent het huis al voor het spel begint.

## 12g. Hulp bij "Licht aan in het huis": welke rij is de woonkamer?

**Steunt op:** vaststelling van Nick ("Druk op een toets van de woonkamer" is voor een kind vaag) en eigen keuze, door Nick goedgekeurd.

- **In de eerste drie rondes (woonkamer, zolder, kelder) licht de gevraagde rij op het schermtoetsenbord op.** Het woordvakje in het huis krijgt dezelfde blauwe rand. De opdracht zegt er ook bij waar de rij ligt: "Druk op een toets van de **woonkamer**: de middelste rij." Voor de zolder is dat "de bovenste rij", voor de kelder "de onderste rij".
- **Vanaf ronde 4 verschijnt die hulp alleen als het niet lukt:** na een foute toets, of als het kind 3 seconden wacht. Ze blijft staan tot de juiste toets er is.
- **De kleur van de hulp:** accentblauw, de kleur van de knoppen. Geen vingerkleur, en geen geel, want geel betekent "licht aan".
- **Waarom:** huis en toetsenbord staan op een andere plek, en niets verbond ze. Dezelfde rand op beide toont dat ze bij elkaar horen. De hulp wordt afgebouwd, zoals bij de hulp in de oefenregels (K17), zodat het kind daarna zelf leert welke rij welke verdieping is.
- **En de leerkracht?** In het klassikale deel van les 0 roept de leerkracht "Hand op de zolder!" en wijst de rij aan. De app herhaalt dat. Toch is de hulp in de app nodig: de cursus moet ook zonder leerkracht werken (doel in document 08), en tijdens het online deel zitten veel kinderen tegelijk aan hun Chromebook.
- **Test:** `tests/snel-typen.test.ts` gaat na dat de hulp er is in de rondes 1 tot 3, er niet is in ronde 4, en verschijnt na een fout en na 3 seconden wachten.

## 12h. Opdrachten die zeggen wat je doet en waar je naartoe werkt (K26)

**Steunt op:** eigen keuze, na de vaststelling bij drie testers op 27 november 2026 (Nick, zijn dochter van 11, en een volwassene zonder uitleg). Regels in docs/stijlgids.md, deel 9; uitwerking in projectdocument 21. Beslist door Nick ("werk uit wat nodig is").

- **Een doelzin bij elk spel** (nieuw veld `doel` in de lesdata, verplicht). In "Licht aan in het huis" staat hij in een tekstballon boven Fien en Jef (`oefenscherm`, optie `doel`), en wordt hij voorgelezen bij de start. Waarom: de opdracht ("Druk op een toets van de woonkamer") zei niet waarom je drukt; niemand wist dat je de lichten aandeed.
- **"Over de beek": de doelzin boven de opdracht, en de opdracht even groot als op de andere oefenschermen.** Waarom: een tester wist niet dat ze onderweg was naar huis, en de opdracht stond in kleine letters (tegen K20). Fien en Jef staan in de prent, dus hier staat de doelzin niet in een tekstballon. Het slot blijft "Droge voeten!" en zegt niet "We zijn thuis": de prent toont dat nog niet. De stenen in het water en Fien en Jef op het einde bij hun huis volgen met het spelsjabloon (K22).
- **"Terug naar huis" heet nu "terug naar je plek"**, in de lessen, de klassikale stappen, de doelen, de tips en de uitleg op het leerkrachtscherm. Waarom: in les 0 is het huis het hele toetsenbord. Een vinger die op de zolder is, is nog in het huis; "terug naar huis" sprak dat tegen. De regel zelf (na elke toets terug naar de thuistoets, document 08) blijft dezelfde. "Fien en Jef thuis" blijft: dat is de startzin, de wijsvingers op de F en de J.
- **Nieuwe teksten in les 0 en 1:** de intro's zeggen waar elke rij ligt en wat de les brengt; "Klaar voor de start" zegt "Leg je vingers in de woonkamer, de middelste rij."; de eindoefening zegt waarvoor ze dient ("Typ bijna alles juist, dan gaat les 2 open."). Oud en nieuw naast elkaar, met het waarom: projectdocument 21.
- **Doelzinnen voor de spelletjes van les 2 tot 5** staan al in de lesdata, met een opdracht ("Typ de letter die je ziet." of "Typ het woord dat je ziet."). Die spelletjes zijn nog niet gebouwd; ze volgen het sjabloon van K22, waarin de letter of het woord in het midden staat.
- **Test:** `tests/inhoud.test.ts`, "opdrachten en doelzinnen (K26)".

## 12i. De grote toets op het oefenbord: een vaste maat en een vaste basislijn

**Steunt op:** vaststelling van Nick (27 november 2026: de p raakte de onderrand van de kaart) en dezelfde regel als de grote letter in "Zoek de toets" (K20, punt 12c).

- De kaart op het oefenbord heeft nu dezelfde opbouw als de kaart in "Zoek de toets": een vaste breedte en hoogte, elke letter op dezelfde basislijn, met plaats onder voor staartletters (g, j, p, q, y) en boven voor hoofdletters en accenten.
- Het woord "spatie" staat kleiner in een kaart van dezelfde maat. Waarom: de kaart verspringt niet meer tussen twee toetsen.

## 12j. Rust en overzicht (K27)

**Steunt op:** eigen keuze, beslist door Nick op 27 november 2026, na vaststellingen bij het testen. Het principe (afleidende details doen minder leren) steunt op onderzoek: Rey (2012) en Sundararajan en Adesope (2020), met de kanttekening dat dat over leren uit tekst gaat, niet over typen. De acht regels staan in docs/stijlgids.md, deel 10.

**Wat de testers zagen:** de schermen waren druk. Wat bij elkaar hoort, stond ver uit elkaar, er waren twee manieren om verder te gaan (de zin "Druk op Enter" en de knop Verder), en een knop leek geen knop. Nick: "Ook altijd nadenken of onze beelden niet te druk, maar overzichtelijk zijn. Te veel prikkels zijn niet goed." Bij het slot van extra oefenen: "De mannetjes staan heel ver links, de knoppen rechts. Het midden is wit met daarboven tekst."

**Fase 1: wat is veranderd**

- **De knop Verder met de Enter-toets erin** (`scherm.toonEnter()`), in plaats van de zin "Druk op Enter om verder te gaan" met een knop eronder. Waarom: een manier om verder te gaan, en minder tekst. Enter blijft werken, en de Enter-toets op het schermtoetsenbord licht nog altijd op. Dit is een gedeeld onderdeel: het verandert ook op de toetsenbordcheck, het einde van "Licht aan in het huis" en de start van een korte eindoefening. Daar staat de knop voorlopig nog rechts (fase 2).
- **Opbouw "midden"** (`oefenscherm(ctx, { opbouw: "midden" })`): Fien en Jef, hun tekstballon en de prent als een groep in het midden, de knoppen er vlak onder. Gebruikt in de intro van elke les en op het einde van extra oefenen.
- **Intro van les 0:** Fien en Jef staan vlak naast hun tekstballon, het huis met de woorden staat er rechts naast en is kleiner dan de tekst. De knop Verder staat onder de groep. De tekst is dezelfde.
- **Einde van extra oefenen:** "Goed geoefend! ..." staat in een tekstballon naast Fien en Jef (het is wat ze zeggen, geen opdracht), de twee knoppen staan eronder naast elkaar. "Naar de lessen" is de hoofdknop (vol blauw), want dat is de knop die Enter kiest; dat was al zo, maar de blauwe knop was toen de andere. "Nog een keer extra oefenen" is een tweede knop.
- **Tweede knop:** lichte vulling, geen zichtbare rand (klasse `knop-tweede`). Waarom: een witte knop met een rand en een focusring erom leek op een invulvak. Dit verandert ook de knoppen "Extra oefenen" op het startscherm.
- **De knop Start bij de lamp** ("Duim op de spatiebalk" en "Klaar voor de start", zie 12k): de knop staat onder de lamp, met de Enter-toets erin, en niet meer rechts aan de rand. De zin "Lees de opdracht. Klaar? Druk op Enter om te starten." is weg: de opdracht staat er vlak boven en de knop zegt wat hij doet. De volgorde is vast: lamp, de plek voor "Wacht op de lamp." of "Druk eerst op Start.", knop. Elk heeft zijn plaats van bij het begin, dus er verspringt niets als de knop na de start verdwijnt. De lamp is daardoor wat kleiner.
- **De toets in een opdracht** is niet meer hoger dan de regel, en een opdracht van twee regels breekt in twee ongeveer even lange regels. Waarom: bij "Klaar voor de start" werd de toets [spatie] onderaan afgesneden.

**Bewust niet veranderd in fase 1:** "Over de beek" (houdt de zin "Druk op Enter" tot het spelsjabloon van K22), de lesteksten, de afsluiter van een les, "Licht aan in het huis", het startscherm en de vraag "Je was al bezig met deze les". Die volgen in fase 2, als Nick akkoord is met de twee schermen.

**Nagekeken** met schermafbeeldingen voor en na op 1366 x 768 en 1280 x 720: geen schuifbalk, niets afgesneden.

**Tegen:**
- De knop Verder staat op de praatschermen onder de groep en op de oefenschermen nog rechts. Dat wordt gelijkgetrokken in fase 2.
- Op het einde van extra oefenen blijft de kaart half leeg, en de plaats van het toetsenbord ook (12c).

## 12k. Eerst lezen, dan starten (K28)

**Steunt op:** vaststelling van Nick (27 november 2026): bij "Duim op de spatiebalk" ging de lamp al branden voor het kind de opdracht gelezen had. Eigen keuze voor de oplossing. Regel in docs/stijlgids.md, deel 9.

- **"Duim op de spatiebalk" en "Klaar voor de start" beginnen met een startstap.** De opdracht en de lamp (uit) staan in beeld, met de zin "Lees de opdracht. Klaar? Druk op Enter om te starten." en de knop Start (sinds K27 alleen de knop Start met de Enter-toets erin, onder de lamp: zie 12j). Pas na Start gaat de lamp na een korte tijd aan. Waarom: het kind moet de opdracht kunnen lezen of laten voorlezen voor er iets gebeurt.
- **Een spatie voor de start** toont onder de lamp "Druk eerst op Start." (op de vaste plek van "Wacht op de lamp."). Geen aanslag, geen fout. Waarom: een toets zonder reactie voelt als kapot (K23).
- **"Klaar voor de start": "Voeten plat, rug recht!" staat nu in de tekstballon van Fien en Jef**, en de opdracht staat meteen bovenaan. Vroeger stond eerst "Voeten plat, rug recht!" als opdracht en wisselde die na 2 seconden naar de echte opdracht: dat versprong (K20) en gaf minder leestijd.
- **`oefenscherm.toonEnter(actie, "start")`** toont de Enter-regel met "om te starten" en de knop Start; `verbergEnter()` verbergt ze weer. Geldt voor elke toekomstige oefening waarin iets vanzelf gebeurt, zoals Letterregen (K24).
- **Test:** `tests/snel-typen.test.ts`: zonder Start gaat de lamp nooit aan, ook niet na 10 seconden; een spatie voor de start geeft "Druk eerst op Start." en telt niet.

## 12l. Het spelsjabloon, met "Over de beek" erin (K22)

Gebouwd op 27 november 2026 (tak `claude/spelsjabloon`), na een mockup die Nick zag. Opdracht: `docs/opdrachten/2026-11-27-spelsjabloon.md`. Regels: `docs/stijlgids.md`, deel 11.

- **Keuze:** elk spel in een les krijgt dezelfde indeling: de opdracht bovenaan, wat het kind typt groot in het midden (zoals bij de oefenregels), de doelzin links in een tekstballon, en onderaan een strook: de prent van het spel, die ook de vooruitgang toont.
- **Waarom:**
  - De letter stond op de steen die aan de beurt was, klein, en schoof bij elke toets een plaats op. Nick en zijn dochter misten eerder een opdracht omdat er iets versprong (12c). Nu kijkt het kind in elk spel naar dezelfde plek, en dat is dezelfde plek als bij de oefenregels.
  - Een volwassene zonder uitleg vroeg bij dit spel: "Hoe ben ik aan het huis geraakt?" De prent toonde de reis niet. Nu ligt er bij elke goede toets een steen bij in de beek, en staan Fien en Jef op het einde bij hun huis: wat de tekst belooft, zie je gebeuren (12h).
  - Er stonden drie lagen onder elkaar (prent, rij stenen, bolletjes). Nu is er een: de strook. De teller en de bolletjes zijn weg, want de stenen tonen zelf hoe ver je bent (12j: wie iets toevoegt, haalt iets weg).
  - De spelletjes van les 2 tot 5 zijn nog niet gebouwd. Een sjabloon bouw je een keer; daarna is een spel een strook, een lijst en een slotzin.
- **Drie keuzes van Nick (27 november 2026):**
  1. *De app tekent de strook zelf*, in de klare lijn. Waarom: ze past altijd exact en er is geen nieuwe prent per spel nodig. De strook is in lagen gebouwd (achtergrond, stenen, figuren), zodat de achtergrond later een prent uit een beeldgenerator kan worden zonder het spel te herbouwen. Kanttekening: de verhouding (1270 op 150) is erg breed en laag voor een beeldgenerator.
  2. *De letters staan in het midden*, niet op de stenen. Het spel lijkt daardoor meer op de oefenregels; dat is de bewuste prijs.
  3. *Fien en Jef zwaaien op het einde.* Alleen van die houding bestaat een prent van kop tot voeten.
- **Kleine keuzes bij het bouwen:**
  - De opdracht is "Typ wat je ziet.", dezelfde woorden als bij de oefenregels. "Typ de letter op de steen" klopt niet meer.
  - De slotzin is "Droge voeten! We zijn thuis." en staat op de plaats van de opdracht; de knop Verder komt op de plaats van de regel. Zo staat alles in de middenkolom (12j) en verspringt er niets (12c).
  - De plaats van de volgende steen heeft een donkere rand, niet blauw: blauw is de kleur van de wijsvinger.
  - Bij een fout krijgt de letter een stippelrand; er schudt niets (12).
  - De plaatsen waar nog een steen komt, zijn te zien als een dun stippellijntje: het kind ziet van bij het begin de drie rijen uit de doelzin.
  - De beekprent (`src/beelden/beek.webp`) is uit de app gehaald; ze blijft bewaard in `docs/beelden/prenten/spel-beek.webp`.
  - De strook is hoogstens 38% van het podium hoog. Op een lager scherm krimpt de tekening; de vlakken lopen door buiten het kader, zodat de strook gevuld blijft.
- **Tegen:** het spel lijkt meer op de oefenregels, en de getekende strook is eenvoudiger dan de prenten uit de beeldgenerator.
- **Waarop steunt dit? Eigen keuze**, als toepassing van 12 (rust), 12c (vaste zones), 12h (opdrachten) en 12j (overzicht). Het onderzoek achter 12 gaat over leren uit tekst en uitleg, niet over typen.
- **Wat ons van mening zou doen veranderen:** zegt een kind van 9 of 10 jaar dat het spel saai is, of ziet het geen verschil met de oefenregels, dan krijgt het spel een korte beloning op het einde of een kleine verandering in de strook, nooit in de tekst.
- **Nog niet gedaan:** het huis op de strook is het huis van de prenten (met een puntgevel), niet het huis met vier lagen van "Licht aan in het huis" (12e). Dat zijn nu twee huizen in de app. Niet getest op een echte Chromebook.

## 12m. Bijsturingen na de test van 28 november

Nick testte op 28 november op een groot scherm, deels met een kind. Dit zijn de fouten en tekstpunten; de vormgeving volgt in een aparte beurt met Fable (projectdocument 22).

- **Toetsenbordcheck: "In orde! Je toetsenbord typt de juiste letters."** in plaats van "Je toetsenbord klopt!". De titel bovenaan heet "Je toetsenbord nakijken" in plaats van "Klopt je toetsenbord?". Ook de wachtzin zegt nu wat er gecontroleerd wordt: "We kijken even of je toetsenbord de juiste letters typt...". Waarom: een kind vroeg "Mijn toetsenbord klopt?". Op een Chromebook leest de app de indeling meestal zelf, zodat de uitkomst meteen verschijnt; dan moet de zin zelf uitleggen wat er gebeurd is.
- **Toetsenbordcheck: een ingehouden Enter telt niet.** Een herhaalde Enter (`event.repeat`) van het vorige scherm slaat de uitkomst niet meer over. Waarom: de uitkomst verschijnt meteen, en een kind dat Enter iets te lang indrukt, zag ze anders niet.
- **Lampopdrachten: "druk eerst op Start" staat in de opdracht.** "Leg je duimen op de spatiebalk en druk eerst op Start. Gaat de lamp aan? Druk [spatie]." en hetzelfde in "Klaar voor de start". Waarom: Nick vond het niet duidelijk dat de lamp pas na Start komt (K28). Drie korte zinnen, binnen de grens van de test.
- **De lamp wacht na Start een seconde langer:** 1,9 seconde in "Duim op de spatiebalk" (was 0,9), 2,2 seconden in "Klaar voor de start" (was 1,2). De tijd tussen twee lampen blijft. Waarom: Nick vond de wachttijd goed, behalve meteen na Start: dan moet je je handen nog klaarleggen.
- **"Over de beek", slotzin: "Het is je gelukt! We zijn thuis."** in plaats van "Droge voeten! We zijn thuis." Waarom: keuze van Nick; de zin zegt rechtstreeks dat het kind het gedaan heeft.
- **De intro van les 0 in alinea's.** Een witregel in een introtekst (`\n\n` in de lesdata) wordt een nieuwe alinea in de tekstballon, met een halve regel wit ertussen. Waarom: de tekst was een blok van vijf zinnen; in drie alinea's (wie we zijn, de rijen, wat je vandaag leert) leest hij rustiger.

## 12n. Nieuwe startzin (28 november 2026)

- **Keuze:** de startzin is "Voeten plat, rug recht, schouders los, vingers thuis!". Les 0 leert "Voeten plat, rug recht, schouders los."; vanaf les 1 komt "vingers thuis!" erbij. Beslist door Nick.
- **Waarom:** de oude zin ("Voeten plat, rug recht, Fien en Jef thuis!") sprak niet aan, en "Fien en Jef thuis" klonk raar bij het hardop zeggen: twee stukjes over je lichaam, en dan plots twee figuurtjes zonder werkwoord. De nieuwe zin heeft vier keer hetzelfde patroon (een lichaamsdeel en hoe het moet) en loopt van onder naar boven door het lichaam. De volledige redenering, met de varianten die we niet kozen, staat in projectdocument 08 (7.4).
- **Wat veranderde:** `startzin` en `houding.zeg` in teksten.json; in les 0 het doel, de klassikale stap, de beschrijving van "Klaar voor de start" en de tip; in les 1 de stap "De hele startzin" en de tip ("Vingers thuis" voor de startpositie); in les 2 de stap "Startzin en opwarmen"; de stijlgids (wat "thuis" betekent) en de testlijst.
- **Wat bleef:** "Dan zijn Fien en Jef thuis" (intro van les 1) en "Fien en Jef blijven thuis" (les 2 tot 4). Die zinnen leggen uit wat "thuis" is: de wijsvingers op de bultjes.
- **Nog niet aangepast:** de afdrukbare houdingskaart op het ontwerpcanvas, waar de startzin bovenaan staat (op de prent zelf staat geen tekst), en de bewegingspauze, die nog niet in de lesdata zit (13c in de takenlijst). docs/08 en docs/11 in deze map zijn oude kopies; de projectdocumenten zijn de actuele versie.
- **Waarop steunt dit? Eigen keuze**, na het hardop proberen door Nick. Nog te toetsen bij een kind van 9 of 10 jaar en in de klastest.


## 12o. Nieuwe Fien en Jef: het blad met zes houdingen (28 november 2026)

- **Keuze:** de figuren in de app komen nu uit `docs/beelden/fien-en-jef-zes-houdingen.png`: de eerste stripstijl van ChatGPT, slanker en ouder. Alleen de prenten in `src/beelden` zijn vervangen; de indeling van de schermen is niet veranderd.
- **Waarom nu:** Nick wil de nieuwe figuren al zien bij de test op een Chromebook (30 november). De rest van de opdracht `docs/opdrachten/2026-11-28-vormgeving-na-test.md` (rijen benoemen, rust en overzicht, schalen) blijft voor na die test. Punt 1 van die opdracht is hiermee gedaan.
- **Waarom deze figuren:** Nick vond deze stijl mooier en beter passen bij kinderen van 9 tot 12 jaar (projectdocument 22).
- **Hoe (`scripts/knip-figuren.py`):**
  - het script zoekt de twaalf figuren zelf op het blad, aan de lege kolommen ertussen;
  - de roomwitte achtergrond wordt doorzichtig, ook tussen paardenstaart en nek; het koele wit van schoenen, ogen en tanden blijft; het lichte randje rond de zwarte lijn gaat weg, zodat er geen wit randje staat op het gras van de strook;
  - elke houding krijgt dezelfde lichaamslengte en dezelfde voetlijn, en Fien en Jef houden hun verhouding van het blad (Jef is iets groter). Zo verspringt er niets als een houding wisselt (K20);
  - "zwaai" is de hele figuur; de vijf andere houdingen zijn afgesneden op de helft van de prent (ter hoogte van de zak van de trui), zoals de vorige figuren, omdat de zones naast de oefening daarvoor gemaakt zijn;
  - "trots" is nu een eigen houding en geen kopie van "duim" meer.
- **Wat opvalt:** de nieuwe figuren hebben een kleiner hoofd, dus de gezichten naast de oefening zijn kleiner dan vroeger. Groter tonen vraagt een andere indeling; dat hoort bij de opdracht voor na de Chromebook-test (Fien en Jef groot in het midden).
- **Waarop steunt dit? Eigen keuze** (oordeel van Nick), te toetsen in de klastest: spreekt de stijl kinderen aan?


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
- Wel hebben we gekeken hoe Keybr telt: een fout een keer per positie, en tijden onder 40 ms niet meetellen (zie punt 7). Dat zijn ideeen, geen code. Projectdocument 12 liet ook toe om de toetsenbordindeling en de telwijze van Keybr over te nemen met bronvermelding; dat was niet nodig.

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
- **Altijd volledig in beeld.** Op Nicks laptop (Windows, met taakbalk) werden de benen van Fien en Jef afgesneden. Het startscherm is nu precies zo hoog als het venster. Fien en Jef hebben links een vaste zone die meeschaalt met de hoogte: de tekstballon bovenaan, de figuurtjes eronder, nooit afgesneden. Alleen de lijst "Alle lessen" mag scrollen als ze langer wordt. Nagekeken van 1366 x 768 tot 1280 x 440.

## 18. Extra oefenen (K15)

- **Keuze:** bij elke les (behalve les 0) kan het kind extra oefenen. Een beurt is 4 nieuw samengestelde oefenregels van 15 tot 25 tekens, en daarna een korte afsluiter van Fien en Jef.
- **Wanneer gaat het open?** Zodra het kind de les een keer tot het einde gedaan heeft (tot bij de afsluiter), ook als het de 90% niet haalde. De volgende les gaat nog altijd pas open bij 90% op de eindoefening. In de voortgang is dat een nieuw veld per les, `eindeBereikt`; een les die al gelukt was, telt meteen mee.
- **Telt niet mee:** de score van extra oefenen verandert niets aan sterren, pogingen of het slot van de volgende les. De metingen per toets worden wel bewaard (als poging met blok "extra", zie punt 7), voor het leerkrachtscherm.
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


## 19. Licentie: alle rechten voorbehouden (27 november 2026)

- **Keuze:** de code, de lesinhoud, de teksten en de prenten vallen vanaf nu onder "alle rechten voorbehouden" in plaats van AGPL-3.0. De repository blijft publiek. Anderen mogen de code bekijken, maar niet gebruiken, kopieren, aanpassen of verspreiden zonder schriftelijke toestemming van Nick.
- **Waarom:** Nick wil de mogelijkheid openhouden om van de cursus (een deel van) zijn job te maken, bijvoorbeeld met een betalend leerkrachtoverzicht of een opdrachtgever die de ontwikkeling betaalt. Zolang het verdienmodel niet vastligt, houdt hij alle rechten bij zichzelf. De cursus blijft gratis voor leerlingen.
- **Waarom niet langer AGPL:** AGPL was gekozen zodat we onderdelen van Keybr mochten hergebruiken (projectdocument 01). Dat is niet gebeurd (punt 15), dus die verplichting geldt niet.
- **Waarom publiek en niet privé:** GitHub Pages is op het gratis plan alleen beschikbaar voor publieke repositories (GitHub Docs, "GitHub Pages limits"). Een publieke repository houdt de testlink voor de klastest gratis werkend. Een privé-repository blijft mogelijk als Nick ook niet wil dat anderen de code zien; dan moet de app via GitHub Pro, Netlify of Cloudflare Pages online.
- **Wat niet terug te draaien is:** versies van voor 27 november 2026 werden onder AGPL-3.0 verspreid. Wie die al kopieerde, mag die versie onder AGPL blijven gebruiken. De repository was toen een paar dagen oud.
- **Bijdragen:** voorlopig aanvaarden we geen pull requests van anderen. Zo blijft Nick de enige eigenaar en kan hij later vrij een licentie kiezen (opnieuw open source, een dubbele licentie of betalend). Wie later meewerkt, tekent eerst een akkoord dat Nick die vrijheid geeft.
- **Uitzondering:** de lettertypes Andika en Nunito houden hun eigen licentie (SIL Open Font License 1.1).
- **Nog na te gaan (buiten de code):** of de werkgever rechten heeft op software die deels tijdens het werk gemaakt is, en hoe sterk AI-prenten beschermd zijn. Zie projectdocument 01.
- **Waarop steunt dit? Eigen keuze.**
