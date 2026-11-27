# Første udkast: individuel fremlæggelse af gruppeprojektet

PowerPoint-WIP: `EventBooking-Fremlæggelse-WIP.pptx`

## Ramme og fortælling

Projektet blev lavet i en gruppe, men eksamen er individuel: hver studerende skal selv præsentere og forsvare sine arkitekturvalg. Eksamensoplægget angiver 5-10 minutters præsentation og forventer en kort demo af systemet i drift samt arkitektur, kodebase, driftsmiljø og UML class-, object- og deploydiagrammer.

Forslaget holder sig til **7 slides** og ca. 7 minutter. Loadtestene er den røde tråd:

**Princip/påstand → arkitekturændring → målt effekt → hvad målingen ikke beviser.**

En UI-demo virker ikke nødvendig for at forklare systemet. På slide 2 kan object-diagrammet vise en konkret købstilstand, suppleret af et kort API-kald i drift for at opfylde demo-forventningen.

## Slide-for-slide-udkast

### 1. Hvad gjorde vores arkitekturvalg ved systemet?

Åbning: Projektet er et fælles EventBooking walking skeleton. Den enkelte studerende zoomer ind på 1-2 valgte principper, som vedkommende kan forklare og forsvare med evidens.

### 2. Et køb skal være korrekt, før det skal være hurtigt

Vis et object-snapshot: køber beder om 2 pladser, request routes til den database, der ejer Section 1, og Section-rækken går fra `sold = 0` til `sold = 2`.

Sig, at API'et bruger `SELECT ... FOR UPDATE`, kontrollerer kapaciteten og opdaterer `sold` i samme transaktion. Cachen bruges ikke til køb. Hvis der ikke er plads, returneres 409 uden at ændre state.

**Demo i drift:** Hvis ønsket, kør ét kort API-kald og vis svaret/databaserækken. Det er mere arkitektur-relevant end at gennemklikke UI'et. Object-snapshottene i udkastet er illustrative værdier, ikke en optagelse af en bestemt kørsel.

**UML:** Slide 2 viser et object-snapshot og en lille model-fragmentering: `BuyRequest` er en C# record; `section` er databaserækken; routeren er konfiguration. Den endelige UML class-visning skal vise koden præcist og må ikke præsentere databaserækken eller konfigurationen som eksisterende C#-klasser.

### 3. Målingerne skal læses i lyset af testmiljøet

Vis deployment-overblikket: k6 → API Service → 1 eller 3 API-replikaer → section-router → en eller to Postgres-databaser; Redis bruges til availability-reads; Prometheus/Grafana indsamler og viser metrics.

Sig de vigtigste testbetingelser: Minikube er én node; API- og Postgres-pods er begrænset til 250m CPU; k6, cluster og monitorering deler samme maskine; tests gik ind via Minikube-tunnelen. Reads og writes blev kørt separat.

Dette slide skal være den korte deployment-visning. Eksamensoplægget forventer UML deploy, så udskift eller supplér skitsen med det endelige UML deployment-diagram.

### 4. X alene flyttede ikke grænsen; X + Z gav mere headroom

**X-skalering alene, reads:**

- Baseline: p95-grænsen på 200 ms ved gennemsnitligt **1.767 req/s**, spredning ±33, baseret på tre runs.
- Tre API-replikaer og én Postgres: grænse ved **1.750 req/s**, ét run.
- I X-only-run nåede Postgres 0,25 core (CPU-loftet), mens travleste API-pod var 0,24 core.

**Foreløbig pointe:** X-skalering alene viste ikke en klar forbedring i denne måling; Postgres ser ud til at være flaskehalsen. Det er et vigtigt resultat, ikke en “fejl” ved testen.

**Write throughput ved forskellige setups:**

| Setup | Højeste gennemførte req/s | Grundlag |
|---|---:|---|
| 1 API, 1 DB | 200 | gennemsnit af tre baseline-runs; spredning ±3 |
| 1 API, 2 DB | 330 | bedste load-step i ét run |
| 3 API, 2 DB | 799 | ved planlagte 800 req/s i ét run |

