# EventBooking.Api

API'et viser, hvor mange pladser der er ledige i en sektion, og sælger billetter. Det læser og skriver i Postgres og cacher ledige pladser i Redis i 2 sekunder.

Kommandoerne er til Git Bash og køres fra repo-roden (mappen `AP-exam`).

## Forudsætninger

- .NET 10 SDK (`dotnet --version` viser `10.0.x`)
- Docker Desktop, startet

## Kør

Start en lokal database (samme image som i k8s/postgres-a.yaml). Bruger, adgangskode og database matcher "Sections" i api/appsettings.json:

```bash
docker run -d --name booking-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=booking postgres:16
```

Vent et par sekunder, til Postgres er klar, og opret tabellen:

```bash
docker exec -i booking-db psql -U postgres -d booking < api/Schema.sql
```

Du skal se:

```
CREATE TABLE
INSERT 0 4
```

Start en lokal Redis (cachen, issue #9). API'et kan ikke starte uden:

```bash
docker run -d --name booking-redis -p 6379:6379 redis:7
```

Start API'et:

```bash
dotnet run --project api
```

Du skal se:

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5133
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

## Tjek at det virker

Kør dem i en ny terminal, mens API'et kører. Det forventede output gælder en frisk database.

1. API'et svarer

   ```bash
   curl -i localhost:5133/health
   ```

   Forventet:

   ```
   HTTP/1.1 200 OK
   ```

2. Ledige pladser i sektion 1 (har plads til 100)

   ```bash
   curl localhost:5133/sections/1
   ```

   Forventet:

   ```
   {"id":1,"free":100}
   ```

3. Køb 3 billetter

   ```bash
   curl -i -X POST localhost:5133/sections/1/buy -H "Content-Type: application/json" -d '{"count": 3}'
   ```

   Forventet:

   ```
   HTTP/1.1 200 OK
   ```

4. Ledige pladser igen. Vent mindst 2 sekunder, ellers svarer cachen med det gamle tal (100):

   ```bash
   curl localhost:5133/sections/1
   ```

   Forventet:

   ```
   {"id":1,"free":97}
   ```

5. Køb flere billetter, end der er tilbage, og så bliver salget afvist

   ```bash
   curl -i -X POST localhost:5133/sections/1/buy -H "Content-Type: application/json" -d '{"count": 500}'
   ```

   Forventet:

   ```
   HTTP/1.1 409 Conflict
   ...
   "only 97 places left"
   ```

6. Metrics til Prometheus: API'et tæller sine egne requests

   ```bash
   curl -s localhost:5133/metrics | grep http_server_request_duration_seconds_count
   ```

   Forventet: en linje pr. route og statuskode, fx (tallet til sidst er antal requests):

   ```
   http_server_request_duration_seconds_count{...,http_request_method="GET",http_response_status_code="200",http_route="/sections/{id:int}",...} 2
   ```

## Slå cachen fra

Til sammenligningen i issue #10: start API'et med `CacheEnabled=false`, så går hver `GET /sections/1` direkte til Postgres. Redis skal stadig køre, for API'et forbinder til den ved opstart.

```bash
CacheEnabled=false dotnet run --project api
```

Gentag tjek 3 og 4. Nu viser `GET` det nye tal med det samme, uden at vente 2 sekunder.

## Stop

Stop API'et med Ctrl+C. Stop og slet containerne (data i databasen forsvinder):

```bash
docker rm -f booking-db booking-redis
```

## Vedligehold

Opdatér den lokale database (hvis Schema.sql ændres). OBS: sletter alle data i tabellen:

```
docker exec -i booking-db psql -U postgres -d booking -c "DROP TABLE section;"
docker exec -i booking-db psql -U postgres -d booking < api/Schema.sql
```

OBS: Schemaet findes to steder. Ændres api/Schema.sql, skal kopien i k8s/schema.yaml rettes med (den bruges af postgres-a og postgres-b i Kubernetes).

## Opdatér imaget

Hvis koden i api/ eller api/appsettings.json ændres:

```
docker login
```
```
dotnet publish api /t:PublishContainer --os linux --arch x64 -p:ContainerRegistry=docker.io -p:ContainerRepository=srenits/eventbooking-api
```
`dotnet publish` kræver ingen dockerfil, modsat `docker buildx` — har gjort det sådan for at minimere kompleksitet.

OBS: I Kubernetes overskrives "Redis" og "Sections" fra appsettings.json af miljøvariabler i k8s/api.yaml. Skal de ændres i clusteret, så ret k8s/api.yaml — ikke appsettings.json.
