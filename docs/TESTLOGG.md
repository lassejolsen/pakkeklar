# Testlogg – 20.–22. oktober 2026

Loggen følger utviklingen fra lokal prototype til publisert app. Testantall og funksjonsoppførsel gjelder versjonen som ble kontrollert i hver del; senere kontroller dokumenterer endringene. Kontrollene ble utført av Codex, mens utvikleren ga visuelle tilbakemeldinger. De automatiske testene og nettleserkontrollene er ikke dokumentasjon av manuell testing utført av utvikleren.

## Kodekontroll

| Kontroll | Resultat |
| --- | --- |
| `npm test` | 20 av 20 tester bestått etter kopiering og «Før avreise» |
| `npm run check` | JavaScript-syntaks godkjent |
| Direkte filreferanser fra HTML | Alle 8 referanser finnes |
| Lokal HTTP-server | `200 OK` på forsiden |

Logikktestene dekker relevante ting for hver turtype, antall ved 1/3/7/30 dager, ugyldig varighet, egne ting, dubletter, lagring og gjenoppretting, fremdrift og ugyldige lagrede data. Nye tester dekker eksempelturer, skuddår, nedtelling før/under/etter avreise, Oslo-dato, sommer-/vintertid, uavhengig fremdrift og oppgradering av tidligere tilpassede lister.

## Nettleserkontroll

Gjennomført i Codex sin innebygde nettleser. Tabellen nedenfor gjelder første versjon med én liste; den etterfølgende tabellen gjelder den oppdaterte turoversikten.

| Scenario | Observert resultat |
| --- | --- |
| Første åpning | Storbytur, 3 dager, 18 ting; alle bilder lastet |
| Kryss av ett element | Fremdrift ble 1 av 18 |
| Legg til Kamera | Egen kategori og 19 ting totalt |
| Last siden på nytt | Kamera og avkryssingen ble beholdt |
| Legg til «kamera» på nytt | Dublett avvist med synlig melding |
| Fjern Kamera og trykk Angre | Elementet kom tilbake |
| Bytt fra tilpasset liste | Bekreftelse vist; «Behold listen» bevarte gammel liste |
| Fjelltur, 7 dager | 22 ting, riktig varighet og 7 undertøy |
| Varighet 0 | Nettleserens validering hindret ny liste |
| Varighet 1 og 30 | Henholdsvis minus- og plussknappen ble deaktivert |
| Strandferie, 4 dager | 21 ting, inkludert 2 badetøy |
| Eget navn med `&` og `<ekstra>` | Vist som vanlig tekst |
| Kryss av hele listen | 100 %, «Alt er pakket. God tur!» |
| Filteret Gjenstår etter fullført pakking | Ferdigmelding og ingen gjenstående ting |
| Nullstill avkryssing | Bekreftelse vist; egne tillegg beholdt |
| Informasjon om lagring | Åpnet riktig forklaring; Escape lukket dialogen |
| Ny liste med uferdig tekst i tilleggsfeltet | Tekstfeltet ble tømt |
| Nettleserens feil- og varsellogg | Ingen oppføringer ved kontroll |

## Visuell kontroll

- Skrivebordsvisningen ble gjennomgått og lagret som `output/pakkeklar-desktop.png`.
- Mobilvisningen ble gjennomgått og lagret som `output/pakkeklar-mobile.png`.
- Visningsbredder på 390 og 320 piksler ble prøvd. Innholdsbredde og dokumentbredde var like, altså ingen horisontal overflyt. Nettleserens rullefelt kan redusere faktisk innholdsbredde med 15 piksler.
- Skrift og kontrast i listene ble forbedret etter første gjennomgang.
- Skjermstørrelsesoverstyringen ble fjernet etter kontrollen.
- Testelementene ble fjernet ved å opprette en ny storbyliste med 3 dager og 0 av 18 pakket.

## Kontroll etter utvidelsen med turoversikt

| Scenario | Observert resultat |
| --- | --- |
| Oppgradering av urørt startliste | To eksempelturer vist; hyttehelgen valgt |
| Eksempelturer 20. oktober 2026 | Hyttehelg: 24 dager igjen og 8/24 pakket. Syden: 242 dager igjen og 3/21 pakket |
| Boksen over hovedbildet | Hele boksen ligger innenfor bildet, på skrivebord og mobil |
| Bytt til Sydentur 2027 | Riktig navn, dato, nedtelling og strandliste |
| Kryss av tannbørste og last siden på nytt | Sydenturen fortsatt valgt, 4/21 pakket, avkryssingen beholdt |
| Bytt tilbake til hyttehelgen | Hyttehelgen fortsatt 8/24; listene påvirker ikke hverandre |
| Opprett midlertidig prøvetur | Ny tur med egen liste; begge eksemplene beholdt |
| Endre prøveturens navn og dato | Nytt navn og riktig nedtelling; 1/18 pakket beholdt |
| Endre turtype etter avkryssing | Bekreftelse vist; «Behold listen» beholdt tidligere innhold |
| Fjern midlertidig prøvetur | Bekreftelse vist; begge eksempelturene beholdt |
| Mobilbredder 390 og 320 piksler | Ingen horisontal overflyt; boksen holder seg innenfor bildet |
| Nettleserens feil- og varsellogg etter utvidelsen | Ingen oppføringer |

