# Utviklingsplan – Pakkeklar

Listen ble prioritert 21. oktober 2026. Status er gjennomgått 22. oktober: punkt **1–10, 14 og 16** er implementert. Punkt **11 og 15** er delvis dekket av større småtekst og eksisterende feltvalidering. De øvrige punktene er mulige videre forbedringer. Varighet som bevarer tilpasninger og redigerbare antall ble gjennomført før denne listen.

Prioriteringen kombinerer nytte, visuelt løft og begrenset kompleksitet. Behold dagens farger, typografi og rolige uttrykk. Omfangene er grove vurderinger, ikke tidsløfter.

| Pri | Forslag | Konkret endring og nytte | Omfang |
| --- | --- | --- | --- |
| 1 | Pakkemodus på mobil | En knapp samler aktiv liste og en liten fast fremdriftslinje; hero og planleggingsskjema skjules mens man pakker. Mindre rulling. | Middels |
| 2 | Kompakt reiseplan etter lagring | Vis navn, dato og varighet som en kort oppsummering med «Rediger». Skjemaet åpnes ved behov. | Middels |
| 3 | Bilde i overskriften til aktiv tur | Et lite utsnitt fra turbildet knytter pakkelisten visuelt til det valgte kortet uten å ta mye plass. | Lite |
| 4 | Tydelig lagret / ikke lagret | «Ulagrede endringer» og valgene lagre, forkaste eller fortsette å redigere før turbytte. | Middels |
| 5 | Bevar mer også ved ny turtype | Egne tillegg og felles punkter beholdes; forhåndsvisning viser hva som legges til og tas ut mellom fjell, strand og storby. | Middels |
| 6 | Velg bilde per tur | La brukeren velge blant de eksisterende sju motivene. To fjellturer kan da få forskjellig identitet uten bildeopplasting. | Middels |
| 7 | Forberedelser på turkortet | En liten ekstra status, eksempelvis «2 av 5 forberedelser», gjør det synlig at pakket bagasje og klar til avreise er ulike ting. | Lite |
| 8 | Menymarkering som følger seksjonen | Understrekingen flyttes mellom «Mine turer» og «Pakkelisten» etter hvor brukeren er. | Lite |
| 9 | En rolig ferdigvisning | En ryddig «Alt er pakket»-melding med diskret ikon, og lenke til eventuelle uferdige forberedelser. | Lite |
| 10 | Fold sammen kategorier | Behold navn og teller synlig, men la ferdige kategorier lukkes. Nyttig når listen blir lang. | Middels |
| 11 | Mer lesbar sekundærtekst | Juster størrelse og kontrast på de minste datoene, hjelpetekstene og mengdeetikettene, innenfor dagens stil. Kontroller også klikkflatene. | Lite |
| 12 | Nedtelling som skifter uttrykk | Vis «I morgen» og en diskret aksent nær avreise. Bruk tekst i tillegg til farge og behold den presise datoen. | Lite |
| 13 | Mykere filteroverganger | Gi en kort visuell bekreftelse før et avkrysset punkt forsvinner fra «Gjenstår». Respekter redusert bevegelse. | Middels |
| 14 | En gjennomført tom turvisning | Implementert: «Start helt tomt» åpner skjemaet for første tur. Eksempler kan hentes tilbake i innstillingene, og siste bytte kan angres. | Middels |
| 15 | Feilmeldinger ved riktig felt | Vis forklaringen direkte under ugyldig navn, dato eller antall, med samme rolige design. Behold tastaturfokus på feltet. | Lite |
| 16 | Sorter kommende turer etter dato | Implementert: neste aktuelle tur vises som billett, øvrige turer sorteres etter dato og turer uten dato kommer sist. | Lite |
| 17 | Rediger navn og kategori på et punkt | Rett «Kamera» til «Kamera og objektiv», eller flytt punktet til Elektronikk, uten sletting og nyregistrering. | Middels |
| 18 | Angre fjerning av en hel tur | Gjenbruk mønsteret for enkeltpunkter, slik at en tur kan hentes tilbake med liste og forberedelser. | Middels |
| 19 | Et lite notatfelt per tur | Plass til praktiske husketing som «håndklær finnes på hytta». Vis som en liten notatflate, også i utskrift når den har innhold. | Middels |
| 20 | Last ned og åpne sikkerhetskopi | Eksporter/importer turene som JSON, med validering og forhåndsvisning før import. Nyttig ved bytte av nettleser uten å innføre konto. | Middels |

Forslagene er produkt- og designvurderinger etter gjennomgang av appen. For klikkflater støtter [W3Cs veiledning om målstørrelse](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) bruk av tilstrekkelig størrelse eller avstand mellom kontroller. Dette er ikke en full tilgjengelighetsrevisjon.

Videre arbeid kan prioritere bedre feltmeldinger og redigering av enkeltpunkter, etterfulgt av sikkerhetskopi ved behov. Punktene som fortsatt er forslag, beskriver mulige utvidelser. Se [testloggen](TESTLOGG.md) for kontroll av de gjennomførte punktene.
