# Lessen 0 tot 5: data voor de app

De inhoud van les 0 tot 5 in JSON, om in te lezen door de prototypechat. Voor leerkrachten staat dezelfde inhoud leesbaar in document 10 (in het claude.ai-project). Dit document is gemaakt met een script vanuit dezelfde bron als document 10, dus beide zijn gelijk.

**Controle:** 262 items gecontroleerd, 0 fouten. Elk item bevat alleen geleerde toetsen plus de spatie.

## Formaat

Het formaat volgt het voorbeeld uit de opdracht. Deze velden zijn **erbij gekomen**:

| Veld | Waar | Betekenis |
|---|---|---|
| `klassikaal.materiaal` | elke les | wat de leerkracht nodig heeft |
| `klassikaal.stappen[].optioneel` | les 1 | stap die alleen nodig is als les 1 een aparte sessie is; telt niet mee in de duur |
| `online[].titel`, `online[].duurMinuten` | elk blok | naam en duur van het blok |
| `online[].tekst` | intro, zoek-toets, reeks, eindoefening, afsluiter | opdracht die voorgelezen wordt |
| `zoek-toets.nadruk` | zoek-toets | toetsen die het vaakst moeten komen (ongeveer twee derde) |
| `spel.woorden` | spel in les 3 tot 5 | woorden die in het spel verschijnen |
| `spel.rijen`, `spel.rondes` | spel in les 0 | het spel vraagt een rij, niet een toets |
| `eindoefening.regelsKort` | les 1 tot 5 | kortere versie na twee mislukte pogingen |
| `eindoefening.soort` | les 0 | "houding": er wordt niets gemeten |
| `groepjes` | les 1 en 2 | lettergroepjes zonder betekenis, voor herstel-oefeningen; nooit als woord tonen |
| type `toetsenbordcheck` | les 0 | controle van de toetsenbordindeling, met `blokkeert: false` |

Afspraken:

- De spatie staat als `" "` in `nieuweToetsen` (les 0) en in `geleerdeToetsen`.
- `doelNauwkeurigheid` is 0.9 in les 1 tot 5 en `null` in les 0.
- Type `reeks` heet voor het kind "oefenregels"; in de app nooit "rij" gebruiken voor een regel tekst.
- Alles is in kleine letters, zonder leestekens.

Extra afspraken uit document 10 die de app raken:

- **Oefenbord:** een eenvoudig scherm voor het klassikale deel dat alleen de laatst gedrukte toets groot en in de kleur van de vinger toont, zonder punten.
- **Zeven blokjes online:** de oefenregels staan in twee delen rond het spelletje.
- **Spelletjes:** geen tijd, geen punten, geen game-over; een fout kost niets, de juiste vinger licht op.
- **Toetsenbordcheck** in les 0 blokkeert niet; de waarschuwing komt terug zolang het toetsenbord niet klopt.

## Les 0: Welkom in het toetsenbordhuis