Avkryssingen fra testen i sydenturen ble fjernet igjen. Startverdiene er 8/24 og 3/21, med hyttehelgen valgt. Nye skjermbilder er lagret i `output/pakkeklar-trips-desktop.png` og `output/pakkeklar-trips-mobile.png`. Overstyringen av skjermstørrelsen ble fjernet etter kontrollen.

## Bildefremvisning – 21. oktober 2026

| Scenario | Observert resultat |
| --- | --- |
| JavaScript-syntaks | Godkjent, inkludert den nye `carousel.js` |
| Eksisterende logikktester | 13 av 13 bestått |
| Lokale bildefiler | Alle sju motiver finnes og har innhold |
| Manuelt valg av hvert motiv | Alle sju bilder lastet, riktig valgt prikk og alternativ tekst; bare aktivt bilde synlig for skjermleser |
| Pause og start | Riktig knappetekst og oppførsel; feil med fokus etter «Start» ble rettet og kontrollert på nytt |
| Automatisk avspilling | Første bilde skiftet til fjordbildet etter oppstart; intervallet i koden er 15 000 ms og overgangen 1 200 ms |
| Manuelt bildevalg | Stopper automatisk avspilling frem til brukeren trykker Start |
| Mobilbredder 390 og 320 piksler | Ingen horisontal overflyt; bildekontrollene ligger innenfor bildet |

Mobilskjermbildet er lagret i `output/pakkeklar-carousel-mobile.png`. Skjermstørrelsesoverstyringen ble fjernet etter kontrollen. Redusert bevegelse er håndtert i kode og CSS; endring av operativsystemets innstilling ble ikke prøvd i denne kontrollen.

## Avgrensning

Det er ikke utført en full test på flere ulike nettlesere eller på fysisk skriver.

## Kopiering, PDF og «Før avreise» – 21. oktober 2026

| Scenario | Observert resultat |
| --- | --- |
| Kopier hyttehelgen med nytt navn og dato | Ny selvstendig tur; egne tillegg beholdt; 0/24 pakket og 0/5 forberedelser |
| Avkrysset original og kopi | Originalens fremdrift beholdt; endringer i kopien påvirket ikke originalen |
| Kryss av i begge sjekklister og last siden på nytt | Kopien, datoen, 1/24 pakket og 1/5 forberedelser beholdt |
| Endre varighet i kopien | Bekreftelse før ny pakkeliste; «Før avreise» beholdt |
| Bytt turtype med bare forberedelser avkrysset | Bekreftelse viste at forberedelsene også blir nullstilt; avbryt beholdt listen |
| Kryss av under Gjenstår | Punktet forsvant fra filteret; tastaturfokus flyttet til neste synlige punkt |
| Kopieringsdialog på 390 og 320 piksler | Felter og knapper synlige; ingen horisontal overflyt ved 320 piksler |
| «Før avreise» på 320 piksler | Lesbare oppgaver i én kolonne, med egne avkryssinger og teller |
| Knappen Lagre som PDF | Utskriftsflyten ble startet; brukeren viste skjermbilder av forhåndsvisningen og lagringsvinduet og delte den nedlastede PDF-en |
| Første PDF-kontroll | To sider på grunn av radavstand. Et avkrysset punkt manglet i brukerens eksport under samtidig automatisert kontroll; utskrift ble derfor gjort uavhengig av skjermfilteret |
| Endelig PDF med Pakket-filter aktivt | Én A4-side; alle 24 pakkepunkter og 5 forberedelser kontrollert i PDF-teksten; ingen manglet |
| Visuell kontroll av endelig PDF | Hele siden rendret til PNG og kontrollert: lesbar tekst, avkryssinger, kategorier, mengder og forberedelser |
| Etter PDF-kontroll | Aktivt filter beholdt; vanlig Alt-visning gjenopprettet av testeren |
| Syntaks og logikk | `npm run check` bestått; 20/20 tester bestått |
| Nettleserens feil- og varsellogg | Ingen oppføringer |

Sju nye logikktester dekker forberedelser per turtype, separat fremdrift, oppgradering av eldre lagring, uavhengige kopier med egne tillegg og fjerninger, navnelengde, datovalidering og ugyldige lagrede forberedelser. Den midlertidige testkopien ble fjernet. Skjermstørrelsesoverstyringen ble tilbakestilt. PDF-kontrollen ligger lokalt i `output/pdf/pakkeklar-hyttehelg.pdf`; mobilbilder ligger i `output/pakkeklar-copy-mobile.png` og `output/pakkeklar-preparation-mobile.png`.

## Papirsjekkliste – 21. oktober 2026

Etter brukerens tilbakemelding viser PDF/utskrift nå tomme bokser, uten fremdriftslinje, pakkefremdrift per kategori, forberedelsesteller, nedtelling eller overstrykninger. Navn, dato, varighet og mengder beholdes. Endringen er avgrenset til utskrifts-CSS; skjermvisningen og lagrede avkryssinger endres ikke.

En ny PDF ble rendret og kontrollert visuelt: én A4-side, alle 24 pakkepunkter og fem forberedelser, tomme bokser og ingen tellere. Tekstkontrollen fant alle 29 punkter. DOM-tilstanden før og etter eksport var identisk, inkludert 9/24 pakket og aktivt filter. Den nye kontrollfilen er `output/pdf/pakkeklar-papirsjekkliste.pdf`.

## Egne antall og endret varighet – 21. oktober 2026

