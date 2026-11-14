Start systemet på Minikube (API'et og databasen postgres-a), kørt fra repo-roden:

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

Er der pushet et nyt API-image, så hent det ind i de kørende pods:

```
kubectl rollout restart deployment/api -n booking
```

Stop og slet alt, også databasen (næste `apply -k` starter med `sold = 0`):

```
kubectl delete -k k8s
```