```json
{
  "id": 0,
  "titel": "Welkom in het toetsenbordhuis",
  "nieuweToetsen": [" "],
  "geleerdeToetsen": [" "],
  "doelen": [
    "Ik zit goed: voeten plat, rug recht.",
    "Ik ken de drie verdiepingen van het toetsenbordhuis: zolder, woonkamer en kelder.",
    "Ik weet dat elke vinger een eigen kleur heeft.",
    "Ik druk de spatiebalk in met mijn duim."
  ],
  "klassikaal": {
    "duurMinuten": 10,
    "materiaal": "Nodig: de Chromebooks en het gewone bord (krijt of whiteboard). Handig als je het hebt, maar niet nodig: een digibord, de klasplaat, losse toetsenborden, een doek of handdoek per kind. Teken voor de les op het bord een huis met drie verdiepingen: zolder, woonkamer, kelder.",
    "stappen": [
      {
        "titel": "Wie typt er al?",
        "duurMinuten": 1,
        "leerkracht": "Vraag: \"Steek je hand op als je al eens getypt hebt. Met hoeveel vingers?\" Zeg dan: \"Wij leren typen met tien vingers, zonder te kijken. Zoals fietsen: in het begin kijk je naar de trappers, en na een tijd gaat het vanzelf.\"",
        "kinderen": "Steken hun hand op en tonen met hoeveel vingers ze nu typen. Nog niet vertellen, alleen tonen."
      },
      {
        "titel": "Voeten plat, rug recht",
        "duurMinuten": 2,
        "leerkracht": "Doe de houding voor: voeten plat op de grond, rug tegen de leuning, schouders los, de Chromebook vooraan op de bank, een handbreedte tussen je buik en de bank. Zeg: \"Voeten plat, rug recht!\" en wandel rond. Raken voeten de grond niet, leg er een boekentas of kistje onder.",
        "kinderen": "Nemen de houding aan bij \"Voeten plat, rug recht!\". Twee keer: eerst rustig, dan snel na het teken van de leerkracht."
      },
      {
        "titel": "Het toetsenbord is een huis",
        "duurMinuten": 3,
        "leerkracht": "Wijs het huis op het bord aan. \"Het toetsenbord is een huis met drie verdiepingen. Bovenaan de zolder, in het midden de woonkamer, onderaan de kelder. In de woonkamer wonen je vingers. Ze gaan soms eens naar de zolder of de kelder, maar ze komen altijd terug naar huis.\" Laat de kinderen de Chromebook openen (inloggen hoeft nog niet). Roep: \"Hand op de zolder! Op de kelder! Op de woonkamer!\" Wijs telkens de juiste verdieping op het bord aan.",
        "kinderen": "Leggen een vlakke hand op de juiste rij van hun eigen toetsenbord. Wie twijfelt, kijkt naar het bord."
      },
      {
        "titel": "Tien vingers, vier kleuren",
        "duurMinuten": 3,
        "leerkracht": "Steek je handen op. \"Elke vinger heeft een kleur: wijsvinger blauw, middelvinger oranje, ringvinger groen, pink paars. De duimen zijn grijs, die wonen op de spatiebalk.\" Speel daarna kort: roep een kleur, de kinderen laten die vingers wiebelen. Eerst traag, dan sneller, en eens een strikvraag (\"Rood!\": niemand beweegt).",
        "kinderen": "Laten de vingers van de geroepen kleur wiebelen. Bij een kleur die niet bestaat, blijven ze stil."
      },
      {
        "titel": "Handen in de woonkamer",
        "duurMinuten": 1,
        "leerkracht": "\"Leg nu je vingers in de woonkamer, vier van elke hand, en je duimen op de spatiebalk. Druk een keer op de spatiebalk met je duim.\" Zeg: \"Straks vertellen Fien en Jef waar ze precies wonen.\"",
        "kinderen": "Leggen de vingers losjes op de middelste rij en drukken met een duim de spatiebalk in. De juiste plek komt in les 1."
      }
    ]
  },
  "online": [
    {
      "type": "intro",
      "titel": "Fien en Jef stellen hun huis voor",
      "duurMinuten": 1,
      "tekst": "Hallo! Ik ben Fien. En ik ben Jef. Dit is ons huis: het toetsenbord. Het heeft een zolder, een woonkamer en een kelder. In de woonkamer wonen je vingers. Kom je mee kijken?"
    },
    {
      "type": "toetsenbordcheck",
      "titel": "Klopt je toetsenbord?",
      "duurMinuten": 0.5,
      "blokkeert": false,
      "tekst": "Zoek de toets met de letter A en druk erop. Druk nu op de toets met het cijfer 6.",
      "beschrijving": "De app vraagt eerst de indeling op aan de browser (als dat kan). Lukt dat niet, dan drukt het kind op de toets met de A (verwacht: code KeyQ geeft a, dus AZERTY) en op de toets met de 6 zonder Shift (verwacht: Belgisch geeft §, Frans geeft -). Klopt het niet, dan krijgt het kind de boodschap \"Vraag even hulp aan je juf of meester\" en de leerkracht een korte uitleg. Het kind mag gewoon verder met les 0; in les 1 verschijnt de waarschuwing opnieuw zolang het niet in orde is."
    },
    {
      "type": "zoek-toets",
      "titel": "Duim op de spatiebalk",
      "duurMinuten": 0.5,
      "toetsen": [" "],
      "aantal": 5,
      "tekst": "Leg je duimen op de spatiebalk. Druk erop als het lampje van het huis aangaat."
    },
    {
      "type": "spel",
      "titel": "Licht aan in het huis",
      "spel": "licht-aan",
      "duurMinuten": 2,
      "rijen": ["zolder", "woonkamer", "kelder"],
      "rondes": 9,
      "tekens": [],
      "beschrijving": "Op het scherm staat het huis met drie verdiepingen, alle ramen donker. Een verdieping knippert en Fien zegt: \"Druk op een toets van de zolder.\" Elke toets van die rij is goed (herkend via de toetscode, dus los van de indeling): het raam gaat aan en de toets licht op het schermtoetsenbord op in de kleur van de vinger. Een toets van een andere rij: de juiste rij licht even op, er gaat niets verloren. Alleen de eerste toets per ronde telt, zodat rammen niet helpt. Ronde 1 tot 3 in vaste volgorde (woonkamer, zolder, kelder), daarna willekeurig. Na 9 rondes branden alle ramen en zwaaien Fien en Jef uit het raam. Geen tijd, geen punten."
    },
    {
      "type": "eindoefening",
      "titel": "Klaar voor de start",
      "duurMinuten": 0.5,
      "regels": [],
      "doelNauwkeurigheid": null,
      "soort": "houding",
      "beschrijving": "Fien en Jef zeggen \"Voeten plat, rug recht!\". Het kind legt de handen in de woonkamer en drukt drie keer de spatiebalk in, telkens als Jef in zijn handen klapt. Er wordt niets gemeten; les 1 gaat open zodra les 0 afgewerkt is."
    },
    {
      "type": "afsluiter",
      "titel": "Goed gedaan",
      "duurMinuten": 0.5,
      "tekst": "Goed gedaan! Je kent ons huis. Straks leer je waar wij wonen."
    }
  ],
  "groepjes": [],
  "woorden": [],
  "zinnen": [],
  "tipLeerkracht": "Typische fouten: kinderen zitten scheef of op het puntje van hun stoel, de Chromebook staat te ver of te dicht, en sommigen beginnen al wild te typen. Stuur bij met de startzin in plaats van met uitleg: \"Voeten plat, rug recht\" werkt sneller dan een opmerking per kind. Kinderen die links en rechts nog verwarren: laat ze duim en wijsvinger van beide handen strekken; de linkerhand maakt een L. Vragen ze naar de rij met cijfers: \"Dat is het dak, daar gaan we pas veel later naartoe.\" Krijgt een kind de melding dat het toetsenbord niet klopt, dan staat de Chromebook meestal op een andere taal of op Frans AZERTY. Je past dat aan in de instellingen van de Chromebook bij het toetsenbord (invoermethode Belgisch); op beheerde toestellen kan de ICT-coordinator dat voor alle toestellen tegelijk doen."
}
```

## Les 1: Fien en Jef wonen op de thuisrij

