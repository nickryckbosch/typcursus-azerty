# Opdracht: vormgeving na de test van 28 november (Fable)

Opgesteld door de projectchat op 28 november 2026, uit de opmerkingen van Nick bij zijn test op een groot scherm (27 inch), deels met een kind. **Met Fable, denkkracht High**, in de keuzelijst onderaan in de sessie.

Uitvoeren **na de test op een Chromebook van maandag 30 november**. Wat Nick daar ziet, kan hieronder nog bijkomen of wegvallen. Vraag hem eerst wat de Chromebook-test opleverde.

De teksten en kleine fouten van dezelfde test zijn al gebouwd op de tak `claude/test-28-november` (docs/beslissingen.md, 12m). Kijk eerst na of je tak de hoofdversie bevat, met die tak samengevoegd. Maak een nieuwe tak vanaf main.

## Werkwijze

1. Maak eerst een mockup van vier schermen, voor en na: de intro van les 1, de toetsenbordcheck, het slotscherm van les 0 en "Over de beek". Wacht op het akkoord van Nick.
2. Bouw daarna de rest, met schermafbeeldingen voor en na op 1366 x 768.
3. Noteer het waarom in docs/beslissingen.md. Geen pull request voor Nick ja zegt.
4. Houd je aan de regels van K27 (docs/stijlgids.md, "Rust en overzicht") en aan de stopregel voor les 0 en 1 (projectdocument 07): wat hieronder staat, geldt meestal voor alle lessen (intro's, slotschermen, figuren, spelsjabloon). Dat is de reden om het nu te doen.

## 1. Nieuwe Fien en Jef

- **Wat:** vervang de figuren door het nieuwe blad `docs/beelden/fien-en-jef-zes-houdingen.png` (1536 x 1024). Boven Fien, onder Jef, elk in zes houdingen, van links naar rechts: zwaai, duim, blij, trots, aanmoedigend, nadenkend. Pas `scripts/knip-figuren.py` aan (zes houdingen in plaats van vijf; "trots" is nu een eigen houding).
- **Let op:** Jef is iets groter dan Fien en de voeten staan niet overal op dezelfde hoogte. Zet bij het uitknippen alle figuren op een gelijke voetlijn en in een vaste verhouding Fien tegenover Jef, zodat er niets verspringt als een uitdrukking wisselt.
- **Waarom:** Nick vond de eerste stripstijl van ChatGPT mooier: slanker en ouder dan de huidige figuren, beter voor kinderen van 9 tot 12. De stijl past bij wat de app zelf tekent (dunne zwarte lijn, vlakke kleuren); het huis, de lamp en de strook blijven.
- **Later:** een prent van Fien en Jef samen, schouder tegen schouder, voor het slotscherm. Is ze er nog niet, gebruik dan de losse figuren dicht naast elkaar.

## 2. De rijen benoemen

- **Wat:** niet meer "de bovenste, middelste, onderste rij", maar met een houvast dat op elk toetsenbord klopt. Woonkamer: de rij met de bultjes, waar de F en de J liggen. Zolder: de rij erboven, met de A en de Z. Kelder: de rij eronder, met de W en de X. De cijferrij is het dak ("Daar komen we later.").
- Pas de intro van les 0, de opdrachten van "Licht aan in het huis" (`lichtaan.bovenste` enzovoort), "Klaar voor de start" en de schrijfregel van K26 in docs/stijlgids.md aan. Leg Nick de nieuwe teksten voor: dit is een regel voor alle lessen.
- **In beeld (intro van les 0):** het woord zolder, woonkamer en kelder in de lege randtoets links van elke rij op het schermtoetsenbord (Tab, de hoofdlettertoets, de linker Shift), of de rijen na elkaar laten oplichten, een per druk op Verder. Toon beide in de mockup; de voorkeur van de projectchat is de woorden in de randtoetsen, eventueel samen met een rij per keer.
- **Waarom:** een kind vroeg: "Wat is de bovenste rij?" Er zijn meer rijen (cijfers, F-toetsen), en op een los toetsenbord nog meer. De bultjes zijn het sterkste houvast, want je voelt ze zonder te kijken.

## 3. Rust en overzicht (K27 fase 2), scherm per scherm

- **Startscherm:** op een groot scherm staat de tekstballon hoog boven Fien en Jef. Ballon en figuren horen bij elkaar.
- **Bovenbalk:** de naam "Typcursus" spreekt niet aan. Nick denkt aan Tokkeldorp of Tokkelstad (nog niet gekozen). Maak een voorstel voor de vormgeving van de bovenbalk met beide namen.
- **Toetsenbordcheck:** veel witruimte. Fien of Jef met de duim omhoog bij de uitkomst, groot, bij de tekst.
- **Intro van les 1**, nieuwe indeling, van boven naar onder:
  1. bovenaan, los van de tekstballon: "In de woonkamer heeft elk zijn eigen toets. Leg je wijsvingers op de F en de J.";
  2. daaronder: "Voel je de bultjes? Dan zijn Fien en Jef thuis.";
  3. Fien en Jef groot in het midden, elk met een eigen tekstballon: "Ik ben Fien en ik woon op de F." en "Ik ben Jef en ik woon op de J.";
  4. boven de knop Verder: "Vandaag leer je de f en de j.".
  Het schermtoetsenbord toont de F en de J al in het blauw.
- **Intro van les 0:** de tekst staat nu in drie alinea's (12m). Kijk na of het geheel met het huis rustig blijft.
- **"Licht aan in het huis":** de blauwe rand rond het woord "woonkamer" bij het huis valt links buiten het kader en wordt afgekapt. De blauwe rand rond de woonkamer op het schermtoetsenbord loopt dwars door de Entertoets (die hoort bij twee rijen): laat de rand voor de Entertoets stoppen of er netjes omheen lopen.
- **"Over de beek":** de tekstballon met de doelzin zweeft halverwege links en wijst naar niemand. Zet hem direct boven Fien en Jef in de strook, met het staartje naar hen, in dezelfde lettergrootte als de andere tekstballonnen.
- **Slotschermen** (afsluiter van een les, einde van extra oefenen): Fien en Jef groot in het midden, hun zin in een tekstballon erboven, de knoppen gecentreerd eronder. "Extra oefenen" blijft de hoofdknop: wie sneller klaar is, oefent extra tot het kwartier om is.
- **Knoppen:** de focusrand ligt nu tegen de blauwe knop en lijkt een tweede kader; maak er een dunne ring op een paar pixels afstand van. De tweede knop is nog wit met een beige rand en lijkt een invulvak: lichtblauwe vulling (#E4EEFC) zonder rand, zoals K27 vraagt. Beide knoppen even breed.
- **Handen:** als een vinger oplicht, krijgen de andere vingers een lichtere tint van hun eigen kleur (niet doorschijnend). Zo valt de gevraagde vinger meer op, ook voor kinderen met kleurenblindheid (licht tegenover donker). De wissel gebeurt meteen of zacht, zonder knipperen (K16).

## 4. Daarna, aparte stap: schalen als een dia

Nick koos (28 november): het hele scherm wordt ontworpen voor een Chromebook (1366 x 768) en schaalt op een groter scherm in dezelfde verhouding mee tot het venster gevuld is; wat overblijft aan de zijkanten krijgt de achtergrondkleur. Waarom: thuis ziet een kind hetzelfde als op school, alleen groter; er verspringt niets (K20); we testen op een maat. Pas bouwen als de schermen hierboven op de Chromebook goed zitten.
