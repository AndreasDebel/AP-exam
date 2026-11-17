## Kill switch (#12, Design to Be Disabled)

Hver sektion har kolonnen `disabled` i sin database. `/buy` læser den under samme rækkelås som `sold`, så en slukket sektion afviser det næste køb med `503 "section disabled"`. De andre sektioner sælger videre.

Åbn en tunnel til API'et. Terminalen skal blive stående åben:

```
minikube service api -n booking --url
```

I en anden terminal: gem URL'en fra tunnelen:

```
U=http://127.0.0.1:PORT
```

Sluk sektion 1. `UPDATE` skal køres i den database, routeren peger på (sektion 1-2 i `postgres-a`, 3-4 i `postgres-b`, se `api.yaml`):

```
kubectl exec -n booking postgres-a-0 -- psql -U postgres -d booking -c "UPDATE section SET disabled = true WHERE id = 1;"
```

Prøv at købe i sektion 1, i sektion 2 (samme database) og i sektion 3 (den anden database):

```
curl -i -X POST $U/sections/1/buy -H "Content-Type: application/json" -d '{"count":1}'
curl -i -X POST $U/sections/2/buy -H "Content-Type: application/json" -d '{"count":1}'
curl -i -X POST $U/sections/3/buy -H "Content-Type: application/json" -d '{"count":1}'
```

Sektion 1 skal svare `503 Service Unavailable` og `"section disabled"`. Sektion 2 og 3 skal svare `200 OK`. At sektion 2 stadig sælger viser, at kill switchen virker pr. sektion, ikke pr. database.

Tænd sektion 1 igen:

```
kubectl exec -n booking postgres-a-0 -- psql -U postgres -d booking -c "UPDATE section SET disabled = false WHERE id = 1;"
curl -i -X POST $U/sections/1/buy -H "Content-Type: application/json" -d '{"count":1}'
```

Nu svarer sektion 1 `200 OK`, eller `409` med "only 0 places left", hvis alle pladser er solgt.