```json
{
  "id": 1,
  "titel": "Fien en Jef wonen op de thuisrij",
  "nieuweToetsen": ["f", "j"],
  "geleerdeToetsen": ["f", "j", " "],
  "doelen": [
    "Ik vind de F en de J zonder te kijken, aan de bultjes.",
    "Ik typ f met mijn linkerwijsvinger en j met mijn rechterwijsvinger.",
    "Ik typ een spatie met mijn duim.",
    "Na elke toets gaat mijn vinger terug naar huis."
  ],
  "klassikaal": {
    "duurMinuten": 10,
    "materiaal": "Nodig: de Chromebooks en het gewone bord (krijt of whiteboard). Handig als je het hebt, maar niet nodig: een digibord, de klasplaat, losse toetsenborden, een doek of handdoek per kind. In de eerste sessie zitten de kinderen al aan hun Chromebook (na het online deel van les 0).",
    "stappen": [
      {
        "titel": "Herhaling van les 0 (alleen als les 1 een aparte sessie is)",
        "duurMinuten": 2,
        "optioneel": true,
        "leerkracht": "Valt weg in de eerste sessie. Geef je les 1 op een andere dag, neem dan 2 minuten: \"Waar is de zolder? De woonkamer? De kelder?\" en de kleurenvingers.",
        "kinderen": "Wijzen de verdiepingen aan op hun toetsenbord en laten de vingers van een geroepen kleur wiebelen."
      },
      {
        "titel": "Fien en Jef ontdekken",
        "duurMinuten": 3,
        "leerkracht": "\"Sluit je ogen en voel met je wijsvingers over de woonkamer. Op twee toetsen zit een klein bultje. Gevonden? Daar wonen Fien en Jef: Fien op de F, Jef op de J.\" Wandel rond en kijk of elke wijsvinger op het bultje ligt. Leg uit: \"De andere vingers liggen ernaast in de woonkamer, de duimen op de spatiebalk.\"",
        "kinderen": "Zoeken met gesloten ogen de bultjes, openen de ogen en controleren: linkerwijsvinger op F, rechterwijsvinger op J. Drie keer: handen in de schoot, en weer zoeken."
      },
      {
        "titel": "De hele startzin",
        "duurMinuten": 2,
        "leerkracht": "\"Nu kennen we de hele startzin: Voeten plat, rug recht, Fien en Jef thuis!\" Zeg hem drie keer, de laatste keer met de ogen dicht.",
        "kinderen": "Zeggen de startzin mee en nemen de houding aan. Bij \"Fien en Jef thuis\" liggen de wijsvingers op de bultjes."
      },
      {
        "titel": "Droog typen",
        "duurMinuten": 4,
        "leerkracht": "Laat het oefenbord van de app openen (dat toont alleen de toets die je drukt, groot en in kleur, zonder punten). Roep \"Fien!\", \"Jef!\" of \"Spatie!\". Eerst traag, met na elke toets \"Terug naar huis!\", dan sneller, en eens een reeksje (\"Fien, Fien, Jef!\"). Kijk vooral naar de handen: welke vinger drukt?",
        "kinderen": "Drukken de juiste toets met de juiste vinger en laten de vinger meteen terugvallen op het bultje. Ze kijken naar het scherm om te zien of het klopt."
      },
      {
        "titel": "Afspraak",
        "duurMinuten": 1,
        "leerkracht": "\"Tijdens het typen kijken we naar het scherm, niet naar onze handen. Foutjes mogen, de app wacht op je.\" Wie wil, legt een doek of trui over de handen.",
        "kinderen": "Spreken af om naar het scherm te kijken. Wie een doek heeft, legt hem klaar."
      }
    ]
  },
  "online": [
    {
      "type": "intro",
      "titel": "Fien en Jef stellen zich voor",
      "duurMinuten": 1,
      "tekst": "Hier wonen wij! Ik ben Fien en ik woon op de F. Ik ben Jef en ik woon op de J. Voel je de bultjes? Daar liggen je wijsvingers. Ze zijn blauw, net als op het scherm."
    },
    {
      "type": "zoek-toets",
      "titel": "Zoek Fien, zoek Jef",
      "duurMinuten": 2,
      "toetsen": ["f", "j", " "],
      "nadruk": ["f", "j"],
      "aantal": 20,
      "tekst": "Druk op de letter die je ziet. De hand op het scherm toont welke vinger."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 1",
      "duurMinuten": 3,
      "tekst": "Typ wat je ziet. Na elke toets terug naar huis.",
      "regels": [
        "fff jjj fff jjj",
        "ff jj ff jj fj jf",
        "fj jf fj jf fj jf",
        "f j ff jj fj"
      ]
    },
    {
      "type": "spel",
      "titel": "Over de beek",
      "spel": "beek",
      "duurMinuten": 3,
      "tekens": ["f", "j", " "],
      "beschrijving": "Fien en Jef staan aan de ene kant van een beek, hun huis staat aan de overkant. In de beek liggen 12 stapstenen. Op elke steen staat een f of een j; om de drie stenen ligt een lange platte steen voor de spatie. Een juiste toets: Fien en Jef springen samen naar die steen. Een foute toets: de steen wiebelt even en licht de juiste vinger op, er valt niemand in het water. Na 12 stenen zijn ze aan de overkant en komt er een nieuwe beek. Drie beken (36 sprongen). Geen tijd, geen punten; op het einde: \"Droge voeten!\""
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 2",
      "duurMinuten": 2,
      "tekst": "Nog wat oefenregels. Kijk naar het scherm, niet naar je handen.",
      "regels": [
        "fjf jfj fjf jfj",
        "ffj jjf ffj jjf",
        "fj jf fjj"
      ]
    },
    {
      "type": "eindoefening",
      "titel": "Eindoefening",
      "duurMinuten": 3,
      "doelNauwkeurigheid": 0.9,
      "tekst": "Nu de eindoefening. Neem je tijd: juist is belangrijker dan snel.",
      "regels": [
        "fj jf ff jj fjf jfj",
        "jjf ffj fj jf fjj jff"
      ],
      "regelsKort": [
        "fj jf ff jj fjf"
      ]
    },
    {
      "type": "afsluiter",
      "titel": "Goed gedaan",
      "duurMinuten": 1,
      "tekst": "Goed gedaan! Je weet nu waar wij wonen. Nog niet alle sterren? Probeer de eindoefening nog eens, wij wachten op je."
    }
  ],
  "groepjes": ["fj", "jf", "ff", "jj", "fff", "jjj", "ffj", "jjf", "fjf", "jfj", "fjj", "jff", "fjfj", "jfjf", "ffjj", "jjff", "fjjf", "jffj", "fffj", "jjjf"],
  "woorden": [],
  "zinnen": [],
  "tipLeerkracht": "Typische fouten: kinderen kijken naar hun handen, typen alles met een vinger, drukken de spatie met een wijsvinger, of houden hun vingers als klauwtjes boven de toetsen in plaats van erop. Stuur bij met een vaste zin: \"Fien en Jef thuis\" voor de startpositie, \"Terug naar huis\" als een vinger blijft hangen. Drukken kinderen te hard: \"Tik zacht, zoals een vlinder.\" Zijn de bultjes op de Chromebook moeilijk te voelen, dan helpt een klein stukje plakband op de F en de J. Een kind dat telkens naar zijn handen kijkt, krijgt een doek of trui over de handen; zeg erbij dat fouten mogen, want de app wacht tot de juiste toets er is."
}
```

