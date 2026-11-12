Opdatér den lokale database (hvis schema.sql ændres). OBS: sletter alle data i tabellen:

```
docker exec -i booking-db psql -U postgres -d booking -c "DROP TABLE section;"
docker exec -i booking-db psql -U postgres -d booking < api/schema.sql
```

Opdatér imaget (hvis koden i api/ eller api/appsettings.json ændres):

```
dotnet publish api /t:PublishContainer --os linux --arch x64 -p:ContainerRegistry=docker.io -p:ContainerRepository=srenits/eventbooking-api
```