Denne runden erstatter tidligere oppførsel der endret varighet laget en ny liste etter bekreftelse. Kontrollene nedenfor ble utført av Codex i en midlertidig testkopi i den innebygde nettleseren.

| Scenario | Observert resultat |
| --- | --- |
| Lagre antall 100 | Nettleserens validering beholdt dialogen åpen; grensen er 99 |
| Skriv 5, trykk pluss, lagre | 6 stk. vist på riktig punkt |
| Eget tillegg «Kamerabatterier», antall 2, fjern Deodorant | Eget antall og fjerning beholdt |
| Kryss av undertøy og sokker, endre 3 til 7 dager | Manuelt undertøy 6 beholdt avkrysset; automatiske sokker ble 7 og gjenstående |
| Avkrysset forberedelse før endret varighet | «Lad mobil og powerbank» fortsatt avkrysset |
| Last siden på nytt | Navn, antall, manuell markering, eget tillegg og forberedelse beholdt |
| Øk et pakket punkt fra 6 til 8 med Pakket-filter aktivt | Punktet ble gjenstående og skjult av filteret; fokus flyttet til filterknappen |
| Velg «Bruk forslag (7 stk.)» | Mengde 7 og automatisk beregning gjenopptatt |
| Kopier turen med tilpasningene | Kamerabatterier 2 og fjerning av Deodorant fulgte med; 0/24 pakket og 0/5 forberedelser |
| Antallsdialog ved 390 og 320 piksler | Ingen horisontal overflyt; knapper og felt innenfor dialogen |
| PDF med Pakket-filter aktivt | Én side med alle 24 pakkepunkter og fem forberedelser, inkludert kamerabatterier 2 stk. og automatiske antall |
| Rendret PDF | Tomme bokser, ingen fremdrift/tellere, lesbare mengder; hele siden kontrollert |
| Appens tilstand før/etter PDF | Identisk filter og identiske avkryssinger i begge sjekklister |
| Nettleserens feil- og varsellogg | Ingen oppføringer ved kontroll |
| Automatiske tester og syntakskontroll | 27/27 tester bestått; `npm run check` bestått |

Sju nye tester dekker bevaring av tilpasninger, gjenstående ved økt mengde, manuelt antall likt tidligere forslag, tilbake til automatikk, ugyldige verdier, lagring/kopiering og oppgradering av eldre data uten det nye antallsfeltet.

Midlertidige testturer ble fjernet. Opprinnelig tilstand i de to eksisterende turene ble beholdt: hyttehelgen 9/24, sydenturen 3/21. Skjermstørrelsesoverstyringen ble fjernet. PDF-bevis ligger lokalt i `output/pdf/pakkeklar-antall.pdf`; presentasjonsskjermbilder ligger i `docs/images/` og er inkludert i README.

## Reiseplan, bildevalg og pakkemodus – 21. oktober 2026

Denne runden gjelder brukerens ti valgte forbedringer. Tidligere beskrevet erstatning av hele listen ved turtypebytte er nå erstattet av bevaring og forhåndsvisning.

| Scenario | Observert resultat |
| --- | --- |
| Eksisterende turer åpnes | Kompakt plan, bilde ved listeoverskriften og forberedelser på turkort; eksisterende fremdrift beholdt |
| Ny tur med navn og dato | Ny selvstendig liste; skjemaet lukket og riktig lagret oppsummering vist |
| Turbytte med endret navn | Dialog med «Lagre og fortsett», «Forkast endringene» og «Fortsett å redigere» |
| Fortsett å redigere / forkast / lagre | Utkast beholdt ved fortsett; gammel verdi beholdt ved forkast; ny verdi lagret før turbytte ved lagre |
| Bare mellomrom i navnet ved lagre og fortsett | Bytte stoppet; navnefeltet fikk valideringsmelding |
| Velg vintermotiv, lagre og last på nytt | Samme bilde på turkort og pakkeliste, beholdt etter omlasting |
| Avbryt et annet bildevalg | Tidligere bilde beholdt |
| Tilpasset fjelltur endres til strandferie og sju dager | Forhåndsvisning viste faktiske tillegg/fjerninger. Egne punkter, manuelt undertøy 6, fjerning av Deodorant og felles avkrysset forberedelse beholdt |
| Avbryt turtypebytte | Lagret fjelltur uendret; utkast fortsatt tilgjengelig |
| Lagre og bytt tur med endret turtype | Turtypebekreftelsen ble fullført før den andre turen ble åpnet |
| Lukk en kategori | Punktene skjult; overskrift, teller og åpneknapp beholdt |
| Pakkemodus på 390 og 320 piksler | Liste og fast fremdriftslinje synlige, planlegging skjult; ingen horisontal overflyt |
| Kryss av i pakkemodus | Den faste fremdriftslinjen oppdatert |
| Pakkemodus med ulagret navn | Lagringsdialog vist; forkasting åpnet pakkemodus med opprinnelig lagret navn |
| Hele testlisten pakket, forberedelser gjenstår | «Alt er pakket» med lenke til uferdige forberedelser; lenken fokuserte første uferdige oppgave |
| Begge sjekklistene ferdige | «Klar for avreise»; turkort viste 23/23 pakket og 5/5 forberedelser |
| Gjenstår-filter etter fullført pakking | Én ferdigmelding; ingen overflødig tommelding |
| Tilbake til oversikten / bredere skjerm | Pakkemodus avsluttet; vanlig oppsett gjenopprettet |
| Navigasjon mellom seksjonene | Riktig menymarkering og `aria-current` på Mine turer / Pakkelisten |
| Bildevalg på 320 piksler | Alle sju bilder lastet; dialogen holdt seg innenfor skjermen |
| PDF med Gjenstår-filter og alle seks kategorier lukket | Én A4-side med alle 23 pakkepunkter og fem forberedelser; ingen mangler i tekstkontrollen |
| Rendret PDF kontrollert visuelt | Tomme bokser, normale kategoriikoner, ingen fremdrift eller tellere; ingen overlapp eller avkuttet innhold |
| Appens tilstand før/etter PDF | Identisk filter, lukketilstand og avkryssinger |
| Nettleserens feil- og varsellogg | Ingen oppføringer ved sluttkontroll |
| Automatiske tester og syntaks | 35/35 bestått; `npm run check` bestått |

