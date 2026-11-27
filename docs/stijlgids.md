# Stijlgids

De ontwerpregels voor elk scherm van de typcursus (beslissingen K15 tot K19). Een nieuw scherm volgt deze regels. De waarden staan op een plaats in de code: bovenaan `src/stijl.css`, als CSS-variabelen. Pas je daar een kleur aan, dan verandert ze overal.

Bij elke regel staat waarop ze steunt:

- **onderzoek**: er is onderzoek, met de bron erbij;
- **andere cursussen**: andere typcursussen doen het ook zo;
- **eigen keuze**: onze eigen keuze, te toetsen in de klastest.

De volledige bronnenlijst staat in projectdocument 13 (onderzoeksagenda) en 14 (functies van de app) van het claude.ai-project "Typcursus azerty".

## 1. Rust

- Tijdens het typen beweegt er niets, behalve de toets en de vinger die oplichten.
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
- **Spelscherm:** dezelfde bovenbalk, een witte kaart met bovenaan de vaste prent en eronder de vooruitgang, onderaan het toetsenbord met de handen.
- Alles past op een Chromebook van 1366 x 768 zonder scrollen (zie beslissing 12b).

Waarop steunt dit? **Eigen keuze** (startscherm per deel, een kaart "Verder waar je was"). Extra oefenen bij een les: **andere cursussen** bieden ook extra oefening (Typing.com, Keybr).

## 7. Prenten

- Fien en Jef komen uit het modelblad (`docs/beelden/`). De losse prenten staan in `src/beelden/`.
- Een spelprent blijft volledig in beeld: liever een kleinere, gecentreerde prent met afgeronde hoeken dan een bijgesneden prent.
- "Over de beek" gebruikt de beekprent op maat (Fien en Jef links, het huisje rechts, een brede beek zonder stenen). De stenen tekent de app zelf, onder de prent.
