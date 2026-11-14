Start UI'et lokalt (kræver at API'et kører på http://localhost:5133, se api/README.md):

```
dotnet run --project ui --launch-profile http
```

Åbn http://localhost:5286.

API'ets adresse står i `ui/wwwroot/appsettings.Development.json` (lokalt) og `ui/wwwroot/appsettings.json` (i clusteret: `/`, nginx sender videre til API'et, se `ui/nginx.conf`).

Byg og push imaget (hvis koden i ui/ ændres), kørt fra repo-roden:

```
docker build -t mortenj91/eventbooking-ui ui
docker push mortenj91/eventbooking-ui
```

Kør det på Minikube: se k8s/README.md.