De åtte nye testene dekker bevaring ved turtypebytte, nye versus felles plagg, forberedelser, forhåndsvisning, grensen på 200 punkter, bildevalg ved lagring/kopiering, eldre data og sammenligning av endrede turdetaljer.

Testturene ble fjernet. De to eksisterende turene ble kontrollert med hyttehelgen 9/24 og sydenturen 3/21, begge med 0/5 forberedelser. Mobiloverstyringen ble fjernet. Oppdaterte skjermbilder ligger i `docs/images/`; PDF-kontrollen ligger lokalt i `output/pdf/pakkeklar-sammenlagte-kategorier.pdf`. Testing gjelder den innebygde nettleseren og simulert mobilbredde, ikke en fysisk telefon eller skriver.

## Umiddelbar respons på bildevalg – 21. oktober 2026

- Klikk på bilde 5 ga valgt knapp og en kort lysring mens bilde 1 fortsatt var det aktive bildelaget og bilde 5 fadet inn. Kontrollert i DOM og skjermbilde.
- Raske valg av bilde 2, 7 og 3 under en overgang beholdt det siste valget. Sluttresultatet var bilde 3, med riktig markering og alternativ tekst.
- Enter på valgt knapp utløste også trykkeffekten. Lysringen forsvant etter animasjonen.
- `npm run check` bestod; nettleserens feil- og varsellogg var tom. Redusert bevegelse slår av trykkeffekten i kode/CSS; systeminnstillingen ble ikke endret under denne kontrollen.

Skjermbilde: `output/pakkeklar-bildeknapp-respons.png`. Ingen pakkedata ble endret.

## Avspilling styres bare av pauseknappen – 21. oktober 2026

Brukeren ønsket automatisk avspilling også etter manuelt bildevalg. Dette erstatter tidligere oppførsel der klikk, fokus og musepeker kunne pause fremvisningen.

- Etter omlasting var avspilling på, med pauseknapp synlig.
- Etter manuelt valg av bilde 5 fortsatte automatisk bildeskift til neste motiv. Knappen beholdt pauseteksten, og umiddelbar markering ved bildevalg var bevart.
- Pauseknappen stoppet avspillingen. Manuelt valg av bilde 2 mens fremvisningen var pauset beholdt pausen; etter mer enn 15 sekunder var bilde 2 fortsatt valgt og ingen overgang pågikk.
- Startknappen slo avspillingen på igjen. Forhåndsvisningen ble stående med avspilling på.
- `npm run check` bestod, og nettleserens feil- og varsellogg var tom.

Manuelt bildevalg starter en ny 15-sekundersperiode når avspilling er på. Redusert bevegelse styrer fortsatt fade og trykkeffekt, men setter ikke fremvisningen på pause. Skjulte faner venter med automatiske skift til siden er synlig igjen, uten å endre brukerens avspillingsvalg.

## Popup-rulling og fast toppmeny – 21. oktober 2026

| Scenario | Observert resultat |
| --- | --- |
| Rull ned på PC | Toppmenyens øvre kant forble ved 0; bakgrunn og skygge gjorde menyen lesbar |
| Trykk Pakkelisten i menyen | Seksjonen startet ved 124 px, under menyens nederkant på 101 px; riktig menymarkering |
| Åpne info med pekerklikk på den faste menyen | Sidens rulleposisjon forble 776 px, og innholdet flyttet seg ikke sideveis |
| Rull utenfor åpent infovindu | Bakgrunnens posisjon forble 776 px |
| Lukk popupen | Samme rulleposisjon beholdt; vanlig siderulling fungerte igjen |
| Infovindu på PC | Målt bredde 660 px; innhold og knapper innenfor vinduet |
| Infovindu ved 390 px | Egen rulling til bunnen; bakgrunnen forble ved 1647 px også ved videre rulling etter bunnen |
| Infovindu ved 320 px | Ingen horisontal overflyt; popupens høyde 708 px i 740 px høy visning |
| Escape og lukkeknapp | Popupen lukket, og bakgrunnslåsen ble fjernet |
| Pakkemodus på mobil | Vanlig toppmeny skjult; pakkemodusens egen fremdriftslinje ved toppen |
| Syntaks og nettleserlogg | `npm run check` bestått; ingen feil eller advarsler |

Kontrollen bruker den innebygde nettleseren og simulert mobilbredde. Midlertidig skjermstørrelse ble tilbakestilt. Skjermbilder ligger i `output/pakkeklar-fast-toppmeny.png` og `output/pakkeklar-bred-popup.png`. Ingen turdata ble endret.


## Reiseglede og reisebillett – 21. oktober 2026