## Les 2: Fien en Jef krijgen buren

```json
{
  "id": 2,
  "titel": "Fien en Jef krijgen buren",
  "nieuweToetsen": ["d", "k"],
  "geleerdeToetsen": ["f", "j", "d", "k", " "],
  "doelen": [
    "Ik typ d en k met mijn middelvingers.",
    "Fien en Jef blijven thuis als mijn middelvingers typen.",
    "Ik wissel mijn linkerhand en rechterhand af.",
    "Ik typ bijna alles juist zonder naar mijn handen te kijken."
  ],
  "klassikaal": {
    "duurMinuten": 12,
    "materiaal": "Nodig: de Chromebooks en het gewone bord (krijt of whiteboard). Handig als je het hebt, maar niet nodig: een digibord, de klasplaat, losse toetsenborden, een doek of handdoek per kind.",
    "stappen": [
      {
        "titel": "Startzin en opwarmen",
        "duurMinuten": 2,
        "leerkracht": "\"Voeten plat, rug recht, Fien en Jef thuis!\" Laat het oefenbord openen. Roep vijf keer kort \"Fien!\", \"Jef!\" of \"Spatie!\".",
        "kinderen": "Nemen de houding aan, zoeken de bultjes en drukken de geroepen toets."
      },
      {
        "titel": "Nieuwe buren",
        "duurMinuten": 3,
        "leerkracht": "\"Fien en Jef krijgen buren. Naast Fien woont de D, naast Jef woont de K. Daar wonen je middelvingers, de oranje vingers.\" Laat de kinderen de hele hand laten liggen en alleen de middelvingers optillen en neerleggen. \"Kan je alleen je oranje vingers laten dansen, terwijl Fien en Jef thuis blijven?\"",
        "kinderen": "Laten de hand op de woonkamer liggen en tillen alleen de middelvingers op. Daarna drukken ze een paar keer d en k, en voelen dat de wijsvingers op de bultjes blijven."
      },
      {
        "titel": "Welke hand? (stil spel)",
        "duurMinuten": 3,
        "leerkracht": "Zeg een letter: f, j, d of k. Spelregel: niemand roept, iedereen antwoordt met zijn handen. Eerst in de lucht: de kinderen steken de hand op die de letter typt en laten de juiste vinger wiebelen. Daarna op het toetsenbord: ze drukken de letter. Begin traag, versnel, en eindig met \"Terug naar huis!\".",
        "kinderen": "Steken zonder te spreken de juiste hand op en wiebelen met de juiste vinger. Daarna drukken ze de letter op het oefenbord en kijken of de kleur klopt."
      },
      {
        "titel": "Droog typen op ritme",
        "duurMinuten": 3,
        "leerkracht": "Klap een rustig ritme en zeg reeksjes op de maat: \"d - k - d - k\", \"f - d - j - k\", \"k - d - k - d\". Na elk reeksje: \"Terug naar huis!\" Laat de klas een keer met de ogen dicht typen.",
        "kinderen": "Typen op de maat mee op het oefenbord. Bij \"Terug naar huis\" voelen ze of de wijsvingers op de bultjes liggen."
      },
      {
        "titel": "Wat gaan we doen?",
        "duurMinuten": 1,
        "leerkracht": "\"Vandaag laten Fien en Jef een bal over en weer gaan: telkens een letter voor je linkerhand en een voor je rechterhand.\"",
        "kinderen": "Luisteren en starten met het online deel."
      }
    ]
  },
  "online": [
    {
      "type": "intro",
      "titel": "De buren van Fien en Jef",
      "duurMinuten": 1,
      "tekst": "We hebben buren! Naast mij, Fien, woont de D. Naast mij, Jef, woont de K. Je oranje middelvingers typen ze. En wij? Wij blijven gewoon thuis op de bultjes."
    },
    {
      "type": "zoek-toets",
      "titel": "Zoek de buren",
      "duurMinuten": 2,
      "toetsen": ["d", "k", "f", "j"],
      "nadruk": ["d", "k"],
      "aantal": 20,
      "tekst": "Druk op de letter die je ziet. Kijk op de hand welke vinger het is."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 1",
      "duurMinuten": 3,
      "tekst": "Typ wat je ziet. Fien en Jef blijven thuis.",
      "regels": [
        "ddd kkk ddd kkk",
        "dd kk dk kd dk kd",
        "fd jk df kj fd jk",
        "dfd kjk dfd kjk"
      ]
    },
    {
      "type": "spel",
      "titel": "Overgooien",
      "spel": "overgooien",
      "duurMinuten": 4,
      "tekens": ["d", "k", "f", "j"],
      "beschrijving": "Fien staat links op het scherm, Jef rechts. Ze gooien een bal over en weer. Op de bal staat een letter. Is de bal bij Fien, dan staat er een letter van de linkerhand (d of f); is de bal bij Jef, dan een letter van de rechterhand (k of j). Een juiste toets: de bal vliegt naar de overkant. Een foute toets: de bal blijft zweven en de juiste vinger licht op; de bal valt nooit. Na 10 worpen schuift het spel een stap op: de letters wisselen sneller van vinger (eerst alleen d en k, daarna alle vier). Na 30 worpen: \"De bal is niet een keer gevallen!\" Geen tijd, geen punten."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 2",
      "duurMinuten": 2,
      "tekst": "Nu alle vier je toetsen door elkaar.",
      "regels": [
        "fdk jkd dfj kjf",
        "dk fj kd jf",
        "fjdk kdjf dkfj"
      ]
    },
    {
      "type": "eindoefening",
      "titel": "Eindoefening",
      "duurMinuten": 2,
      "doelNauwkeurigheid": 0.9,
      "tekst": "De eindoefening. Rustig en juist.",
      "regels": [
        "dk kd dfd kjk fdk jkd",
        "fjdk dkjf kfd djk"
      ],
      "regelsKort": [
        "dk kd dfd kjk"
      ]
    },
    {
      "type": "afsluiter",
      "titel": "Goed gedaan",
      "duurMinuten": 1,
      "tekst": "Super! Je kent nu vier letters: f, j, d en k. Volgende keer gaan je vingers voor het eerst naar de zolder."
    }
  ],
  "groepjes": ["dk", "kd", "dd", "kk", "fd", "df", "jk", "kj", "dfd", "kjk", "fdk", "jkd", "dkj", "kdf", "fjdk", "dkfj", "kdjf", "jfkd", "ddk", "kkd"],
  "woorden": [],
  "zinnen": [],
  "tipLeerkracht": "Typische fout: het kind schuift de hele hand een plaats op en typt d met de wijsvinger. Je ziet het aan een wijsvinger die niet meer op het bultje ligt, en daarna typt het kind f waar het d bedoelt. Stuur bij met \"Fien en Jef blijven thuis\": de wijsvinger blijft liggen, alleen de middelvinger beweegt. Andere fout: de hele hand gaat omhoog bij elke aanslag. Laat dan de oefening uit stap 2 herhalen (alleen de oranje vingers laten dansen). Gaat het traag, dan is dat normaal: de middelvinger is minder handig dan de wijsvinger. Zeg dat juist belangrijker is dan snel."
}
```

