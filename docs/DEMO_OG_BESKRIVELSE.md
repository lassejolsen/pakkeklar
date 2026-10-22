# Kom i gang med Pakkeklar

[Åpne Pakkeklar](https://lassejolsen.github.io/pakkeklar/) · [Se kildekoden](https://github.com/lassejolsen/pakkeklar).

## Kort beskrivelse

Pakkeklar er en nettapp som hjelper brukeren å forberede reiser. En oversikt viser turene med bilde, nedtelling, pakkefremdrift og forberedelser. Brukeren velger storbytur, fjelltur eller strandferie og hvor mange dager reisen varer. Appen foreslår en pakkeliste som kan tilpasses med egne ting og antall. Under pakkingen kan man filtrere, lukke kategorier og bruke en egen pakkemodus på mobil. Egne tillegg beholdes når varighet eller turtype endres, og appen varsler om ulagrede turdetaljer. «Før avreise» samler små forberedelser som å lade powerbank og laste ned billetter eller kart. En tur kan kopieres, og listene kan lagres som en papirvennlig PDF. Alt lagres lokalt i nettleseren.

Dashboardet har også en reisebillett for neste tur og en drømmeskuff der en reiseidé kan bli en ferdig pakkeliste. Aktivitetshjul, reisebingo, spillelistekobling, reisepass og minneglass gjør appen nyttig også under og etter turen.

Formålet er å redusere tiden man bruker på å lage pakkelister og gjøre det lettere å holde oversikt over hva som gjenstår. Prototypen bruker HTML, CSS og JavaScript.

## Prøv hovedfunksjonene

1. Åpne appen. Første besøk viser tre fiktive turer med ulike datoer og pakkefremdrift.
2. Bytt mellom hyttehelgen, vårhelgen i København og sydenturen i 2027. Neste aktuelle tur vises som billett, de andre som kort. Innstillingene lar deg starte tomt eller hente tilbake eksemplene.
3. Åpne hyttehelgen, trykk **Kopier tur**, og gi kopien et nytt navn og en dato. Egne tillegg følger med, mens avkryssingene starter på nytt.
4. Legg til **Kamerabatterier**, trykk på antallet og velg **2**. Åpne **Rediger reiseplan**, endre fra tre til sju dager og trykk **Lagre reiseplan**. Eget punkt og antall beholdes, mens eksempelvis tursokker får nytt forslag. Kryss av noen ting og prøv filteret **Gjenstår**.
5. Kryss av **Lad mobil og powerbank** i **Før avreise**. Forberedelsene har egen fremdrift.
6. Last siden på nytt. Turen, eget tillegg, antall og avkryssingene er lagret i samme nettleser.
7. Trykk **Lagre som PDF** og velg PDF som mål. Papirsjekklisten har tomme avkrysningsbokser, og hele listen følger med selv når et filter er valgt. Appens avkryssinger beholdes.
8. Prøv **Start pakkemodus** på mobil. En fast fremdriftslinje følger listen, og kategorier kan lukkes mens du pakker.

## Reiseglede

Åpne Drømmer, legg inn en idé og gjør den til en tur. Riktig bilde og pakkeliste følger med. Snurr aktivitetshjulet og kryss av en bingorekke. Legg et minne i glasset og åpne lappen. Reisepasset samler stempler fra gjennomførte turer.

Du kan også velge et annet turbilde i reiseplanen og forhåndsvise hvilke pakkeforslag som endres ved bytte av turtype. Ved turbytte med ulagrede detaljer får du velge mellom å lagre, forkaste eller fortsette å redigere.

## AI-bruk og forbedringer

ChatGPT/Codex bidro med planlegging, kode, bildegenerering, automatiske tester og nettleserkontroll. Utvikleren valgte idé og omfang og ga tilbakemeldinger på design og funksjoner. [Arbeidsloggen](ARBEIDSLOGG.md) beskriver forbedringene, og [testloggen](TESTLOGG.md) skiller mellom automatiske tester, agentens nettleserkontroll og visuelle tilbakemeldinger.