Agenten kontrollerte den lokale appen i den innebygde nettleseren. En midlertidig tur, drøm, et minne og et stempel ble brukt, og ryddet bort etterpå.

| Scenario | Faktisk resultat |
| --- | --- |
| Reisebillett | Nærmeste fremtidige tur var hyttehelgen, med dato, 3 dager og 23 dagers nedtelling; ingen reisefølgefelt |
| Ny drøm → tur | Navn, fjelltype og vintermotiv fulgte med til en egen tur med tom pakkelistefremdrift og redigerbar dato |
| Reisebingo | Tre første felt ga én fullført rekke; nullstilling til 0/9 og Angre ga 3/9 og bingo tilbake |
| Aktivitetshjul | Knappen viste «Hjulet snurrer …» umiddelbart; flere trekk ga ulike resultater |
| Redusert bevegelse | Midlertidig emulert innstilling ga resultat umiddelbart og aktiv knapp; emulering fjernet etter testen |
| Minneglass | Opprettet, åpnet både lapp og liste, redigerte og leste minnet igjen; teksten `<script>` ble vist som tekst |
| Reisepass | Gjennomført testtur fikk stempel; senere fjerning virket; fremtidig sydentur kunne ikke stemples |
| Omlasting | 3/9 bingo, hjulforslag, minne og aktiv testtur overlevde omlasting |
| Uavhengige turer | Sydenturen hadde 0/9 og 0 minner mens testturen hadde innhold; spillelisten på sydenturen var beholdt |
| Spilleliste | Spotify-lenke og tittel ble lagret per tur; eksternt domene ble avvist med synlig valideringsmelding |
| Ulagrede turdetaljer | Ny turvelger åpnet eksisterende lagre-/forkastdialog; Fortsett beholdt tekst, Forkast byttet tur korrekt |
| Tastatur | Høyrepil flyttet valgt fane fra På tur til Drømmer og videre til Minner |
| Mobil 390 og 320 px | Ingen horisontal overflyt; hjul, faner, pass og dialog ble kontrollert visuelt |
| Ny popup på mobil | Rulling utenfor vinduet lot sidens rulleposisjon stå på 2235 px; Escape lukket |
| Pakkemodus | Reiseglede ble skjult og mobilens fremdriftslinje forble synlig |
| Koffert | 0 av 22 og 22 av 22 ga henholdsvis 0 og 100 prosent, med riktig ferdigvisning |
| Papirstil | Emulert utskriftsmedium skjulte Reiseglede, billett, koffert og digitale fremdriftsfelt; kategorier og Før avreise var synlige |
| Kodekontroll | 44/44 automatiske tester bestått; `npm run check` bestått |
| Nettleserlogg | Ingen feil eller advarsler ved sluttkontroll |

Dette var kontroll av utskriftsstil, ikke en ny PDF-eksport eller fysisk utskrift. Tidligere rendret PDF-kontroll er dokumentert over. Testingen gjelder én nettleser og simulerte mobilbredder, ikke alle nettlesere eller en fysisk telefon.

Begge opprinnelige turer ble beholdt: hyttehelgen 9/24, sydenturen 3/21, begge 0/5 forberedelser. Til slutt var sydenturen valgt, testinnhold fjernet og vanlig skjermstørrelse og bevegelsesinnstilling gjenopprettet. Nye skjermbilder ligger i `docs/images/pakkeklar-reiseglede.png` og `docs/images/pakkeklar-drommeskuff.png`.

## Lesbarhet og bildetekster – 21. oktober 2026

Alle sju bilder ble valgt manuelt i nettleseren. Hvert bilde fikk riktig tekst ved fullført overgang, og avspilling forble på etter hvert valg. Automatisk overgang fra skogbildet tilbake til Middelhavet ble også observert. «DET LILLE EKSTRA» og de små kortoverskriftene ble målt til 10 px; bildeteksten til 11 px med mørk grønn bakgrunn.

PC samt simulerte mobilbredder på 390 og 320 px ble kontrollert visuelt. Ved mobilbreddene var dokumentets innholdsbredde lik den tilgjengelige bredden (375 og 305 px med rullefelt), uten horisontal overflyt. Reisebillett og turkort hadde plass til den større teksten ved 320 px. `npm run check` bestod, og nettleserloggen viste ingen feil eller advarsler. Turdata ble ikke endret, og normal vindusstørrelse ble gjenopprettet. Oppdatert dashboardbilde ligger i `docs/images/pakkeklar-reiseglede.png`; bilde av forsiden ligger i `output/pakkeklar-lesbarhet-bildetekst.png`.


## Glassflate og tekstovergang – 21. oktober 2026

Overgangen ble kontrollert i nettleseren: gammel tekst ble målt til 0,70 opasitet under uttoning, ny tekst til 0,02 ved innfading og 1 da bildet var ferdig. Hver halvdel varer 0,6 sekunder. Raske valg av storby, strand og skog endte med skogbildet og «Sov ute. Pust ut.», mens avspilling fortsatt var på. Emulert redusert bevegelse ga umiddelbart tekstbytte uten overgang, med full synlighet; emuleringen ble deretter fjernet. `npm run check` bestod, og nettleserloggen viste ingen feil eller advarsler. Skjermbilde: `output/pakkeklar-glass-bildetekst.png`.


## Zoom, tre eksempler og turoversikt – 21. oktober 2026