## Les 3: Even naar de zolder

```json
{
  "id": 3,
  "titel": "Even naar de zolder",
  "nieuweToetsen": ["e", "i"],
  "geleerdeToetsen": ["f", "j", "d", "k", "e", "i", " "],
  "doelen": [
    "Ik typ e en i: mijn middelvinger gaat even naar de zolder en meteen terug naar huis.",
    "Ik typ ij als een i en een j.",
    "Ik typ mijn eerste echte woorden."
  ],
  "klassikaal": {
    "duurMinuten": 12,
    "materiaal": "Nodig: de Chromebooks en het gewone bord (krijt of whiteboard). Handig als je het hebt, maar niet nodig: een digibord, de klasplaat, losse toetsenborden, een doek of handdoek per kind. Schrijf op het bord vijf woorden: ik, je, ei, die, kijk.",
    "stappen": [
      {
        "titel": "Startzin en opwarmen",
        "duurMinuten": 2,
        "leerkracht": "Startzin. Daarna het stille handenspel van vorige keer: zeg f, j, d of k, de kinderen steken de juiste hand op en wiebelen met de juiste vinger. Vijf letters is genoeg.",
        "kinderen": "Nemen de houding aan en antwoorden zonder te spreken met hand en vinger."
      },
      {
        "titel": "Naar de zolder en terug",
        "duurMinuten": 3,
        "leerkracht": "\"Vandaag gaan je middelvingers voor het eerst naar de zolder. Boven de D woont de E, boven de K woont de I. Je vinger gaat naar boven, een klein beetje naar links, en meteen terug naar huis.\" Doe het voor met je hand in de lucht. Laat het oefenbord openen en zeg traag op de maat: \"d - e - d\", \"k - i - k\". \"Fien en Jef blijven thuis, alleen de middelvinger gaat op reis.\"",
        "kinderen": "Typen d, e, d en k, i, k op de maat. Ze voelen dat de wijsvingers op de bultjes blijven liggen terwijl de middelvinger naar boven gaat."
      },
      {
        "titel": "De ij is een i en een j",
        "duurMinuten": 2,
        "leerkracht": "\"In de klas schrijf je de ij als een letter. Op het toetsenbord typ je twee toetsen: eerst de i, dan de j. Niet de y!\" Schrijf ij op het bord en laat het drie keer typen.",
        "kinderen": "Typen i en j na elkaar en zien op het scherm ij verschijnen."
      },
      {
        "titel": "De eerste woorden",
        "duurMinuten": 4,
        "leerkracht": "\"Met deze zes letters kan je al echte woorden typen!\" Lees de woorden op het bord samen. Spel daarna een woord letter per letter (\"k - i - j - k\") en laat het typen. Vraag op het einde: \"Wie kent nog een woord met alleen deze letters?\" Schrijf goede voorstellen op het bord (bijvoorbeeld dik, dek, kei, idee).",
        "kinderen": "Lezen de woorden mee en typen ze op het oefenbord. Ze bedenken samen nieuwe woorden en controleren of er alleen geleerde letters in zitten."
      },
      {
        "titel": "Wat gaan we doen?",
        "duurMinuten": 1,
        "leerkracht": "\"Vandaag help je Jef een dijk bouwen: elk woord dat je typt, wordt een steen.\"",
        "kinderen": "Starten met het online deel."
      }
    ]
  },
  "online": [
    {
      "type": "intro",
      "titel": "Naar de zolder",
      "duurMinuten": 1,
      "tekst": "Vandaag gaan je middelvingers naar de zolder! Daar wonen de E en de I. Even naar boven, en meteen terug naar huis. En weet je wat? Nu kan je echte woorden typen!"
    },
    {
      "type": "zoek-toets",
      "titel": "Zoek op de zolder",
      "duurMinuten": 2,
      "toetsen": ["e", "i", "d", "k", "f", "j"],
      "nadruk": ["e", "i"],
      "aantal": 20,
      "tekst": "Druk op de letter die je ziet. Is het een letter van de zolder, ga dan meteen terug naar huis."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 1",
      "duurMinuten": 3,
      "tekst": "Naar boven en terug. Typ wat je ziet.",
      "regels": [
        "ded kik ded kik",
        "de ik de ik ei ie",
        "ei ie ij ei ie ij",
        "die dik fee kei"
      ]
    },
    {
      "type": "spel",
      "titel": "Keien voor de dijk",
      "spel": "dijk",
      "duurMinuten": 3,
      "tekens": [],
      "woorden": ["ei", "ik", "je", "die", "kei", "eik", "dek", "dik", "jij", "kijk", "dijk", "idee", "fee", "keek", "deed"],
      "beschrijving": "Jef bouwt een dijk langs de beek. Bovenaan het scherm hangt een steen met een woord erop. Het kind typt het woord, letter per letter; elke juiste letter maakt de steen een beetje groter. Is het woord af, dan rolt de steen naar zijn plaats in de dijk. Een foute letter: de steen schudt even en de juiste vinger licht op. Na 10 stenen (woorden willekeurig uit de lijst, elk woord hoogstens twee keer) is de dijk klaar en zwaaien Fien en Jef bovenop. Geen tijd, geen punten."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 2",
      "duurMinuten": 2,
      "tekst": "Allemaal echte woorden. Lees ze eerst, typ ze dan.",
      "regels": [
        "ik je jij die",
        "kei eik dek dijk",
        "kijk fee jef"
      ]
    },
    {
      "type": "eindoefening",
      "titel": "Eindoefening",
      "duurMinuten": 3,
      "doelNauwkeurigheid": 0.9,
      "tekst": "Je eerste eindoefening met echte woorden. Rustig en juist.",
      "regels": [
        "ei ik je die kei",
        "jij dik dek eik fee",
        "kijk idee dijk deed"
      ],
      "regelsKort": [
        "ei ik je die",
        "kijk dijk idee"
      ]
    },
    {
      "type": "afsluiter",
      "titel": "Goed gedaan",
      "duurMinuten": 1,
      "tekst": "Wauw, je typte je eerste echte woorden! Volgende keer worden je ringvingers wakker."
    }
  ],
  "groepjes": [],
  "woorden": ["ik", "je", "jij", "de", "die", "ei", "eik", "kei", "fee", "idee", "dik", "dikke", "dek", "dekje", "dijk", "kijk", "kijkje", "keek", "deed", "jee"],
  "zinnen": [],
  "tipLeerkracht": "Typische fouten: de e of de i wordt met de wijsvinger getypt, of de hele hand gaat mee naar boven en komt niet terug, waarna de volgende letters allemaal verschoven zijn. Stuur bij met \"Fien en Jef blijven thuis\" en laat \"d - e - d\" en \"k - i - k\" traag herhalen. Veel kinderen typen y in plaats van ij; herhaal dat ij twee toetsen zijn: i en j. Sommige kinderen kijken weer naar hun handen nu ze naar de zolder moeten: dat is normaal in deze les, maar herinner aan de doek en aan de hand op het scherm. Laat de kinderen trots zijn: dit is de les van de eerste echte woorden."
}
```