**Forbehold:** X+Z-runnet var ikke en stabil kapacitetsgrænse: ved planlagte 900 req/s faldt målt throughput til 569 req/s, og k6 rapporterede utilstrækkeligt antal VUs. Tallene er interessante indikationer, ikke endelige generaliserbare benchmarks.

### 5. Redis aflaster læsevejen markant i testen

- **Uden cache:** baseline p95 passerer 200 ms ved ca. 1.767 req/s; Postgres omkring 0,25 core.
- **Redis til, én API og én DB:** ved planlagte 4.000 req/s var p95 49,59 ms; Postgres CPU var 0,02 core.
- **Tre API'er og Redis:** ved planlagte 8.000 req/s var p95 27,83 ms; Postgres CPU var 0,01 core.

**Foreløbig pointe:** Cache ser ud til at holde Postgres næsten ude af read-loaden. Availability er dog advisory og kan være op til 2 sekunder gammel; et køb går stadig til Postgres og låser rækken.

**Forbehold:** Cache-kørslerne var enkeltstående og grovere load-steps end baseline. 8.000-runnet havde 0,06% fejl, der ifølge noterne skyldtes forbindelsesfejl i tunnelen, ikke API-pods. Sammenlign derfor med forsigtighed.

### 6. To stærke beviser: fejlisolering og ingen oversalg

**Fault isolation, Postgres B stoppet:**

- Ved load steps fra 150 til 500 req/s fik database A 0% fejl.
- Requests routet til den stoppede database B fik 100% fejl, HTTP 500.

Det understøtter, at fejl i B's sektioner ikke stoppede køb i A's sektioner. Det er ikke en fejlfri samlet brugeroplevelse: købere, der rammer B, får fejl.

**Oversell check:**

- 3 API-replikaer og 2 databaser; 4.000 pladser blev solgt på tværs af 40 sektioner.
- 31.773 køb blev afvist med 409, og ingen requests fejlede.
- I begge databaser var højeste `sold` 100 ved kapacitet 100.

Det er et konkret korrekthedsbevis for det testede samtidighedsscenarie: `sold <= capacity`. Det beviser ikke, at alle tænkelige scenarier er dækket.

### 7. Hvad kan jeg personligt forsvare?

Mulig afslutning: “Principperne kan ses i vores målinger, men kun når vi forklarer, hvor flaskehalsen flyttede hen, og hvad testmiljøet begrænser.”

Den studerende vælger 1-2 principper og knytter hver påstand til:

1. hvad man ville opnå,
2. hvad gruppen implementerede,
3. hvilken måling der understøtter påstanden,
4. hvad målingen ikke kan vise.

Mulige principfokus: to-akse skalering; caching; Design to Be Monitored; Isolate Faults; korrekthed via databaseautoritet/atomisk køb. Vælg kun noget, man selv kan forklare og forsvare.

## Andre nedslagspunkter / idéer til slides

Reserveindhold, ikke ekstra kerneslides:

- UML class diagram i større format.
- UML object diagram i større format.
- K6/Grafana-vindue med p95, throughput og CPU fra én konkret test.
- En separat graf for cache, X-skalering eller Z-skalering, hvis den bliver gentaget med stærkere sammenlignelighed.
- Flere fejlkilder: tunnel, k6-VUs, CPU-lofter, varm-up og gentagelser.
- Demo-fallback med optagelse/screenshot, hvis API'et ikke kan vises live.

## Spørgsmål til næste revision

- Hvilket fund skal være hovedhistorien i din individuelle fremlæggelse: skalering, Redis/cache eller fault isolation/korrekthed?
- Skal object-diagrammet være den primære systemvisning, med et kort API-kald som drift-demo, frem for UI-demo?
- Vil du have udkastets fire resultatgrupper beholdt, eller skal vi skære ned til ét hovedprincip og ét supplerende fund?