47/47 automatiske tester og syntakskontrollen bestod. Nye tester kontrollerer at billett og kort samlet viser hver tur én gang når dato/stempel endres, at en enkelt tur fortsatt kan vises, og at sorteringen ikke endrer kildedata. Oppgraderingstester dekker bevaring av egne ting, mengder, forberedelser og aktiv tur, engangstillegg, senere sletting av eksemplet, full turkapasitet og allerede eksisterende eksempel.

I nettleseren ble tre unike turer observert både før og etter omlasting: hyttehelg 9/24 pakket, København 4/18 og sydentur 3/21. Hyttehelgen stod kun som billett. Turvelgeren oppdaterte navn, bilde og pakkeliste; billettknappen åpnet hyttehelgen og markerte den valgt. Sydenturen ble valgt igjen til slutt.

Bildezoomen ble målt til en skala rundt 1,003, med 16,2 sekunders animasjon. Pause frøs samme transformasjon gjennom flere turbytter; redusert bevegelse ga ingen animasjon eller transformasjon. Innstillingen ble gjenopprettet, og avspilling var på til slutt. Ved simulerte mobilbredder på 390 og 320 px var det ingen horisontal overflyt. Billetten, tre turer og turvelgeren med langt navn ble kontrollert visuelt. Vanlig vindusstørrelse ble gjenopprettet.

## Samlet kontroll før publisering – 21. oktober 2026

Codex kjørte en ny kontroll på brukerens forespørsel, med den samme kildekoden på `127.0.0.1:4178`. Denne adressen har separat nettleserlagring fra den vanlige forhåndsvisningen på port 4177. Testdata ble opprettet gjennom grensesnittet, og brukerens opprinnelige turer ble ikke brukt som testdata.

| Område | Observert resultat |
| --- | --- |
| Førstegangsbesøk | Hyttehelg 13.11.2026: 8/24 pakket; København 16.04.2027: 4/18; Sydentur 19.06.2027: 3/21. Hyttehelgen var valgt, og hver tur ble vist én gang. Alle hadde 0/5 forberedelser. |
| Startinnhold i Reiseglede | Tre merkede drømmeforslag. Ingen personlige spillelistelenker, minner eller stempler; bingo 0/9. |
| Opprette tur | Navn, dato, fire dager, storbytype og valgt togmotiv ble lagret som en egen tur. |
| Egne tillegg | Et kamera ble lagt til og krysset av. Samme navn på nytt ble avvist med melding, uten ekstra punkt. |
| Fjerne punkt og angre | Deodorant ble fjernet og gjenopprettet med Angre. En paraply ble fjernet og forble borte etter endring av varighet. |
| Antall og varighet | Økning fra fire til sju undertøy fjernet avkryssingen. Etter ny avkryssing og endring fra fire til åtte dager ble manuelt antall sju og avkryssingen beholdt. Automatiske sokker økte til åtte og ble gjenstående. |
| Bytte turtype | Forhåndsvisning viste hvilke forslag som endres. Eget kamera, felles undertøy med manuelt antall og fullført ladeforberedelse ble bevart ved overgang til fjell. |
| Ulagrede detaljer | Fortsett å redigere beholdt utkast og opprinnelig valgt tur. Lagre og fortsett lagret nytt navn før turbytte. Forkast lot det gamle navnet stå. |
| Validering | Null reisedager ble avvist. Spotify-feltet avviste et annet domene og godtok en syntaktisk gyldig testlenke. Musikken ble ikke åpnet eller avspilt. |
| Kopi | Eget punkt, manuelt antall og bilde fulgte med, med 0/23 pakket og ingen utførte forberedelser. Originalen ble beholdt. |
| Filtre og kategorier | Pakket viste bare det avkryssede punktet. Folding skjulte kategoriens innhold, mens overskriften var tilgjengelig. Alt viste listen igjen. |
| Fullføring | 23/23 ga «Alt er pakket» og henvisning til fem forberedelser. Etter fem avkryssinger kom «Klar for avreise» og koffert på 100 %. |
| PDF | Eksport med Chromium sin utskriftsmotor mens Pakket var valgt og Klær var lukket. Én A4-side inneholdt alle 23 ting og fem forberedelser, tomme bokser, riktige antall og ingen digital fremdrift. Både tekstuttrekk og rendret side ble inspisert. |
| Aktivitetshjul | Umiddelbar snurr-status og deretter et lagret aktivitetsforslag. |
| Bingo | Tre første ruter ga 3/9 og én bingorekke. Nullstilling ga 0/9; Angre gjenopprettet 3/9. |
| Drøm → tur | Opprettet og redigerte en drøm, valgte vintermotiv og fjelltype, og gjorde den om til en selvstendig tur uten dato og med 0/22 pakket. |
| Reisepass | Gjennomført prøvetur fikk stempel. Duplikatstempling var deaktivert. Fremtidig tur kunne ikke stemples. Stempelet ble bevart da tilhørende prøvetur ble slettet. |
| Minneglass | Opprettet, åpnet, redigerte og leste minne. HTML-lignende tekst ble vist bokstavelig. Fjerning og Angre ga henholdsvis 0 og 1 minne. |
| Omlasting og turbytte | Egne ting, antall, avkryssinger, forberedelser, bingo, hjulforslag, testlenke, minne og stempel overlevde omlasting. Minner og bingo var adskilt per tur. |
| Mobil 390 px | Pakkemodus skjulte hero, planlegging og Reiseglede. Fast fremdrift endret seg fra 23/23 til 22/23 ved avkryssing. Antallsdialogen passet skjermen; Bruk forslag satte antallet tilbake til åtte. |
| Mobil 320 px | Ingen horisontal overflyt: innholdsbredde og tilgjengelig bredde var begge 305 px med rullefelt. Turvelger, faner og aktivitetskort ble kontrollert visuelt. |
| Tastatur og dialoger | Høyrepil flyttet fane fra På tur til Drømmer og Minner. Escape lukket info. Rulling utenfor åpne dialoger lot bakgrunnen stå stille. Desktop-info var 660 px bred. |
| Meny | Header forble ved 0 px under rulling. Etter avsluttet ankerrulling var Pakkelisten markert og seksjonen startet ved 124 px, under menyens nederkant på 101 px. |
| Bilder og bevegelse | Alle sju bilder og passende bildetekster ble valgt. Prikken reagerte umiddelbart; avspilling forble på og automatisk skifte ble observert. Pause ga pauset zoom; emulert redusert bevegelse ga ingen animasjon eller transformasjon. |
| Sletting og opprydding | Behold turen avbrøt sletting. Bekreftet sletting fjernet bare valgt prøvetur. En drøm fikk tilbake «Gjør dette til en tur» da tilknyttet tur var slettet. Alle prøveturer, testdrøm og teststempel ble ryddet bort; omlasting viste de tre opprinnelige eksemplene igjen. |
| Automatiske kontroller | `npm run check` bestått og 47/47 tester bestått. Nettleserloggen hadde ingen feil eller advarsler ved sluttkontroll. |

