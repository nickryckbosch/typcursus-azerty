# Stijlgids

De ontwerpregels voor elk scherm van de typcursus (beslissingen K15 tot K21, K26, K27 en K28). Een nieuw scherm volgt deze regels. De waarden staan op een plaats in de code: bovenaan `src/stijl.css`, als CSS-variabelen. Pas je daar een kleur aan, dan verandert ze overal.

Bij elke regel staat waarop ze steunt:

- **onderzoek**: er is onderzoek, met de bron erbij;
- **andere cursussen**: andere typcursussen doen het ook zo;
- **eigen keuze**: onze eigen keuze, te toetsen in de klastest.

De volledige bronnenlijst staat in projectdocument 13 (onderzoeksagenda) en 14 (functies van de app) van het claude.ai-project "Typcursus azerty".

## 1. Rust

- Tijdens het typen beweegt er niets, behalve de toets en de vinger die oplichten.
- Niets verspringt: elk oefenscherm heeft vaste zones, en wat later verschijnt, staat er van bij het begin en neemt zijn ruimte al in (beslissing 12c).
- Verschijnen en aangaan (de Enter-regel, "Wacht op de lamp.", de lamp, een raam, een nieuwe letter op de kaart) gebeurt met een korte, rustige overgang van 180 ms, en meteen als het toestel om minder beweging vraagt. Dat is de enige beweging.
- Geen animaties: niets schudt, wiebelt, knippert, springt of schuift. Een fout zie je doordat de cursor blijft staan en de juiste toets en vinger even sterker oplichten.
- Fien en Jef staan stil. Ze veranderen alleen van houding bij de start (zwaaien) en op het einde (duim omhoog of aanmoedigen), nooit bij elke toets of fout.
- Een spel heeft een vaste prent bovenaan. De vooruitgang staat eronder (bijvoorbeeld een rij stenen), niet in de prent.

**Waarop steunt dit? Onderzoek.** Versiering die niets met de leerstof te maken heeft, leidt af en doet minder leren (het "seductive details"-effect):

- Rey (2012), A review of research and a meta-analysis of the seductive detail effect, Educational Research Review 7(3).
- Sundararajan en Adesope (2020), Keep it coherent: a meta-analysis of the seductive details effect, Educational Psychology Review 32.
- Wong en Adesope (2021), Meta-analysis of emotional designs in multimedia learning, Educational Psychology Review 33: meer motivatie bij stilstaand dan bij geanimeerd materiaal.

Kanttekening: dat onderzoek gaat over leren uit tekst en uitleg, niet over typen. Of het ook voor een typcursus geldt, toetsen we in de klastest.

## 2. Kleuren

| Wat | Kleur | Variabele |
|---|---|---|
| Achtergrond (havermout) | `#F6F1E9` | `--achtergrond` |
| Kaart | `#FFFFFF` | `--vlak` |
| Rand van een kaart | `#E6DED1` | `--rand` |
| Tekst | `#1B2A4A` | `--tekst` |
| Secundaire tekst | `#4A5A78` | `--zacht` |
| Knoppen en accent | `#1F5FBF` | `--accent` |
| Accent, licht | `#E4EEFC` | `--accent-licht` |

Waarop steunt dit? **Eigen keuze** (een rustige, warme achtergrond met donkere tekst), te toetsen in de klastest.

### Vingerkleuren (palet C)

| Vinger | Vol | Licht |
|---|---|---|
| Wijsvinger | `#1F5FC8` | `#D6E4FA` |
| Middelvinger | `#F0A030` | `#FCE6C4` |
| Ringvinger | `#2E9D63` | `#D3EEDF` |
| Pink | `#C9A3F0` | `#F1E7FC` |
| Duim | `#8A94A6` | `#E3E7EE` |

**Waarop steunt dit? Onderzoek (een nabootsing), door Nick gekozen na een vergelijking van drie paletten.**

