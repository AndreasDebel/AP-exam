Start api'en.

Kør projektet med 10 workere der læser i 10 sekunder:
```
dotnet run --project loadtest -- reads 10 10
```
Eksempel:
![loadtest-reads.png](Images/loadtest-reads.png)

Kør projektet med 10 workere der skriver i 10 sekunder:
```
dotnet run --project loadtest -- writes 10 10
```
Eksempel:
![loadtest-writes.png](Images/loadtest-writes.png)