## Les 4: De ringvingers worden wakker

```json
{
  "id": 4,
  "titel": "De ringvingers worden wakker",
  "nieuweToetsen": ["s", "l"],
  "geleerdeToetsen": ["f", "j", "d", "k", "e", "i", "s", "l", " "],
  "doelen": [
    "Ik typ s en l met mijn ringvingers.",
    "Ik typ woorden zoals ijs, slee en fles.",
    "Ik typ mijn eerste korte zin."
  ],
  "klassikaal": {
    "duurMinuten": 12,
    "materiaal": "Nodig: de Chromebooks en het gewone bord (krijt of whiteboard). Handig als je het hebt, maar niet nodig: een digibord, de klasplaat, losse toetsenborden, een doek of handdoek per kind.",
    "stappen": [
      {
        "titel": "Startzin en woorddictee",
        "duurMinuten": 2,
        "leerkracht": "Startzin. Zeg daarna drie woorden van vorige keer (ik, kijk, die). De kinderen typen ze op het oefenbord.",
        "kinderen": "Nemen de houding aan en typen de woorden zonder naar hun handen te kijken."
      },
      {
        "titel": "De luie vinger",
        "duurMinuten": 3,
        "leerkracht": "\"De ringvinger is de luiste vinger: hij beweegt graag mee met de andere. Vandaag maken we hem wakker.\" Laat de handen plat op de bank leggen en alleen de ringvingers optillen, vijf keer. Daarna op het toetsenbord: \"Naast de D woont de S, naast de K woont de L. Daar wonen je groene ringvingers.\" Laat s en l een paar keer drukken.",
        "kinderen": "Tillen met platte handen alleen de ringvingers op (dat is moeilijk, en dat mag). Daarna drukken ze s en l en voelen dat Fien en Jef thuis blijven."
      },
      {
        "titel": "Woordenjagers",
        "duurMinuten": 4,
        "leerkracht": "Schrijf de acht letters op het bord: f j d k e i s l. \"Welke woorden kan je maken met alleen deze letters?\" Geef een voorbeeld: ijs. Schrijf goede voorstellen op het bord en laat er telkens een typen.",
        "kinderen": "Bedenken woorden (bijvoorbeeld les, slee, fles, lief, elf), controleren samen of er alleen geleerde letters in zitten, en typen ze."
      },
      {
        "titel": "Een eerste zin",
        "duurMinuten": 2,
        "leerkracht": "Schrijf op het bord: jef is lief. \"Zonder hoofdletter en zonder punt: die leren we later. Tussen elk woord een spatie met je duim.\" Laat de zin twee keer typen.",
        "kinderen": "Typen de zin en letten op de spatie tussen de woorden."
      },
      {
        "titel": "Wat gaan we doen?",
        "duurMinuten": 1,
        "leerkracht": "\"Vandaag rijdt Jef met de slee de berg af. Elk woord brengt hem een stukje verder.\"",
        "kinderen": "Starten met het online deel."
      }
    ]
  },
  "online": [
    {
      "type": "intro",
      "titel": "De ringvingers",
      "duurMinuten": 1,
      "tekst": "Nu worden je ringvingers wakker. Zij zijn groen en typen de S en de L. Daarmee kan je al ijs, slee en fles typen. En vandaag typ je je eerste zin!"
    },
    {
      "type": "zoek-toets",
      "titel": "Zoek de S en de L",
      "duurMinuten": 1,
      "toetsen": ["s", "l", "d", "k", "e", "i"],
      "nadruk": ["s", "l"],
      "aantal": 12,
      "tekst": "Druk op de letter die je ziet."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 1",
      "duurMinuten": 3,
      "tekst": "Typ wat je ziet. Na elke toets terug naar huis.",
      "regels": [
        "ss ll sl ls sl ls",
        "sd lk sd lk sf lj",
        "sds lkl sds lkl",
        "is les ijs elf"
      ]
    },
    {
      "type": "spel",
      "titel": "Met de slee naar beneden",
      "spel": "slee",
      "duurMinuten": 3,
      "tekens": [],
      "woorden": ["les", "ijs", "slee", "elf", "ski", "fles", "lief", "lied", "kleed", "deel", "ijsje", "keel", "lees", "is"],
      "beschrijving": "Jef zit bovenaan een besneeuwde helling op zijn slee. Langs de helling staan 10 vlaggetjes met elk een woord. Het kind typt het woord op het eerstvolgende vlaggetje; bij elke juiste letter glijdt de slee een stukje verder. Een foute letter: de slee staat even stil en de juiste vinger licht op; de slee kantelt nooit. Na 10 vlaggetjes is Jef beneden en staat Fien te wachten met twee ijsjes. Woorden willekeurig uit de lijst, elk woord hoogstens twee keer. Geen tijd, geen punten."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 2",
      "duurMinuten": 3,
      "tekst": "Echte woorden met de S en de L.",
      "regels": [
        "les lees lied lief",
        "ijs fles slee ski",
        "kleed keel deel elk"
      ]
    },
    {
      "type": "eindoefening",
      "titel": "Eindoefening",
      "duurMinuten": 3,
      "doelNauwkeurigheid": 0.9,
      "tekst": "De eindoefening, met je eerste zinnen. Rustig en juist.",
      "regels": [
        "les ijs fles slee elf",
        "jef is lief",
        "ik kies de slee",
        "je kleedje is lief"
      ],
      "regelsKort": [
        "ijs fles slee",
        "jef is lief"
      ]
    },
    {
      "type": "afsluiter",
      "titel": "Goed gedaan",
      "duurMinuten": 1,
      "tekst": "Hoera, je typte je eerste zinnen! Volgende keer schuiven Fien en Jef even opzij."
    }
  ],
  "groepjes": [],
  "woorden": ["is", "les", "lees", "lek", "lied", "lief", "liefde", "kies", "keel", "deel", "slee", "elf", "elk", "ski", "skiles", "ijs", "ijsje", "ijsjes", "fles", "flesje", "kleed", "kleedje", "lelie", "deksel", "slik", "lijf", "dekje", "idee"],
  "zinnen": ["jef is lief", "ik kies de slee", "de eik is dik", "ik deel de ijsjes", "kijk die slee", "ik kies elf ijsjes", "je kleedje is lief"],
  "tipLeerkracht": "Typische fouten: s en l worden met de middelvinger getypt omdat de hele hand opschuift, of het kind tilt de hele hand op om de ringvinger te kunnen bewegen. Dat zie je aan s en d die door elkaar gaan (\"dlee\" in plaats van \"slee\"). Laat dan de oefening van de luie vinger herhalen en zeg dat de ringvinger trager mag. Bij de zinnen vergeten kinderen vaak de spatie of typen ze er twee; zeg \"een woord, een duim\". Kinderen vragen naar hoofdletters en punten: die komen later, nu typen we alles klein. De spelling in de klas blijft natuurlijk met hoofdletter."
}
```