- We bootsten na hoe kinderen met een rood-groenzwakte de kleuren zien, met de simulatiematrices van Machado, Oliveira en Fernandes (2009, IEEE Transactions on Visualization and Computer Graphics 15(6)) voor deuteranopie en protanopie. Het verschil tussen twee kleuren maten we in CIELAB.
- In het palet van het eerste prototype (Okabe en Ito, Color Universal Design, https://jfly.uni-koeln.de/color/) vielen ringvinger, pink en duim voor rood-groenzwakke kijkers bijna samen: het kleinste verschil, tussen pink en duim, was ongeveer 7.
- In het eerste ontwerp van K19 vielen wijsvinger en pink voor roodzwakke kijkers bijna samen (ongeveer 13).
- In palet C is het kleinste verschil ongeveer 25 (deuteranopie) en 28 (protanopie).
- Het blijft een nabootsing, geen test met kinderen: te controleren in de klastest.

**Kleur draagt nooit alleen de boodschap.** Het onderscheid zit ook in:

- de plaats van de vinger op de getekende hand;
- vol tegenover licht, en een dikkere omtrek rond de vinger die moet typen (de volle pinkkleur is licht, dus kleur alleen is daar te weinig);
- de zin in woorden onder het toetsenbord ("Typ de k met je rechtermiddelvinger").

## 3. Lettertypes

- **Andika**: alles wat kinderen lezen en typen (oefenregels, letters op toetsen en stenen).
- **Andika, gewone dikte (400)**: lopende tekst, dus alles in een tekstballon en de zinnen van een intro.
- **Andika, vet (700)**: de opdracht bovenaan, "Vandaag leer je ...", en korte meldingen zoals "Wacht op de lamp.". Nooit dikker dan 700.
- **Nunito**: koppen, knoppen, de bovenbalk en korte labels van de app.
- Waarom: bijna alle tekst stond in Nunito 700 en de opdracht in 800. Nick vond dat "heel vet en druk" (28 november 2026). Vet is voor wat moet opvallen, niet voor alles.
- De lettertypes zitten in de repository (`src/lettertypes/`), alleen de Latijnse tekens. Geen Google Fonts, geen CDN. Beide vallen onder de SIL Open Font License; de licentieteksten staan in dezelfde map.
- De huidige oefenregel is ongeveer 48 px groot.

Waarop steunt dit? **Eigen keuze.** Andika is door SIL ontworpen voor beginnende lezers (duidelijke a, g, l en I); er is geen effectstudie die we kennen. Te toetsen in de klastest.

## 4. Kaarten, knoppen en tekstballonnen

- Kaart: wit, rand van 1 px in `--rand`, afgeronde hoeken van 18 tot 22 px.
- Hoofdknop: achtergrond `--accent`, witte tekst. Een per scherm.
- Tweede knop: achtergrond `--accent-licht`, zonder zichtbare rand, zodat hij niet op een invulvak lijkt (K27, deel 10).
- Gewone knop (bovenbalk, leerkrachtscherm): wit met een grijze rand.
- Knoppen zijn minstens 38 px hoog; de hoofdknop minstens 48 px.
- De knop Verder of Start: de hoofdknop met de Enter-toets erin getekend ("Verder" en daarnaast het toetsje "Enter ↵"). Enter en de knop doen hetzelfde (K27, deel 10).
- Focus (toetsenbordbediening): een ring van 3 px in `--tekst` rond de knop, op 3 px afstand (`outline` met `outline-offset`). De ring verandert de vorm of de maat van de knop niet.
- Tekstballon: wat Fien en Jef zeggen staat in een witte ballon met afgeronde hoeken, een dunne rand en een staartje dat naar het figuurtje wijst.

Waarop steunt dit? **Eigen keuze.**

## 5. Schermtoetsenbord en handen

- Belgisch AZERTY: drie letterrijen en de spatiebalk. Geen cijferrij, geen F-toetsen.
- Elke toets heeft onderaan een streep in de vingerkleur.
- Geleerde toets: wit met een donkere letter. Niet geleerde toets: vaag (`#EFEAE2`, letter `#A39B8F`).
- De toets die moet komen: lichte vingerkleur als achtergrond en een ring in de volle vingerkleur.
- Bultjes op f en j.
- Randtoetsen (Tab, zoektoets, Shift links en rechts, Enter in twee delen) zijn vaag en zonder opschrift. Uitzondering: moet het kind op Enter drukken om verder te gaan, dan licht de Enter-toets op, met opschrift.
- Links en rechts een getekende hand: vier afgeronde vingers, een handpalm die naar onder smaller wordt en een duim die schuin naar de spatiebalk wijst. Eerst alle vormen met alleen een omtrek, daarna dezelfde vormen gevuld erbovenop, zodat er geen lijnen door de hand lopen.
- De vinger die moet typen krijgt de volle vingerkleur en een dikkere omtrek, de andere de lichte kleur.
- Onder het toetsenbord staat een zin: "Typ de k met je rechtermiddelvinger" of "Druk de spatiebalk in met je duim".
- **In les 0 tot 5 is de hulp altijd zichtbaar:** de doeltoets en de vinger lichten op voor het kind typt. Later bouwen we dat traag af, met een hulpknop (K17, nog niet gebouwd).

**Waarop steunt de zichtbare hulp? Onderzoek, met een eigen keuze erbovenop.** Bij volwassenen leert minder feedback soms beter; bij kinderen is daar geen steun voor:

- Sullivan, Kantak en Burtner (2008), Motor learning in children: feedback effects on skill acquisition, Physical Therapy.
- Goh, Kantak en Sullivan (2012), Research Quarterly for Exercise and Sport.
- van der Veer e.a. (2022), systematic review in PLOS ONE: geen steun voor minder feedback bij kinderen.
- Yechiam, Erev, Yehene en Gopher (2003), Human Factors: na een typcursus vallen mensen terug op kijken. Daarom bouwen we de hulp later wel af.

Er is geen studie bij kinderen over schermtoetsenborden. Hoe lang de hulp zichtbaar blijft, is dus een **eigen keuze**, te toetsen in de klastest.

Kleurstrepen per vinger en getekende handen: **andere cursussen** doen dat ook (zie projectdocument 02 en 06).

## 6. Opbouw van de schermen

- **Startscherm:** bovenbalk met links het merk (het huisje met de toetsen f en j, en de naam Tokkeldorp), in het midden de startzin, rechts de knoppen. Links Fien en Jef (zwaaiend, stil) met hun tekstballon er vlak boven. Een grote kaart "Verder waar je was", daaronder "Alle lessen" met een tabblad per deel van het toetsenbordhuis en een compacte rij per les.
- **Typscherm:** bovenbalk met de knop "Lessen", in het midden "Les 2 · Oefenregels 1" met een balkje per blok, rechts voorlezen. Links een stilstaand figuurtje met een korte tip in een tekstballon. In het midden een witte kaart met de oefenregels. Onderaan het toetsenbord met de handen.
- **Oefenkaart (zoek de toets, de lamp, "Licht aan", "Klaar voor de start"):** dezelfde bovenbalk, en een witte kaart met vaste zones: de opdracht groot bovenaan (met de toets getekend in de zin), de prent of het signaal in het midden, Fien en Jef er vlak links naast met hun tekstballon. Bij de lamp staat de knop Start onder de lamp; bij "Licht aan" komt de knop Verder op het einde op de plaats van de opdracht.
- **Praatscherm (K27: de intro):** Fien en Jef, hun tekstballon en de prent staan als een groep in het midden van de kaart, de knop er vlak onder (`oefenscherm(ctx, { opbouw: "midden" })`). Zie deel 10.
- **Slotscherm (K27 fase 2: het einde van een les, het einde van extra oefenen, de vraag om verder te gaan):** Fien en Jef groot in het midden, hun zin in een tekstballon erboven, de knoppen even breed eronder (`slotscherm()`). Het toetsenbord is weg en de kaart vult het scherm.
- **Toetsenbordcheck:** dezelfde bouwsteen als een slotscherm (`slotscherm()`), met het toetsenbord erbij: Fien in het midden, wat ze zegt in een tekstballon erboven, de toets of de uitleg ernaast, de knop Verder eronder.
- **Voortgang (K20):** een dunne, grijze balk langs de onderrand van de witte kaart, met rechts klein de teller. Geen vingerkleur. Een spel heeft geen balk: daar toont de strook zelf hoe ver je bent (deel 11).
- **Spelscherm:** dezelfde bovenbalk, een witte kaart met bovenaan de vaste prent en eronder de vooruitgang, onderaan het toetsenbord met de handen.
- Alles past op een Chromebook van 1366 x 768 zonder scrollen (zie beslissing 12b). Is het venster groter, dan schaalt het hele scherm mee als een dia (deel 10, "Schalen als een dia").

Waarop steunt dit? **Eigen keuze** (startscherm per deel, een kaart "Verder waar je was"). Extra oefenen bij een les: **andere cursussen** bieden ook extra oefening (Typing.com, Keybr).

## 7. Prenten

- **Tekenstijl: klare lijn (stripstijl).** Dunne, even dikke zwarte omtrek, vlakke kleuren zonder verloop, zachte kleuren, een creme achtergrond. Ogen met wit, een iris met een lichtpuntje en wenkbrauwen, zodat de figuren levendig kijken.
- Fien en Jef: twaalf losse tekeningen (zes houdingen per kind) in `docs/beelden/figuren/`, elk 1024 x 1536 met een doorzichtige achtergrond, gemaakt met ChatGPT op basis van het blad met zes houdingen (`docs/beelden/fien-en-jef-zes-houdingen.png`). `scripts/knip-figuren.py` zet ze om naar `src/beelden/<wie>-<houding>.webp` (alle kleuren, zachte randen) en schrijft hun maten in `src/beelden/maten.json`. Een nieuwe houding: vraag in ChatGPT een tekening per kind, "volledige figuur van hoofd tot schoenen, staand 1024 x 1536, transparante achtergrond (PNG), geen schaduw, geen tekst", met het blad als voorbeeld.
- De andere prenten in dezelfde stijl (welkomprent van het dorp, houdingskaart, de spelprenten voor beek, overgooien, dijk, slee en egel) staan in `docs/beelden/prenten/`. Ze worden nu niet in de app gebruikt: in een spel tekent de app de strook zelf (deel 11).
- Een spelprent blijft volledig in beeld: liever een kleinere, gecentreerde prent met afgeronde hoeken dan een bijgesneden prent.
- "Over de beek" gebruikt de beekprent niet meer. De app tekent de strook zelf, met dezelfde onderdelen als de prent (de beek, het huis met de puntgevel, de knotwilgen, de haag). De strook is in lagen gebouwd, zodat de achtergrond later een prent kan worden (deel 11).

Waarop steunt dit? **Eigen keuze** van Nick (27 november 2026, projectdocument 17, W7): de eerste stijl met dikke bruine lijnen oogde te kleuterachtig voor het vijfde en zesde leerjaar. Te toetsen in de klastest.

## 8. Getekende voorwerpen: het huis en de lamp

Voorwerpen die de app zelf tekent, hebben dezelfde tekenstijl als de prenten van Fien en Jef: een dunne zwarte omtrek (`#1F1F1F`, 1,8 dik in de tekening van het huis), afgeronde hoeken en vlakke, zachte kleuren.

### Het huis van "Licht aan in het huis" (K21)

- Vier even hoge lagen van 66: dak, zolder, woonkamer en kelder (onder de grondlijn). Het dak is de cijferrij, een vierde rij boven de zolder; het blijft leeg in les 0 tot 5.
- Negen even grote ramen van 38 x 38 met een kruis, geen vensterbank. De rijen zijn gelijk, omdat de rijen op het toetsenbord ook gelijk zijn.
- De woorden staan in een eigen kolom links, in afgeronde vakjes van 150 x 40, in Andika (24). Nooit over de tekening. De vakjes zijn groter dan in de eerste referentie, voor de leesbaarheid op een kleine Chromebook.
- Het vakje van de verdieping die aan de beurt is, wordt donker (`#1B2A4A` met witte tekst) en blijft stil staan. Er knippert niets.
- Fien en Jef staan naast het huis, niet in een raam.
- De referentietekening staat in de code: `src/spellen/lichtaan.ts`.

Waarop steunt dit? **Eigen keuze** (K21), als gevolg van het rijenbeeld in de projectdocumenten 08, 10 en 18.

**Raamkleuren: licht aan `#FFEE99`, licht uit `#3B4256`. Waarop steunt dit? Onderzoek (methode).** De kleuren zijn nagemeten tegen de vingerkleuren van palet C, met het model van Machado, Oliveira en Fernandes (2009) en het verschil in CIELAB:

| | normaal | deuteranopie | protanopie |
|---|---|---|---|
| Licht aan: kleinste verschil met een vingerkleur | 25 | 23 | 26 |
| Licht uit: kleinste verschil met een vingerkleur | 33 | 33 | 33 |

Het vroegere geel `#FFD34D` haalde maar 13 tegenover het oranje van de middelvinger. Verander de raamkleuren dus niet zonder nieuwe meting.

### De lamp van "Duim op de spatiebalk"

- Een gloeilamp met dezelfde omtrek en dezelfde kleuren als de ramen: uit `#3B4256`, aan `#FFEE99`.
- Als ze brandt, staan er stralen rond: zo zie je het ook zonder op de kleur te letten.
- Ze staat van bij het begin in beeld, op een vaste plek. Een klein beeldje van dezelfde lamp staat in de opdracht naast het woord "lamp".
- De tekening staat in `src/weergave/lamp.ts`.

Waarop steunt dit? **Eigen keuze**, te toetsen door een kind de oefening zonder uitleg te laten doen.

## 9. Opdrachten en teksten (K26)

Elke tekst die een kind leest, volgt deze regels. Ze gelden ook voor elke nieuwe les en elk nieuw spel.

- **Elke oefening en elk spel heeft een opdracht:** wat doe je (welke toets, welke rij). Hoogstens drie korte zinnen. In de lesdata is dat het veld `tekst`.
- **Elk spel heeft een doelzin** (veld `doel`): waar werk je naartoe, en wat doet een goede toets. Bijvoorbeeld: "Het wordt donker. Doe jij de lichten aan? Elke goede toets laat een raam branden." De doelzin staat het hele spel in de tekstballon van Fien en Jef (`oefenscherm(ctx, { doel })`), zodat het kind kan teruglezen.
- **Wat de tekst belooft, moet je zien gebeuren.** Zegt het slot "We zijn thuis", dan toont de prent Fien en Jef bij hun huis. Kan het beeld dat (nog) niet, dan past de tekst zich aan.
- **Een woord betekent altijd hetzelfde:**
  - **het huis** is het hele toetsenbord;
  - **de woonkamer** is de rij met de bultjes (waar de F en de J liggen), **de zolder** de rij erboven, **de kelder** de rij eronder. De cijferrij is het dak. Schrijf niet "de bovenste, middelste of onderste rij": een toetsenbord heeft meer rijen (cijfers, F-toetsen), dus "bovenste" is niet duidelijk. De bultjes voel je zonder te kijken (test 28 november: een kind vroeg "Wat is de bovenste rij?");
  - **je plek**: elke vinger heeft een eigen plek in de woonkamer. Na elke toets gaat de vinger "terug naar zijn plek". Schrijf nooit "terug naar huis": wie op de zolder is, is nog altijd in het huis;
  - **thuis** alleen in de startzin ("vingers thuis") en waar Fien en Jef uitleggen wat dat is ("Dan zijn Fien en Jef thuis", "Fien en Jef blijven thuis"): de wijsvingers op de F en de J, de andere vingers ernaast. In een verhaal (het dorp, de egel) betekent huis gewoon een huis.
- **Een rij krijgt de eerste keren in een les haar plaats erbij:** "de woonkamer, de rij met de bultjes".
- **De laatste zin van een intro zegt wat de les brengt** ("Vandaag leer je de f en de j."), geen vraag zonder antwoord.
- **Woorden die een kind van 9 kent**, korte zinnen, Vlaams Nederlands, zonder klemtoonaccenten.

### Eerst lezen, dan starten (K28)

- **Gebeurt er in een oefening iets vanzelf** (een lamp die aangaat, later de vallende letters van Letterregen, alles met een tijd), **dan begint ze pas als het kind op Start drukt.** Tot dan staat de opdracht in beeld en gebeurt er niets. De start is Enter of de knop Start, waarin de Enter-toets getekend staat (`scherm.toonEnter(start, "start")`). De knop staat bij het signaal, bijvoorbeeld onder de lamp (K27, deel 10); een losse zin "Druk op Enter om te starten" is er niet meer.
- Een toets voor de start krijgt wel een reactie (K23): "Druk eerst op Start." Hij telt niet als aanslag en niet als fout.
- **Een knop in een zin wordt getekend**, zoals een toets: `((Start))` wordt een klein blauw knopje, net als `[spatie]` een getekende toets wordt. Geen aanhalingstekens ("Start" lijkt dan een citaat) en geen los woord (dan lijkt het een gewoon woord). Zo herkent het kind meteen wat het op het scherm moet zoeken (Nick, 28 november 2026).
- Oefeningen die op het kind wachten (oefenregels, "Zoek de toets", een spel waarin je typt), hebben geen startknop nodig: daar gebeurt niets voor het kind typt. De eindoefening had al een start.
- **Waarom:** bij "Duim op de spatiebalk" ging de lamp na 0,9 seconde aan, terwijl het kind de opdracht nog moest lezen (Nick, 27 november 2026). Een kind dat traag leest of de voorleesstem afwacht, mist zo het signaal.

**Controle:** `tests/inhoud.test.ts` faalt als een oefening geen opdracht heeft, als een spel geen doelzin heeft, als een opdracht of doelzin langer is dan drie zinnen, of als ergens "terug naar huis" staat. De testlijst vraagt bij elk spel: "Kan iemand zonder uitleg zeggen wat hij moet doen, en waar hij naartoe werkt?"

**Waarop steunt dit? Eigen keuze**, na de vaststelling bij drie testers op 27 november 2026: Nick, zijn dochter van 11 en een volwassene zonder uitleg liepen vast op een opdracht. Die laatste vroeg bij "Over de beek": "Hoe ben ik aan het huis geraakt?" Het past bij K20 (woord en beeld kloppen). Uitwerking in projectdocument 21.

## 10. Rust en overzicht (K27)

Elk scherm volgt deze acht regels. Ze gelden ook voor elk nieuw scherm en elk nieuw spel.

1. **Een blikvanger per scherm:** de opdracht, of het ding waarmee het kind bezig is. Al de rest is kleiner of rustiger.
2. **Wat bij elkaar hoort, staat bij elkaar, in een middenkolom.** Niets staat aan de uiterste randen van de kaart, behalve de bovenbalk.
3. **Fien en Jef staan samen, dicht bij hun tekstballon,** als een groep.
4. **Een manier om verder te gaan:** een knop "Verder" (of "Start") waarin de Enter-toets getekend staat. De losse zin "Druk op Enter om verder te gaan" valt weg. Enter blijft werken.
5. **Knoppen zien eruit als knoppen.** De hoofdknop is vol blauw. Een tweede knop heeft een lichte vulling (`--accent-licht`, `#E4EEFC`) en geen dikke rand, zodat hij niet op een invulvak lijkt. De focusrand voor het toetsenbord is een ring rond de knop (`outline` met `outline-offset`) en verandert de vorm of de maat van de knop niet. De hoofdknop is de knop die Enter kiest.
6. **Voeg je iets toe aan een scherm, haal dan iets weg,** of zeg waarom het niet kan.
7. **De vaste zones van K20 blijven:** niets verspringt tijdens een oefening, wat later verschijnt heeft zijn ruimte al (deel 1, beslissing 12c). Een slotscherm is een nieuw scherm: daar mag de indeling anders zijn (geen toetsenbord).
8. **Geen beweging tijdens het typen** (K16, deel 1).

**Fase 2 (28 november 2026; `docs/beslissingen.md`, 12p): wat de regels per soort scherm betekenen**

- **Een slotscherm** (einde van een les, einde van extra oefenen, "wil je verdergaan?"): Fien en Jef groot in het midden, hun zin in een tekstballon erboven, de knoppen even breed eronder. Er valt niets te typen, dus het toetsenbord is weg en de kaart vult het scherm.
- **Een scherm met een prent** ("Licht aan in het huis", "Klaar voor de start"): Fien en Jef staan met hun tekstballon vlak naast de prent. Geen lege zone rechts voor de knop Verder: hij komt op de plaats van de opdracht, die op het einde verdwijnt.
- **Een spel in het spelsjabloon:** de tekstballon staat direct boven Fien en Jef in de strook (deel 11).
- **Een uitkomst** (de toetsenbordcheck): Fien groot met de duim omhoog, vlak onder haar tekstballon en vlak boven de knop Verder. Dezelfde bouwsteen als een slotscherm.
- **Wat Fien en Jef zeggen, staat in hun tekstballon**, niet als opdracht bovenaan: ook de slotzin van een spel en de zin op een slotscherm. De opdracht bovenaan is alleen voor wat het kind moet doen.
- **De tekstballon staat vlak bij wie spreekt**, met het staartje naar hem of haar. Spreken Fien en Jef elk apart (intro van les 1), dan krijgt elk een eigen tekstballon.
- **Alle knoppen van een slotscherm zijn even breed** (`.knoppen.even-breed`).

**Schalen als een dia (12p)**

- Het ontwerp is 1366 x 768. Op een groter venster schaalt het hele scherm in dezelfde verhouding mee tot het venster gevuld is; wat overblijft, heeft de achtergrondkleur. Nooit kleiner dan 1: op een Chromebook met adresbalk past de indeling zich aan de hoogte aan, zoals vroeger (12b).
- **Regel voor de stijl:** gebruik nooit `vh` of `vw`, maar `var(--vh)` en `var(--vw)`. Maten binnen een les blijven in `cqh` en `cqw`.
- Code: `src/logica/schaal.ts` (de regel), `src/weergave/schaal.ts` (zet de schaal), `src/stijl.css` onderaan.

**Bouwstenen voor een nieuwe les**

Een nieuwe les is lesdata (`src/content/nl-BE/les-N.json`) en, voor een nieuw spel, een strook. Bouw niets als uitzondering voor een les: gebruik deze bouwstenen. Geen enkele bouwsteen test op het nummer van een les.

| Wat je wil | Bouwsteen | Hoe |
| --- | --- | --- |
| Een intro met een tekst | intro-blok met `tekst` | Een witregel (`\n\n`) in de tekst wordt een nieuwe alinea. |
| Een intro in stukken: zinnen bovenaan, Fien en Jef elk met een eigen tekstballon, een zin boven Verder | intro-blok met `tekstBoven` (een of twee zinnen), `fien`, `jef`, `tekstOnder` | Zonder deze velden valt de intro terug op `tekst`. De twee samen mag niet (`tests/inhoud.test.ts`). |
| Het huis naast de introtekst | `"prent": "huis"` in het intro-blok | |
| De namen van de rijen in de randtoetsen | `"rijnamen": true` in het intro-blok | Code: `toetsenbord.toonRijnamen(true)`; de intro zet het weer uit. |
| Fien en Jef zeggen iets, het kind kiest of gaat verder (einde van een les, een vraag, een uitkomst) | `slotscherm(ctx, { figuren, zin, knoppen })` | Opties: `wie` (Fien, Jef of beide), `boven` (bv. sterren), `naast` (bv. een toets of uitleg), `toetsenbord: true` om het toetsenbord te houden, `enter: true` op een knop voor de knop Verder. |
| Fien en Jef naast hun tekstballon, met de knop Verder eronder | `oefenscherm(ctx, { opbouw: "midden" })` | Voor een praatscherm midden in een les. |
| Een oefening met een prent of signaal | `oefenscherm(ctx, { doel, figuren })` | `doel` is de tekstballon boven Fien en Jef; `scherm.zetDoel()` zet er op het einde de slotzin in; `enterPlaats: "opdracht"` zet de knop Verder op de plaats van de opdracht. |
| Een spel | `spelscherm(ctx, { opdracht, doel, strook, figuren })` (deel 11) | `figuren: { start, einde }` zegt waar Fien en Jef in de strook staan; de tekstballon volgt. |
| Het einde van een les | afsluiter-blok met `tekst` | Gebruikt `slotscherm()`; de knoppen volgen uit de voortgang. |

**Waar staat het in de code?**

- De opbouw "midden": `oefenscherm(ctx, { opbouw: "midden" })` in `src/blokken/oefenscherm.ts`, stijl `.oefenkaart-midden` in `src/stijl.css`. Voor schermen waar Fien en Jef iets zeggen en het kind alleen verder moet.
- De gedeelde bouwsteen `slotscherm()` (opbouw "toren"): in hetzelfde bestand.
- Een intro in stukken: `src/blokken/intro.ts`.
- De knop Verder of Start: `scherm.toonEnter()`. Een blok mag de knop bij zijn signaal zetten met `scherm.enter` (zo staat Start onder de lamp).
- Tweede knop: klasse `knop-tweede`.

**Waarop steunt dit?**

- **Onderzoek**, voor het principe dat details die niets met de taak te maken hebben afleiden: Rey (2012) en Sundararajan en Adesope (2020), zie deel 1. Kanttekening: dat onderzoek gaat over leren uit tekst en uitleg, niet over typen.
- **Eigen keuze**, voor de acht concrete regels, na de vaststelling van Nick en de testers op 27 november 2026 (de schermen oogden druk; zie `docs/beslissingen.md`, punt 12j). Te toetsen in de klastest.

## 11. Het spelsjabloon (K22)

Elk spel in een les gebruikt dezelfde indeling (`src/spellen/sjabloon.ts`). Een nieuw spel is een strook, een lijst met wat het kind typt, en een slotzin.

1. **De opdracht bovenaan**, even groot als op de andere oefenschermen: "Typ wat je ziet."
2. **Wat het kind typt, staat in het midden**, groot en altijd op dezelfde plek, in dezelfde vorm als bij de oefenregels: getypte letters grijs, de volgende letter in de lichte vingerkleur met een streep in de volle kleur. Nooit op een steen, een bal of een vlaggetje.
3. **De doelzin (deel 9) staat in een tekstballon direct boven Fien en Jef in de strook**, het hele spel, met het staartje naar hen, in dezelfde lettergrootte als de andere tekstballonnen. Het spel zegt waar Fien en Jef staan (`figuren: { start, einde }`); de stijl rekent uit waar het staartje komt.
4. **De strook onderaan** is de prent van het spel en toont de vooruitgang: bij "Over de beek" ligt er per goede toets een stapsteen bij. Er is geen teller en geen balk; de strook zegt het zelf. Wie iets toevoegt, haalt iets weg (deel 10).
5. **Wat aan de beurt is in de strook, krijgt een donkere rand** (`#1b2a4a`), nooit blauw: blauw is de kleur van de wijsvinger.
6. **Bij een fout** krijgt de letter een stippelrand, en lichten de juiste toets en vinger op. Er schudt niets.
7. **Er beweegt niets tijdens het typen.** Alleen op het einde verandert de strook (Fien en Jef staan bij hun huis), komt de slotzin in een tekstballon boven Fien en Jef (waar ze dan staan) en de knop Verder op de plaats van de regel. De opdracht verdwijnt; haar plaats blijft.

**De strook** heeft een vaste verhouding: 1270 op 150, zo breed als de kaart en hoogstens 38% van de hoogte van het podium. Ze is in drie lagen gebouwd (`src/spellen/beek-strook.ts`): de achtergrond, de stenen, en Fien en Jef. De app tekent de achtergrond zelf, in de klare lijn (deel 7 en 8). Wie later een prent uit een beeldgenerator wil gebruiken, vervangt alleen de achtergrond en past de plaats van de stenen en de figuren aan; het spel zelf verandert niet.

**Waarop steunt dit? Eigen keuze**, als toepassing van deel 1 (rust), deel 6 (vaste zones), deel 9 (opdrachten) en deel 10 (overzicht). Nick zag een mockup en koos op 27 november 2026: de app tekent de strook, de letters staan in het midden, Fien en Jef zwaaien op het einde. Te toetsen in de klastest: vinden kinderen de spelletjes saai, of zien ze geen verschil met de oefenregels? Dan krijgt elk spel een korte beloning op het einde of een kleine verandering in de strook, nooit in de tekst.
