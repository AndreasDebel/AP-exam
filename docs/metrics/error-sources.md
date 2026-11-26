# Error sources

Problems we ran into while setting up the load tests, and what we do about each. Each one can make p95 or the error rate measure the test setup instead of the system. The runs named here (A-X) are in `other-results/` (A-J in `sc1-other-results.md`, K-X in `sc2-other-results.md`); the design they led to is in `test-description.md`.

| #   | Error source                        | What we do now                                         | Status                     |
|-----|-------------------------------------|--------------------------------------------------------|----------------------------|
| 1   | k6 starting VUs during a step       | Start 20 VUs, let k6 add more up to 1000               | Accepted, still present    |
| 2   | Starting too many VUs at once       | Do not pre-allocate 1500 VUs                           | Avoided                    |
| 3   | CPU limit too high to reach a limit | 0.25 core per API copy and per Postgres                | Fixed                      |
| 4   | Old data in the database (writes)   | Reset `sold` and `VACUUM FULL` before every writes run | Suspected, disproved       |
| 5   | A cold system in the first step     | 1 unmeasured minute of warm-up before the first step   | Fixed                      |
| 6   | Too many requests in flight         | Proposed: `maxVUs` = the API's connection pool (30)    | Tested, not in `script.js` |
| 7   | Two stable states near the limit    | Read dropped iterations next to p95                    | Noise to expect            |
| 8   | The tunnel closing connections      | Fewer VUs = fewer connections                          | Seen in S, not solved      |
| 9   | Prometheus CPU over short windows   | Average CPU over at least 45 s                         | Seen in Q-X                |

## 1. k6 starting VUs during a step

A VU (virtual user: one k6 worker sending requests) can only send one request at a time. When requests get slow, k6 needs more VUs to keep up the rate. It starts them during the step, and while a new VU is starting, the requests it should have sent are skipped and counted as `dropped_iterations`.

- **Seen in:** almost every run. D: `vus_max` grew from 209 to 1000 and k6 dropped 123-552 iterations per step. Writes runs 1-3: up to 816 dropped per step.
- **Effect:** the system gets slightly less load than the step's rate, and starting VUs costs CPU on the same machine as the cluster.
- **What we do:** start 20 VUs, allow up to 1000, and write the dropped iterations per step in the notes for every run.

## 2. Starting too many VUs at once

Starting all VUs up front looks like the fix for 1, but it was worse.

- **Seen in:** H. With `preAllocatedVUs: 1500`, about 27% of all requests failed from the first second, in every step of all 3 runs. All failures were on the Minikube tunnel's local port (`actively refused`, `forcibly closed`): the tunnel could not take 1500 connections at once.
- **Effect:** the error rate measured the tunnel, not the API. p95 of the successful requests was only about 45 ms.
- **What we do:** went back to 20 / 1000 (see 1).

## 3. CPU limit too high to reach the system's limit

The test looks for the rate where p95 goes over 200 ms. If the pods get too much CPU, that rate is higher than one machine running k6 can send.

- **Seen in:** A-C. With 1 core each, no pod reached its limit even at 2200 req/s.
- **Effect:** the limit cannot be found, or the limit found is k6's or the tunnel's.
- **What we do:** 0.25 core per API copy and per Postgres (from D on). The limit for reads is now about 1750 req/s, and X- and Z-scaling add real cores instead of sharing the same ones.

## 4. Old data in the database (writes)

Every booking runs an `UPDATE` on a section's `sold` column. Postgres keeps the old copy of the row (a dead row version) until vacuum cleans it up, so we suspected that runs got slower as these built up.

- **Seen in:** N1 and N2 were slower than M, without a reset in between.
- **Disproved by:** O and writes run 1, on fresh databases, were just as slow as N1 and N2. M was the outlier.
- **What we do:** still reset before every writes run (`UPDATE ... sold=0` + `VACUUM FULL`, README step 6), so every run starts from the same state. It is not the cause of the slow writes, though.

## 5. A cold system in the first step

Freshly started pods are slow at first: .NET compiles code on first use (JIT) and the API opens new database connections.

- **Seen in:** D, applied a few minutes before the run; its slowest single request (1.68 s) was at the first step.
- **Effect:** the first step's p95 is inflated, so the limit can look lower than it is.
- **What we do:** 1 unmeasured minute at the first step's rate, then a 30 s pause, before the first measured step (in `script.js` from E on).

## 6. Too many requests in flight

With `maxVUs: 1000`, k6 keeps starting VUs whenever requests get slow, so a short slow moment turns into hundreds of requests waiting inside the API for one of its 30 database connections. Each buy holds a row lock on one of only 40 rows; with the API starved for CPU, transactions sit `idle in transaction` with the lock held, and the others queue behind them. The pile-up makes every request costlier, so the slowness feeds itself until a pause lets it drain. This is what made the writes steps zigzag.

- **Seen in:** Q (same rate in every step, still slow/fast/slow/fast), R and S (a jump in rate collapsed for 30-40 s, then ran stable at the same rate).
- **Effect:** p95 of 1-3 s and errors (`pool has been exhausted`) at a rate the system can carry; whether a step lands in the slow or the fast state looks like chance.
- **What we do:** tested, not yet in `script.js`: `preAllocatedVUs` = `maxVUs` = 30, the size of the API's connection pool. The waiting then happens in k6 and is counted as `dropped_iterations` instead of piling up inside the system (V, X). The staircase in X rose steadily without a zigzag. 100 VUs (T, U) helped less.
- **Price:** above the limit, p95 can no longer rise much (at most 30 requests wait at once), so the overload shows as dropped iterations and a lower achieved rate, not as p95.

## 7. Two stable states near the limit

Close to the limit, the same rate can run in a fast state (p50 5 ms) or a slow one (p50 90 ms), and the system can flip between them in the middle of a step without anything changing in the test.

- **Seen in:** V (step 1 fast, then slow from 10 s into step 2 for the rest of the run), U (slow throughout).
- **Ruled out as the trigger:** dead row versions (the table is 136 kB, updates are HOT) and waiting for the disk on commit (W, `synchronous_commit = off`, was no better). A Postgres checkpoint ran 6 s before V flipped, but Q's slow periods did not match the checkpoints.
- **What we do:** expect noise around the limit itself. A step counts as over the limit when p95 is over 200 ms *or* a clear share of the iterations is dropped.

## 8. The tunnel closing connections

`minikube service --url` carries all of k6's traffic. After some minutes with up to 1000 connections it began closing about 30% of them (`wsarecv: An existing connection was forcibly closed by the remote host`), while the API itself answered normally.

- **Seen in:** S (from about 3 minutes in), H (1500 VUs, see 2).
- **Effect:** the error rate measures the tunnel, not the system.
- **What we do:** keep the number of VUs low (see 6); with 30 VUs no tunnel errors were seen in V-X.

## 9. Prometheus CPU over short windows

cAdvisor updates its CPU counters only every 10-15 s, so `rate(...[20s])` often has too few samples and shows gaps or 0.

- **Seen in:** Q, when looking at CPU per 10 s.
- **What we do:** `script.js` already averages over each step's whole minute (`[1m]`). For finer detail, use a window of at least 45 s.