## Les 5: Fien en Jef gaan op bezoek

```json
{
  "id": 5,
  "titel": "Fien en Jef gaan op bezoek",
  "nieuweToetsen": ["g", "h"],
  "geleerdeToetsen": ["f", "j", "d", "k", "e", "i", "s", "l", "g", "h", " "],
  "doelen": [
    "Ik typ g en h: mijn wijsvinger schuift even opzij en komt terug op het bultje.",
    "Ik voel aan het bultje dat mijn vinger weer thuis is.",
    "Ik typ korte zinnen met tien letters."
  ],
  "klassikaal": {
    "duurMinuten": 12,
    "materiaal": "Nodig: de Chromebooks en het gewone bord (krijt of whiteboard). Handig als je het hebt, maar niet nodig: een digibord, de klasplaat, losse toetsenborden, een doek of handdoek per kind. Schrijf op het bord: jef is de held.",
    "stappen": [
      {
        "titel": "Startzin en zinnendictee",
        "duurMinuten": 2,
        "leerkracht": "Startzin. Zeg daarna langzaam de zin \"ik kies de slee\". De kinderen typen hem op het oefenbord.",
        "kinderen": "Nemen de houding aan en typen de zin, met een spatie tussen elk woord."
      },
      {
        "titel": "Op bezoek in het midden",
        "duurMinuten": 3,
        "leerkracht": "\"Tussen het huis van Fien en het huis van Jef wonen nog twee buren: de G en de H. Fien schuift een stapje naar rechts naar de G, Jef een stapje naar links naar de H. Daarna gaan ze meteen terug naar huis. Hoe weet je dat je weer thuis bent? Je voelt het bultje!\" Laat traag typen: \"f - g - f\", \"j - h - j\".",
        "kinderen": "Schuiven met de wijsvinger opzij en terug, en voelen bij het terugkomen het bultje. De andere vingers blijven liggen."
      },
      {
        "titel": "Welke hand? (stil spel)",
        "duurMinuten": 2,
        "leerkracht": "Het stille handenspel, nu met alle tien letters. Zeg een letter; de kinderen steken de juiste hand op en wiebelen met de juiste vinger. Kies vooral g en h, en letters die op elkaar lijken in de klank (s en f, d en k).",
        "kinderen": "Antwoorden zonder te spreken met hand en vinger."
      },
      {
        "titel": "Woordenjagers met de G en de H",
        "duurMinuten": 4,
        "leerkracht": "\"Welke woorden kan je nu maken met de G of de H erin?\" Schrijf voorstellen op het bord (bijvoorbeeld hij, geel, egel, held, leeg). Laat er een paar typen, en daarna de zin op het bord: jef is de held.",
        "kinderen": "Bedenken woorden, controleren of alle letters al geleerd zijn, typen woorden en de zin."
      },
      {
        "titel": "Wat gaan we doen?",
        "duurMinuten": 1,
        "leerkracht": "\"Vandaag help je een egel de weg naar huis vinden.\"",
        "kinderen": "Starten met het online deel."
      }
    ]
  },
  "online": [
    {
      "type": "intro",
      "titel": "Op bezoek bij de buren",
      "duurMinuten": 1,
      "tekst": "Wij gaan op bezoek bij de buren in het midden: de G en de H. Even opzij schuiven, en terug naar je bultje. Dan voel je dat je weer thuis bent. Vandaag typ je nog meer zinnen!"
    },
    {
      "type": "zoek-toets",
      "titel": "Zoek de G en de H",
      "duurMinuten": 1,
      "toetsen": ["g", "h", "f", "j", "s", "l"],
      "nadruk": ["g", "h"],
      "aantal": 12,
      "tekst": "Druk op de letter die je ziet. Voel daarna het bultje."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 1",
      "duurMinuten": 3,
      "tekst": "Opzij en terug. Typ wat je ziet.",
      "regels": [
        "fgf jhj fgf jhj",
        "fg jh gf hj fg jh",
        "gh hg ghg hgh gh hg",
        "hij heg hek geel"
      ]
    },
    {
      "type": "spel",
      "titel": "De egel gaat naar huis",
      "spel": "egel",
      "duurMinuten": 3,
      "tekens": [],
      "woorden": ["hij", "heg", "hek", "geel", "leeg", "egel", "held", "geld", "gids", "hik", "deeg", "heel", "lig", "geef"],
      "beschrijving": "Een egel staat aan het begin van een tuinpad. Zijn huisje zit onder de heg aan de andere kant van de tuin. Het pad bestaat uit 12 tegels met elk een woord. Het kind typt het woord op de volgende tegel; bij elke juiste letter zet de egel een stapje. Een foute letter: de egel blijft staan en snuffelt even, de juiste vinger licht op. Na 12 tegels kruipt de egel in zijn huisje en zeggen Fien en Jef: \"Slaapwel, egel!\" Woorden willekeurig uit de lijst, elk woord hoogstens twee keer. Geen tijd, geen punten."
    },
    {
      "type": "reeks",
      "titel": "Oefenregels 2",
      "duurMinuten": 3,
      "tekst": "Echte woorden met de G en de H.",
      "regels": [
        "heel held hiel hik",
        "leeg geld deeg gids",
        "hij hield hesje"
      ]
    },
    {
      "type": "eindoefening",
      "titel": "Eindoefening",
      "duurMinuten": 3,
      "doelNauwkeurigheid": 0.9,
      "tekst": "De eindoefening. Rustig en juist, en na elke toets terug naar huis.",
      "regels": [
        "hij heg hek gids",
        "hij is heel lief",
        "de fles is leeg",
        "jef is de held"
      ],
      "regelsKort": [
        "geel leeg egel",
        "jef is de held"
      ]
    },
    {
      "type": "afsluiter",
      "titel": "Goed gedaan",
      "duurMinuten": 1,
      "tekst": "Je kent nu tien letters! Volgende keer komen de pinken aan de beurt, en dan is de woonkamer helemaal vol."
    }
  ],
  "groepjes": [],
  "woorden": ["hij", "hek", "heg", "heel", "hele", "held", "hiel", "hield", "heide", "hik", "hesje", "geel", "gele", "leeg", "lege", "deeg", "gids", "geld", "geef", "lig", "egel", "egels", "kegel", "kegels", "eigeel"],
  "zinnen": ["hij is heel lief", "de fles is leeg", "ik kies de gele slee", "jef is de held", "kijk die egel", "ik geef je elf ijsjes", "eigeel is geel", "ik lees de gids"],
  "tipLeerkracht": "Typische fout: de wijsvinger schuift naar de G of de H en komt niet terug. Daarna typt het kind g waar het f bedoelt, of h in plaats van j, en lijkt het alsof de hele les fout loopt. Je ziet het aan een wijsvinger die naast het bultje ligt. Stuur bij met \"Voel je het bultje?\" en laat \"f - g - f\" en \"j - h - j\" traag herhalen. Andere fout: g met de middelvinger, omdat de hand mee opschuift. Bij de zinnen: let op dat kinderen niet versnellen omdat ze de woorden al kennen. Juist blijft belangrijker dan snel."
}
```
