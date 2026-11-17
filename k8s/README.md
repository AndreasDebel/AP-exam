Start systemet på Minikube (API'et, databasen postgres-a og UI'et), kørt fra repo-roden:

```
minikube start
kubectl apply -k k8s
kubectl get pods -n booking
```

Vent til alle pods står som `Running`. API-imaget hentes fra Docker Hub (`srenits/eventbooking-api:latest`, se api/README.md).

Åbn en tunnel til API'et. Med Docker-driveren på Windows skal terminalen blive stående åben, og porten er ny hver gang:

```
minikube service api -n booking --url
```

Kald API'et fra en anden terminal (indsæt URL'en fra tunnelen):

```
U=http://127.0.0.1:PORT
curl $U/sections/1
curl -X POST $U/sections/1/buy -H "Content-Type: application/json" -d '{"count":2}'
curl $U/sections/1
```

`free` skal være faldet med 2. Se hvilke pods der har svaret:

```
kubectl logs -n booking -l app=api --prefix
```

X-skalering (#10): ændr antallet af API-kopier. Servicen fordeler selv trafikken på dem, og en ny kopi får først trafik, når dens `/health` svarer 200 (readinessProbe i `api.yaml`):

```
kubectl scale deployment/api -n booking --replicas=1
kubectl get pods -n booking -l app=api
```

`kubectl scale` holder kun til næste `apply -k`, hvor `replicas: 3` fra `api.yaml` gælder igen.

Er der pushet et nyt API-image, så hent det ind i de kørende pods:

```
kubectl rollout restart deployment/api -n booking
```

Åbn UI'et i browseren. Også her skal terminalen blive stående åben:

```
minikube service ui -n booking
```

UI'et kalder kun sin egen adresse; nginx i ui-pod'en sender `/sections/...` videre til API'et. UI-imaget hentes fra Docker Hub (`mortenj91/eventbooking-ui:latest`, se ui/README.md). Er der pushet et nyt, så:

```
kubectl rollout restart deployment/ui -n booking
```

Stop alt:

```
kubectl delete -k k8s
```

Det sletter **ikke** databasens data. Minikube gemmer hver volume i en mappe opkaldt efter PVC'en (`/tmp/hostpath-provisioner/booking/...`) og fjerner den aldrig, så næste `apply -k` får de gamle data igen, og schemaet køres ikke. `delete -k` fjerner Grafanas PVC, så eksportér dashboards først, hvis de skal gemmes separat. For at starte forfra med `sold = 0` skal mappen slettes mellem `delete -k` og `apply -k`:

```
minikube ssh -- sudo rm -rf /tmp/hostpath-provisioner/booking
```