Ingen funksjonsfeil ble observert i disse flytene; denne runden krevde ingen endring av appkoden. Skjermbilde av standardvisningen er lagret i `docs/images/pakkeklar-forstegangsbesok.png`. Lokale QA-artefakter ligger i `output/qa-mobile-packing.png` og `output/pdf/qa-papirliste.pdf` med tilhørende PNG. Midlertidig mobilbredde og innstilling for redusert bevegelse ble gjenopprettet.

Avgrensning: testet i Codex sin innebygde Chromium-nettleser, med simulerte mobilbredder. Det er ikke en kontroll på en fysisk telefon eller i Safari/Firefox. PDF-en ble eksportert med nettleserens utskriftsmotor, ikke skrevet ut på fysisk papir. Spotify-testen kontrollerte lagring og lenkeformat, ikke innholdet i en ekstern spilleliste. Denne runden gjaldt den lokale prototypen; den offentlige appen ble kontrollert separat nedenfor.

## Papirbillett og startinnstillinger – 21. oktober 2026

54/54 automatiske tester og `npm run check` bestod. Sju nye tester dekker bevisst tomt turarkiv, opprinnelige startverdier, samlet sikkerhetskopi, angre i en ny lagringsøkt, lagringsfeil under bytte og angre, samt ugyldig valg eller sikkerhetskopi. Testene kontrollerer at uvedkommende lagringsnøkler beholdes.

Nettlesertestene ble kjørt på den separate lokale adressen med port 4178:

| Område | Observert resultat |
| --- | --- |
| Avbryt reset | Behold innholdet lukket bekreftelsen og lot de tre turene stå. |
| Tom start | Ingen turkort, reisebillett eller aktiv pakkeliste. Skjemaet for første tur var tomt. Omlasting beholdt tom tilstand uten å hente tilbake eksempler. |
| Angre etter omlasting | De tre turene og valgt sydentur kom tilbake, sammen med et avkrysset eget kamera, 4/22 pakket, bingo 1/9 og en egen minnelapp. |
| Første tur | Fra tom app ble en egen tur opprettet gjennom skjemaet. Den fikk 0/18 pakket, normal liste og Reiseglede. Ingen ekstra tur ble opprettet. |
| Ulagret kladd | Forsøk på eksempelreset åpnet valget for ulagrede detaljer. Fortsett å redigere bevarte kladden. Lagre og fortsett lagret navnet før byttet. Etter reset og Angre kom det lagrede navnet tilbake. |
| Eksempelinnhold | Gjenoppretting viste de tre opprinnelige turene. Standardverdiene er også sammenlignet direkte med startdataene i en automatisk test. |
| Mobil 390 og 320 px | Innstillingsknappen og hjelpeknappen fikk plass i toppmenyen. Dialogen fikk egen rulling ved 320 px, mens sidens rot hadde `overflow: hidden`. Ingen horisontal overflyt. Papirbillett og turkort ble inspisert visuelt. |
| Navigasjon | Billettknappen åpnet riktig pakkeliste. Mobilens hjelpeknapp åpnet informasjonen, og Escape lukket den. |
| Nettleserlogg | Ingen feil eller advarsler på testadressen eller i den oppdaterte vanlige forhåndsvisningen. |

Etter at den lokale serveren ble startet på nytt med den nye modulen, ble den vanlige forhåndsvisningen oppdatert. Brukerens tre turer og fremdrift ble bevart: 9/24 på hytteturen, 4/18 i København og 6/21 på sydenturen. Ingen reset ble utført på brukerens adresse. Skjermbilder: `pakkeklar-papirbillett.png`, `pakkeklar-papirbillett-mobil.png` og `pakkeklar-innstillinger.png` under `docs/images/`.

