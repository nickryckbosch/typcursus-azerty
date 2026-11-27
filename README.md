# Typcursus AZERTY

Gratis, open source typcursus op **Belgisch AZERTY** voor kinderen vanaf het vierde leerjaar (9 a 10 jaar). Kinderen leren blind typen met tien vingers, samen met Fien (die op de F woont) en Jef (die op de J woont).

- Werkt in de browser, ook op Chromebooks. Niets installeren, geen account.
- Geen tracking, geen cookies, geen reclame, geen externe lettertypes of CDN's. De voortgang blijft op het toestel zelf.
- Elke les heeft een klassikaal deel voor de leerkracht en een online deel voor het kind.

**Stand van zaken:** prototype. Les 0 (kennismaking) en les 1 (f en j) zijn klaar om te testen. Les 2 tot 5 staan al in de lesinhoud en volgen na de eerste klastest.

## Voor leerkrachten

- Open de cursus op de Chromebook en begin bij les 0. Les 0 en les 1 doe je in dezelfde eerste sessie.
- Het klassikale deel van elke les (wat jij zegt en doet, wat de kinderen doen) staat in de app zelf. Druk op **Ctrl + Shift + L** om het leerkrachtscherm te openen. Daar vind je ook:
  - of het toestel op Belgisch AZERTY staat, en hoe je dat aanpast;
  - de voortgang per les en welke toetsen moeilijk zijn;
  - een knop om alle lessen open te zetten (om te testen);
  - een knop om de voortgang te wissen (bijvoorbeeld als een ander kind de Chromebook krijgt).
- Met **Esc** ga je altijd terug naar het begin.
- Het oefenbord (knop op het startscherm) gebruik je tijdens het klassikale deel: het toont alleen de toets die je drukt, groot en in de kleur van de vinger.

Het didactische ontwerp staat in [docs/08-ontwerp-leerlijn-en-les-1.md](docs/08-ontwerp-leerlijn-en-les-1.md), de lesinhoud in [docs/11-lessen-data.md](docs/11-lessen-data.md). De technische keuzes staan in [docs/beslissingen.md](docs/beslissingen.md).

## Lokaal draaien

Je hebt [Node.js](https://nodejs.org) nodig (versie 20 of nieuwer).

```bash
npm install
```

```bash
npm run dev
```

Open daarna de link die verschijnt (meestal http://localhost:5173).

Andere commando's:

| Commando | Wat het doet |
|---|---|
| `npm test` | voert de tests uit (Vitest) |
| `npm run build` | maakt de website in de map `dist/` |
| `npm run preview` | toont de gebouwde website |

## Hoe zit het in elkaar?

```
docs/                  ontwerp, lesinhoud, beslissingen, testlijst
src/
  content/nl-BE/       ALLE tekst: les-0.json ... les-5.json en teksten.json
  logica/              de typ-logica, zonder scherm (met tests)
  weergave/            schermtoetsenbord, handen, Fien en Jef, voorlezen
  schermen/            startscherm, les, oefenbord, leerkracht
  blokken/             de stappen van een les (intro, oefenregels, eindoefening, ...)
  spellen/             de spelletjes
tests/                 de tests
```

## Bijdragen

Bijdragen zijn welkom, ook van leerkrachten die niet programmeren.

- **Een fout of een idee?** Maak een issue aan op GitHub en beschrijf wat je zag (welke les, welke stap, welk toestel).
- **Teksten of oefeningen aanpassen?** Die staan in `src/content/nl-BE/`. Je hoeft daarvoor geen code te kennen. Elk item mag alleen letters bevatten die het kind al geleerd heeft; de test `tests/inhoud.test.ts` controleert dat.
- **Code?** Houd het eenvoudig en leesbaar. Schrijf tests voor nieuwe logica in `src/logica/`, en voer `npm test` uit voor je een pull request maakt.
- **Een Franstalige versie** komt in `src/content/fr-BE/`, met dezelfde bestanden.

## Prenten

Fien en Jef komen uit het modelblad in `docs/beelden/` (gemaakt met ChatGPT, vrij te gebruiken in dit project). De afzonderlijke prenten in `src/beelden/` worden gemaakt met `scripts/knip-figuren.py` (Python 3 met Pillow).

## Licentie

[AGPL-3.0](LICENSE). Je mag de cursus gratis gebruiken, aanpassen en verspreiden. Wie een aangepaste versie online zet, moet de broncode daarvan ook delen.

Er is geen code of data van andere projecten (zoals Keybr) hergebruikt.
