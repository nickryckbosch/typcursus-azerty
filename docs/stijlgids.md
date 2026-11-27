# Stijlgids

De ontwerpregels voor elk scherm van de typcursus (beslissingen K15 tot K19). Een nieuw scherm volgt deze regels. De waarden staan op een plaats in de code: bovenaan `src/stijl.css`, als CSS-variabelen. Pas je daar een kleur aan, dan verandert ze overal.

Bij elke regel staat waarop ze steunt:

- **onderzoek**: er is onderzoek, met de bron erbij;
- **andere cursussen**: andere typcursussen doen het ook zo;
- **eigen keuze**: onze eigen keuze, te toetsen in de klastest.

De volledige bronnenlijst staat in projectdocument 13 (onderzoeksagenda) en 14 (functies van de app) van het claude.ai-project "Typcursus azerty".

## 1. Rust

- Tijdens het typen beweegt er niets, behalve de toets en de vinger die oplichten.
- Niets verspringt: elk oefenscherm heeft vaste zones, en wat later verschijnt, staat er van bij het begin en neemt zijn ruimte al in (beslissing 12c).
- Verschijnen en aangaan (de Enter-regel, "Klap!", de lamp, een raam, een nieuwe letter op de kaart) gebeurt met een korte, rustige overgang van 180 ms, en meteen als het toestel om minder beweging vraagt. Dat is de enige beweging.
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
- **Nunito**: koppen, knoppen en korte tekst van de app.
- De lettertypes zitten in de repository (`src/lettertypes/`), alleen de Latijnse tekens. Geen Google Fonts, geen CDN. Beide vallen onder de SIL Open Font License; de licentieteksten staan in dezelfde map.
- De huidige oefenregel is ongeveer 48 px groot.

Waarop steunt dit? **Eigen keuze.** Andika is door SIL ontworpen voor beginnende lezers (duidelijke a, g, l en I); er is geen effectstudie die we kennen. Te toetsen in de klastest.

## 4. Kaarten, knoppen en tekstballonnen

- Kaart: wit, rand van 1 px in `--rand`, afgeronde hoeken van 18 tot 22 px.
- Hoofdknop: achtergrond `--accent`, witte tekst. Een per scherm.
- Tweede knop: achtergrond `--accent-licht`, rand `--accent`.
- Gewone knop: wit met een grijze rand.
- Knoppen zijn minstens 38 px hoog; de hoofdknop minstens 48 px.
- Focus (toetsenbordbediening): een duidelijke rand van 3 px in `--tekst`.
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

- **Startscherm:** titel links, startzin rechts. Links Fien en Jef (zwaaiend, stil) met een tekstballon. Een grote kaart "Verder waar je was", daaronder "Alle lessen" met een tabblad per deel van het toetsenbordhuis en een compacte rij per les.
- **Typscherm:** bovenbalk met de knop "Lessen", in het midden "Les 2 · Oefenregels 1" met een balkje per blok, rechts voorlezen. Links een stilstaand figuurtje met een korte tip in een tekstballon. In het midden een witte kaart met de oefenregels. Onderaan het toetsenbord met de handen.
- **Oefenkaart (intro, zoek de toets, de lamp, "Licht aan", "Klaar voor de start", afsluiter):** dezelfde bovenbalk, en een witte kaart met vaste zones: de opdracht groot bovenaan (met de toets getekend in de zin), Fien en Jef links, de prent of het signaal in het midden, "Druk op Enter" met de knop Verder rechts.
- **Voortgang (K20):** een dunne, grijze balk langs de onderrand van de witte kaart, met rechts klein de teller. Bij "Over de beek" drie bolletjes voor de beken. Geen vingerkleur.
- **Spelscherm:** dezelfde bovenbalk, een witte kaart met bovenaan de vaste prent en eronder de vooruitgang, onderaan het toetsenbord met de handen.
- Alles past op een Chromebook van 1366 x 768 zonder scrollen (zie beslissing 12b).

Waarop steunt dit? **Eigen keuze** (startscherm per deel, een kaart "Verder waar je was"). Extra oefenen bij een les: **andere cursussen** bieden ook extra oefening (Typing.com, Keybr).

## 7. Prenten

- Fien en Jef komen uit het modelblad (`docs/beelden/`). De losse prenten staan in `src/beelden/`.
- Een spelprent blijft volledig in beeld: liever een kleinere, gecentreerde prent met afgeronde hoeken dan een bijgesneden prent.
- "Over de beek" gebruikt de beekprent op maat (Fien en Jef links, het huisje rechts, een brede beek zonder stenen). De stenen tekent de app zelf, onder de prent.

## 8. Getekende voorwerpen: het huis en de lamp

Voorwerpen die de app zelf tekent, hebben dezelfde tekenstijl als de prenten van Fien en Jef: een bruine omtrek (`#4A2E1A`, 3 dik in de tekening van het huis), afgeronde hoeken en vlakke kleuren.

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