Denne runden omfattet de nye innstillingene og billettens utforming. Tidligere kontroll av de øvrige funksjonene og PDF er dokumentert over; ingen ny PDF-eksport eller test på fysisk telefon ble gjort i denne runden.

## Papirstruktur og glans – 21. oktober 2026

Billetten ble kontrollert i nettleseren på PC og med simulerte mobilbredder på 390 og 320 px. Kantbredden er 0 px og hjørneradien 2 px. Den lokale SVG-teksturen lastes og vises; SVG-filen ble også XML-validert. Hover startet `ticket-shine` med varighet 1,2 sekunder. Tastaturnavigasjon fra Ny tur til Åpne pakkelisten startet samme effekt. Ved emulert redusert bevegelse var animasjonen `none` og sveiplaget skjult. Tekstlaget ligger over glansen, og glanslagene har `pointer-events: none`.

Ingen horisontal overflyt ble målt ved 390/320 px: innholdet og tilgjengelig bredde var henholdsvis 375/305 px. Nettleserloggen hadde ingen feil eller advarsler. Normal vindusstørrelse og bevegelsesinnstilling ble gjenopprettet. Turdata ble ikke redigert. Dette var en visuell CSS/SVG-endring; det ble ikke lagt til eller kjørt nye logikktester i denne runden. Oppdatert skjermbilde ligger i `docs/images/pakkeklar-papir-glans.png`.


## Kontroll av offentlig GitHub Pages – 21. oktober 2026

Første publisering 21. oktober 2026 fullførte. Syntakskontroll, 54/54 tester, bygg og Pages-publisering bestod. Appen ble deretter prøvd på https://lassejolsen.github.io/pakkeklar/ med ny nettleserlagring. Data på utviklingsadressen `127.0.0.1:4177` ble ikke endret.

| Område | Observert resultat |
| --- | --- |
| Offentlig tilgjengelighet | Forsiden svarte HTTP 200 uten innlogging. De ti appfilene og 14 lokale ressursene kunne hentes offentlig og hadde samme SHA-256 som filene i det lokale bygget. |
| Førstegangsbesøk | Tre turer, hver vist én gang: hyttehelg 8/24, København 4/18 og sydentur 3/21. Alle hadde 0/5 forberedelser. Bingo startet på 0/9, og ingen personlig spillelistekobling var satt. |
| Ny tur | Opprettet «Publiseringstest – helgetur», storby, 14. mai 2027 og fire dager gjennom grensesnittet. |
| Egne ting og antall | La til Kamerabatteri, satte antall til to og krysset av. Økningen av antall fjernet tidligere avkryssing som forventet. |
| Varighet og omlasting | Endret fire til sju dager. Eget kamerabatteri med antall to og avkryssing, samt ladeforberedelsen, var fortsatt lagret etter omlasting. |
| Filtrering og folding | Pakket viste avkryssede ting; kategorier kunne lukkes. Alt hentet frem hele listen igjen. |
| PDF | Eksport med Chromium sin utskriftsmotor mens Pakket var valgt og Klær lukket. Én A4-side inneholdt alle 19 ting, riktige antall og fem forberedelser. Alle bokser var tomme, og digital fremdrift var skjult. Både tekstuttrekk og rendret side ble inspisert. |
| Kopier tur | Kopien beholdt eget punkt og antall, med 0/19 pakket og nye avkryssinger. Originalen ble beholdt. |
| Bingo | En avkrysset rute på kopien var fortsatt markert etter omlasting. |
| Mobil 390 px | Pakkemodus skjulte planleggingen, fremdriften ble oppdatert fra 0/19 til 1/19, og innholdet var 375 px bredt med rullefelt uten horisontal overflyt. |
| Innstillinger og opprydding | Bruk eksempelinnhold gjenopprettet de tre opprinnelige turene. Midlertidige testturer ble fjernet fra testprofilen, og standard skjermstørrelse ble gjenopprettet. |
| Nettleserlogg | Ingen registrerte feil eller advarsler ved sluttkontroll. |

Dette var kontroll i Chromium og simulert mobilbredde, ikke testing på alle nettlesere eller en fysisk telefon. PDF ble eksportert og rendret, ikke skrevet ut på fysisk papir. Den bredere lokale funksjonskontrollen står over.

Skjermbilder fra den offentlige appen ligger i `docs/images/pakkeklar-publisert.png`, `pakkeklar-forstegangsbesok.png` og `pakkeklar-reiseglede.png`. Midlertidig test-PDF og mobilbilde ligger lokalt under Git-ignorert `output/`.

## Dokumentasjonskontroll – 22. oktober 2026

Codex kontrollerte dokumentasjonsoppdateringen med følgende resultater:

| Kontroll | Resultat |
| --- | --- |
| `npm test` | 54 av 54 tester bestod |
| `npm run check` | Alle JavaScript-filer bestod syntakskontrollen |
| `npm run build` | Bygget inneholdt de ti appfilene og 14 lokale ressurser |
| Lokale dokumentasjonslenker | Alle 17 fil- og bildelenker hadde et eksisterende mål |
| Endringens omfang | Dokumentasjonsfiler og én CSS-kommentar; CSS-reglene var identiske etter fjerning av kommentarer |
| `git diff --check` | Ingen mellomromsfeil |

Det ble ikke kjørt en ny interaktiv nettlesertest i denne runden. Funksjons- og PDF-kontrollene over gjelder de tidligere kontrollerte appfilene; denne endringen endrer ikke appens funksjoner eller utseende.
