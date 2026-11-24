# Kør loadtesten

Trin for trin fra et tomt Minikube til en k6-kørsel. Hvad testene måler, og hvilke scenarier der findes, står i `docs/metrics/test-description.md`.

Kør alle kommandoer fra repo-roden i PowerShell. Flere af trinene skal blive ved med at køre, så du ender med 4-5 terminaler åbne.

## 1. Start en frisk Minikube

```
minikube delete
```
```
minikube start --cpus=6 --memory=6000
```

- `--cpus=6` er hele clusterets størrelse. Hver pod har sin egen grænse i yaml-filerne (`resources` → `limits`), og de deler de 6 kerner. API og Postgres må højst bruge 0,25 kerne hver, så resten af laptoppens 4 fysiske kerner er til Windows og k6.
- `minikube delete` sletter også de gamle databaser. Det er meningen: så får de loadtest-sektionerne 101-140 fra `k8s/schema.yaml`.
- Siger den, at Docker Desktop har for lidt hukommelse eller CPU, så sæt tallet ned, eller giv Docker Desktop mere under Settings → Resources.

## 2. Start systemet

```
kubectl apply -k k8s
```
```
kubectl get pods -n booking -w
```

Vent, til alle pods viser `Running` og `1/1`. Stop visningen med Ctrl+C.

API-podsene crasher typisk et par gange (`Error`) i starten. API'en skal have Redis for at starte, og Redis er ikke klar endnu. Kubernetes genstarter dem selv. Hvis de bliver ved med at crashe, når Redis kører, så se fejlen med:
```
kubectl logs -n booking deployment/api --previous
```

## 3. Tjek, at Prometheus henter tal (ny terminal, lad den køre)

```
kubectl port-forward -n booking svc/prometheus 9090:9090
```

Gå til http://localhost:9090 → **Status → Target health**. Begge skal være **UP**:
- `api`: én linje pr. API-pod (svartider).
- `cadvisor`: én linje (CPU pr. pod).

## 4. Åbn Grafana (ny terminal, lad den køre)

```
kubectl port-forward -n booking svc/grafana 3000:3000
```

Gå til http://localhost:3000, log ind med `admin` / `admin` (tryk Skip ved nyt password). Vælg **Dashboards → New → Import**, og upload `docs/Grafana_dashboards.json`.

Graferne bruges til at forklare resultaterne. Tag screenshots under kørslerne og læg dem i `docs/metrics/images/`, for dataene forsvinder med clusteret.

## 5. Få en adresse til API'en (ny terminal, lad den køre)

```
minikube service api -n booking --url
```

Den skriver fx `http://127.0.0.1:61029`. Adressen virker kun, så længe terminalen er åben.

## 6. Kør k6 (ny terminal)

Én kørsel = alle trin: hvert trin er 1 minut ved fast fart, så 30 s pause, så næste trin med højere fart.

Læsninger: 8 trin, 50, 100, 150 ... 400 requests pr. sekund (8 × 1,5 min = 12 minutter):
```
k6 run -e MODE=reads -e START=50 -e STEP=50 -e STEPS=8 -e BASE_URL=<adressen fra trin 5> LoadTest-k6/script.js
```

Køb: samme kommando med `MODE=writes`.

k6's opsummering har en linje pr. trin, opkaldt efter farten, fx `{ scenario:rate_150 }`. Skriv for hvert trin ind i `docs/metrics/results.md`:
- `http_req_duration { scenario:rate_150 } ... p(95)=`: svartiden.
- `http_req_failed { scenario:rate_150 }`: fejlprocenten.

Er `dropped_iterations { scenario:rate_150 }` over 0, nåede k6 ikke at sende hele farten i det trin. Skriv det under Notes: det trin målte k6, ikke systemet.

Linjerne med `db:a` og `db:b` er de samme tal for hver database for sig. De bruges til fault isolation.

Rækkefølgen i opsummeringen er alfabetisk (`rate_100` før `rate_50`), ikke i trin-rækkefølge.

Lige over opsummeringen skriver k6 CPU pr. trin, hentet fra Prometheus, fx `rate_150: API 0.42  Postgres 0.18`. Det er den travleste API-pod og den travleste Postgres-pod i gennemsnit over trinnets minut (0.25 = podens grænse på en kvart kerne). Skriv dem i CPU-kolonnerne. Det kræver, at port-forwarden fra trin 3 stadig kører, ellers crasher k6 til sidst.

## 7. Skift setup mellem scenarierne

yaml-filerne står som standard til demoen: 3 API-kopier, Redis til, 2 databaser. Hvert scenarie ændrer det her (se tabellen i `docs/metrics/test-description.md`):

| Hvad | Hvor | Ændring |
|---|---|---|
| Antal API-kopier | `k8s/api.yaml` | `replicas: 1` eller `3` |
| Redis til/fra | `k8s/api.yaml` | `CacheEnabled` `"true"` eller `"false"` |
| 1 eller 2 databaser | `k8s/db-credentials.yaml` | For 1 database: ret `Host` i `b` til `postgres-a-0.postgres-a` |

Send ændringerne til clusteret:
```
kubectl apply -k k8s
```

Skiftes kun `db-credentials.yaml`, genstarter API'en ikke af sig selv. Så kør også:
```
kubectl rollout restart deployment/api -n booking
```

Sæt yaml-filerne tilbage til demo-opsætningen, før I committer.

## 8. Nulstil mellem kørsler

Kun nødvendigt efter køb (`MODE=writes`), så gamle `sold`-tal ikke påvirker næste kørsel. Læsninger ændrer ikke data, så mellem to reads-kørsler kan du springe det over.

Tag dine Grafana-screenshots først: nulstillingen sletter også Prometheus' data og Grafanas dashboard.

```
kubectl delete -k k8s
```
```
minikube ssh -- sudo rm -rf /tmp/hostpath-provisioner/booking
```
```
kubectl apply -k k8s
```

- `delete -k` sletter pods og volumes, men Minikube beholder databasefilerne. `rm -rf` sletter dem, så `schema.yaml` kører igen og `sold` starter på 0.
- Port-forwards og tunnelen dør med pods'ene. Vent på `Running` og `1/1` (trin 2), start trin 3-5 igen, og brug den nye adresse fra trin 5. Importér dashboardet igen i Grafana (trin 4).
