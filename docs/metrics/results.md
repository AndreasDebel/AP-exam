# Results

Raw numbers only: one section per run, one table row per load step. No interpretation here.

All runs are made on the same machine, so the rows can be compared:

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Each section is one k6 run; each table row is one load step in it. Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`) (see `test-description.md`). Add or delete step rows as needed. CPU: from the `CPU per step` lines k6 prints just above its summary (busiest API pod and busiest Postgres pod, 0.25 = its limit). Under **Notes**: the API image tag, any step that showed `dropped_iterations`, and anything unusual.

Writes runs with 30 VUs (Scenarios 2, 4, 6 and 8) have two extra columns, because there p95 levels off below about 300 ms and the overload shows as requests k6 could not send instead (`test-description.md`, VUs):

- **Dropped:** k6's `dropped_iterations` for the step (the lines tagged `scenario:rate_<step>`).
- **Got through (req/s):** the throughput, requests answered per second: (step rate × 60 - dropped) / 60.

## 1. Baseline (reads) - run 1

- **Date:** 2026-11-25, 11:36:33-11:49:41
- **Step size:** 50 req/s
- **Notes:**
  - Same run as I1 in `other-results/sc1-other-results.md` (full notes there).
  - Screenshot: `images/1-baseline-reads/sc1-run1.png`.
  - Command: `k6 run -e MODE=reads -e START=1500 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`, `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`.
  - 882,412 requests, 0 failed. `db:a` and `db:b` within 1.5 ms of each other at every step.
  - `dropped_iterations`: 295 at 1500, 388 at 1550, 264 at 1600, 308 at 1650, 344 at 1700, 360 at 1750, 906 at 1800, 7,756 at 1850. `vus_max` reached 1000.
  - At 1850, k6 sent 103,244 requests in the step (about 1720 req/s, of 1850 planned).
  - p95 stays over 200 ms from 1800.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1500         | 80.39    | 0.00           | 0.24            | 0.24                 |
| 1550         | 100.80   | 0.00           | 0.25            | 0.25                 |
| 1600         | 86.08    | 0.00           | 0.21            | 0.25                 |
| 1650         | 87.51    | 0.00           | 0.25            | 0.25                 |
| 1700         | 92.28    | 0.00           | 0.24            | 0.25                 |
| 1750         | 139.77   | 0.00           | 0.21            | 0.25                 |
| 1800         | 353.90   | 0.00           | 0.23            | 0.25                 |
| 1850         | 741.75   | 0.00           | 0.22            | 0.25                 |

## 1. Baseline (reads) - run 2

- **Date:** 2026-11-25, 11:49:41-12:02:45
- **Step size:** 50 req/s
- **Notes:**
  - Same run as I2 in `other-results/sc1-other-results.md` (full notes there).
  - Screenshot: `images/1-baseline-reads/sc1-run2.png`.
  - Command: `k6 run -e MODE=reads -e START=1500 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`, `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`.
  - 878,230 requests, 0 failed. `db:a` and `db:b` within 2.5 ms of each other at every step.
  - `dropped_iterations`: 553 at 1500, 306 at 1550, 217 at 1600, 328 at 1650, 442 at 1700, 620 at 1750, 12,072 at 1800, 709 at 1850. `vus_max` reached 1000.
  - At 1800, k6 sent 95,928 requests in the step (about 1600 req/s, of 1800 planned).
  - p95 stays over 200 ms from 1750. It fell from 798 ms at 1800 to 252 ms at 1850.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1500         | 82.63    | 0.00           | 0.20            | 0.22                 |
| 1550         | 75.74    | 0.00           | 0.24            | 0.25                 |
| 1600         | 76.49    | 0.00           | 0.25            | 0.25                 |
| 1650         | 101.03   | 0.00           | 0.25            | 0.25                 |
| 1700         | 134.86   | 0.00           | 0.24            | 0.25                 |
| 1750         | 245.17   | 0.00           | 0.23            | 0.25                 |
| 1800         | 797.62   | 0.00           | 0.22            | 0.24                 |
| 1850         | 251.99   | 0.00           | 0.21            | 0.24                 |

## 1. Baseline (reads) - run 3

- **Date:** 2026-11-25, 12:02:45-12:15:47
- **Step size:** 50 req/s
- **Notes:**
  - Same run as I3 in `other-results/sc1-other-results.md` (full notes there).
  - Screenshot: `images/1-baseline-reads/sc1-run3.png`.
  - Command: `k6 run -e MODE=reads -e START=1500 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`, `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`.
  - 841,857 requests, 72 failed, all at 1750, in the step's first second (12:11:45): `connectex: No connection could be made because the target machine actively refused it` on the tunnel's local port. `db:a` and `db:b` within 1.5 ms of each other at every step.
  - `dropped_iterations`: 297 at 1500, 486 at 1550, 257 at 1600, 257 at 1650, 329 at 1700, 18,161 at 1750, 922 at 1800, 30,992 at 1850. `vus_max` reached 1000.
  - k6 sent about 1450 req/s at 1750 (86,840 requests) and about 1330 req/s at 1850 (80,009 requests).
  - p95 stays over 200 ms from 1750. It fell from 827 ms at 1750 to 414 ms at 1800.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1500         | 62.84    | 0.00           | 0.25            | 0.20                 |
| 1550         | 110.54   | 0.00           | 0.25            | 0.25                 |
| 1600         | 88.35    | 0.00           | 0.24            | 0.25                 |
| 1650         | 90.23    | 0.00           | 0.24            | 0.25                 |
| 1700         | 112.36   | 0.00           | 0.25            | 0.25                 |
| 1750         | 827.05   | 0.08           | 0.22            | 0.21                 |
| 1800         | 413.72   | 0.00           | 0.22            | 0.25                 |
| 1850         | 1010.00  | 0.00           | 0.21            | 0.21                 |

## 1. Baseline (reads) - limits of the 3 runs

Average and max spread as in `test-description.md` (Baseline cells). Rounded to whole req/s.

| Run        | p95 > 200 ms at (req/s) | errors > 1% at (req/s) |
|------------|-------------------------|------------------------|
| 1          | 1800                    | > 1850                 |
| 2          | 1750                    | > 1850                 |
| 3          | 1750                    | > 1850                 |
| Average    | 1767                    | > 1850                 |
| Max spread | ± 33 (run 1)            | - (not reached)        |

- Average: (1800 + 1750 + 1750) / 3 = 1766.7. Max spread: 1800 - 1766.7 = 33.3.
- Errors never went over 1% (highest: 0.08% at 1750 in run 3), so that limit is above the last step, 1850.

## 2. Baseline (writes) - run 1

- **Date:** 2026-11-26, 11:10:15-11:20:19
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=100 -e STEP=50 -e STEPS=6 -e BASE_URL=<url> LoadTest-k6/script.js`, with `preAllocatedVUs: 30` and `maxVUs: 30` in `script.js` (the API's connection pool size; see `error-sources.md`, 6). Runs 2-3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 66,732 requests, 0 failed.
  - Dropped: k6's `dropped_iterations` for the step. Got through: the step's requests / 60 s.
  - p95 is over 200 ms from 250.
  - 100 is slower than 150. Postgres CPU at 350 (0.15) is lower than at 300, although as many requests got through.
  - Same as run Y in `other-results/sc2-other-results.md`.
  - CPU from k6's `CPU per step` lines.
  - Screenshot: `images/2-baseline-writes/sc2-run1.png`.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 100          | 89.23    | 0.00           | 0       | 100                 | 0.23            | 0.15                 |
| 150          | 52.43    | 0.00           | 0       | 150                 | 0.21            | 0.15                 |
| 200          | 192.32   | 0.00           | 913     | 185                 | 0.21            | 0.19                 |
| 250          | 280.43   | 0.00           | 4,401   | 177                 | 0.24            | 0.24                 |
| 300          | 275.20   | 0.00           | 6,085   | 199                 | 0.22            | 0.24                 |
| 350          | 283.10   | 0.00           | 8,834   | 203                 | 0.18            | 0.15                 |

## 2. Baseline (writes) - run 2

- **Date:** 2026-11-26, 11:26:12-11:36:13
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=100 -e STEP=50 -e STEPS=6 -e BASE_URL=<url> LoadTest-k6/script.js`, with `preAllocatedVUs: 30` and `maxVUs: 30` in `script.js` (the API's connection pool size; see `error-sources.md`, 6). Runs 2-3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 67,054 requests, 0 failed.
  - Dropped: k6's `dropped_iterations` for the step. Got through: the step's requests / 60 s.
  - p95 is over 200 ms from 200.
  - CPU from k6's `CPU per step` lines.
  - Screenshot: `images/2-baseline-writes/sc2-run2.png`.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 100          | 17.18    | 0.00           | 0       | 100                 | 0.16            | 0.11                 |
| 150          | 34.53    | 0.00           | 9       | 150                 | 0.19            | 0.12                 |
| 200          | 220.22   | 0.00           | 1,355   | 177                 | 0.21            | 0.21                 |
| 250          | 259.29   | 0.00           | 3,311   | 195                 | 0.17            | 0.22                 |
| 300          | 278.78   | 0.00           | 6,042   | 199                 | 0.21            | 0.20                 |
| 350          | 289.12   | 0.00           | 9,197   | 197                 | 0.16            | 0.25                 |

## 2. Baseline (writes) - run 3

- **Date:** 2026-11-26, 11:36:13-11:46:14
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=100 -e STEP=50 -e STEPS=6 -e BASE_URL=<url> LoadTest-k6/script.js`, with `preAllocatedVUs: 30` and `maxVUs: 30` in `script.js` (the API's connection pool size; see `error-sources.md`, 6). Runs 2-3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 65,540 requests, 0 failed.
  - Dropped: k6's `dropped_iterations` for the step. Got through: the step's requests / 60 s.
  - p95 is over 200 ms from 200.
  - CPU from k6's `CPU per step` lines.
  - Screenshot: `images/2-baseline-writes/sc2-run3.png`.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 100          | 21.41    | 0.00           | 0       | 100                 | 0.16            | 0.10                 |
| 150          | 91.33    | 0.00           | 130     | 148                 | 0.20            | 0.14                 |
| 200          | 262.37   | 0.00           | 1,688   | 172                 | 0.21            | 0.21                 |
| 250          | 264.59   | 0.00           | 3,099   | 198                 | 0.18            | 0.22                 |
| 300          | 291.58   | 0.00           | 6,905   | 185                 | 0.20            | 0.20                 |
| 350          | 297.07   | 0.00           | 9,653   | 189                 | 0.20            | 0.25                 |

## 2. Baseline (writes) - limits of the 3 runs

Average and max spread as in `test-description.md` (Baseline cells). Rounded to whole req/s.

| Run        | p95 > 200 ms at (req/s) | errors > 1% at (req/s) | Max got through (req/s) |
|------------|-------------------------|------------------------|-------------------------|
| 1          | 250                     | > 350                  | 203                     |
| 2          | 200                     | > 350                  | 199                     |
| 3          | 200                     | > 350                  | 198                     |
| Average    | 217                     | > 350                  | 200                     |
| Max spread | ± 33 (run 1)            | - (not reached)        | ± 3 (run 1)             |

- Average: (250 + 200 + 200) / 3 = 216.7. Max spread: 250 - 216.7 = 33.3.
- Max got through: the highest Got through in the run. Average: (203 + 199 + 198) / 3 = 200.0. Max spread: 203 - 200.0 = 3.0.
- No request failed in any of the 3 runs, so the error limit is above the last step, 350.

## 3. X-scaling the API (reads) - run 1

- **Date:** 2026-11-26, 13:54:01-14:07:03
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=reads -e START=1500 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`, `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`, as in Scenario 1.
  - Setup: 3 API (`replicas: 3`), 1 Postgres (`b`'s `Host` in `db-credentials.yaml` = `postgres-a-0.postgres-a`, so every section uses database a), Redis off (`CacheEnabled` = `false`).
  - 873,635 requests, 106 failed (0.01%). All 106 at 14:00:01, the start of the 1650 step: `connection refused` on the tunnel port (`127.0.0.1:62897`), so they never reached the cluster.
  - `db:a` and `db:b` within 4 ms of each other at every step.
  - `dropped_iterations`: 180 at 1500, 430 at 1550, 494 at 1600, 278 at 1650, 365 at 1700, 632 at 1750, 611 at 1800, 14,830 at 1850. `vus_max` reached 1000 (in the warm-up and at 1850).
  - p95 over 200 ms at 1550 and 1600, under it at 1650 and 1700, over it again from 1750.
  - CPU from k6's `CPU per step` lines. CPU API is the busiest of the 3 API pods.
  - Screenshot: `images/3-x-scaling-api/sc3.png`.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1500         | 85.27    | 0.00           | 0.20            | 0.25                 |
| 1550         | 214.51   | 0.00           | 0.20            | 0.25                 |
| 1600         | 225.60   | 0.00           | 0.18            | 0.25                 |
| 1650         | 151.88   | 0.10           | 0.19            | 0.20                 |
| 1700         | 179.12   | 0.00           | 0.24            | 0.22                 |
| 1750         | 216.84   | 0.00           | 0.18            | 0.25                 |
| 1800         | 239.19   | 0.00           | 0.17            | 0.25                 |
| 1850         | 816.38   | 0.00           | 0.18            | 0.25                 |

## 4. Z-scaling the DB (writes) - run 1

- **Date:** 2026-11-26, 12:30:57-12:44:01
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`, with `preAllocatedVUs: 30` and `maxVUs: 30` in `script.js`, as in Scenario 2.
  - Setup: 1 API, 2 Postgres (`b`'s `Host` = `postgres-b-0.postgres-b`), Redis off. Both databases reset before the run (README step 6), `sold` = 0.
  - 133,183 requests, 0 failed.
  - Dropped: k6's `dropped_iterations` for the step. Got through: (step rate × 60 - dropped) / 60.
  - **Throughput** (the "Got through" column, requests answered per second): equal to the step rate up to 150, then 198 at 200, 289 at 350 and 288 at 400. Highest: 330 at 450, then 309 at 500. Scenario 2's highest was 203 (run 1), 199 (run 2), 198 (run 3).
  - k6's whole-run `http_reqs`: 133,183 requests, 170.7 req/s (averaged over the warm-up and the pauses too, so lower than any step).
  - p95 is never over 200 ms (`> 500`); highest 179.83 ms at 500. Dropped iterations from 200.
  - CPU API at 0.25 (its limit) in 300, 400, 450 and 500. CPU Postgres at most 0.21.
  - Preliminary runs Z1 and Z2 (150-400) are in `other-results/sc4-other-results.md`.
  - CPU from k6's `CPU per step` lines. CPU Postgres is the busiest of the two Postgres pods.
  - Screenshot: `images/4-z-scaling-db/sc4.png`.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 150          | 40.77    | 0.00           | 0       | 150                 | 0.21            | 0.08                 |
| 200          | 101.80   | 0.00           | 106     | 198                 | 0.24            | 0.15                 |
| 250          | 129.04   | 0.00           | 652     | 239                 | 0.24            | 0.17                 |
| 300          | 162.98   | 0.00           | 1,913   | 268                 | 0.25            | 0.21                 |
| 350          | 167.54   | 0.00           | 3,663   | 289                 | 0.21            | 0.21                 |
| 400          | 173.57   | 0.00           | 6,736   | 288                 | 0.25            | 0.21                 |
| 450          | 162.69   | 0.00           | 7,217   | 330                 | 0.25            | 0.21                 |
| 500          | 179.83   | 0.00           | 11,470  | 309                 | 0.25            | 0.21                 |

## 5. Redis cache (reads) - run 1

- **Date:** 2026-11-26, 14:18:11-14:28:12
- **Step size:** 500 req/s
- **Notes:**
  - Command: `k6 run -e MODE=reads -e START=1500 -e STEP=500 -e STEPS=6 -e BASE_URL=<url> LoadTest-k6/script.js`, `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`, as in Scenario 1.
  - Setup: 1 API (`replicas: 1`), 1 Postgres (`b`'s `Host` in `db-credentials.yaml` = `postgres-a-0.postgres-a`), Redis on (`CacheEnabled` = `"true"` in `k8s/api.yaml`, 2 s TTL in `api/Program.cs`).
  - Step size 500 instead of Scenario 1's 50: a coarse run to find where p95 rises; it is used as the result.
  - 1,070,102 requests, 861 failed (0.08%). All 861 are `connection refused` on the tunnel port (`127.0.0.1:62897`), in bursts at 14:22:41-42 (start of 2500), 14:24:11 (start of 3000), 14:25:41-42 (start of 3500) and 14:26:30.
  - p95 never over 200 ms (`> 4000`); highest 50.91 ms at 3500. Errors never over 1% (`> 4000`).
  - `dropped_iterations`: 278 at 1500, 272 at 2000, 714 at 2500, 499 at 3000, 752 at 3500, 6,267 at 4000. `vus_max` reached 1000 (at 4000).
  - Whole run: `http_req_duration` avg 21.78 ms, median 12.96 ms, max 2.13 s.
  - A second coarse run, 4000-8000 with `maxVUs: 3000`, is in `other-results/sc5-other-results.md`.
  - CPU from k6's `CPU per step` lines.
  - Screenshot: `images/5-redis-cache/sc5.png`.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1500         | 27.45    | 0.00           | 0.21            | 0.01                 |
| 2000         | 46.26    | 0.00           | 0.24            | 0.01                 |
| 2500         | 45.99    | 0.06           | 0.25            | 0.01                 |
| 3000         | 31.96    | 0.03           | 0.20            | 0.01                 |
| 3500         | 50.91    | 0.33           | 0.25            | 0.01                 |
| 4000         | 49.59    | 0.00           | 0.25            | 0.02                 |

## 6. Fault isolation (writes) - run 1

- **Date:** 2026-11-26, 13:20:50-13:33:51
- **Step size:** 50 req/s
- **Notes:**
  - Setup: 8's (3 API · 2 Postgres · Redis off), `postgres-b` stopped with `kubectl scale statefulset postgres-b -n booking --replicas=0` after resetting both databases.
  - Command: `k6 run -e MODE=writes -e SPLIT=yes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`. Each step: half the rate to sections 101-120 (db:a), half to 121-140 (db:b), 15 VUs each (`test-description.md`, 6).
  - db:a and db:b columns come from k6's `scenario:rate_<n>_a` and `rate_<n>_b` lines. Dropped and Got through are for db:a only, so Got through is at most half the step.
  - Dropped db:b: 0 in every step except 500 (14).
  - How db:b failed: HTTP 500, a fast error. A test buy to section 121 before the run: 500 in 30 ms.
  - k6's totals for the whole run: 164,987 requests, 50.02 % failed (82,535; all db:b).
  - `sold` in database a after the run: 82,436 (db:a buys in the steps: 77,980; the rest from the warm-up).
  - CPU API reached 0.25 (its limit) at 500.
  - Screenshot: `images/6-fault-isolation/sc6.png`.

| Step (req/s) | p95 db:a (ms) | Error rate db:a (%) | p95 db:b (ms) | Error rate db:b (%) | Dropped db:a | Got through db:a (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|---------------|---------------------|---------------|---------------------|--------------|--------------------------|-----------------|----------------------|
| 150          | 16.30         | 0.00                | 16.32         | 100.00              | 0            | 75                       | 0.14            | 0.11                 |
| 200          | 12.26         | 0.00                | 12.21         | 100.00              | 0            | 100                      | 0.15            | 0.11                 |
| 250          | 16.56         | 0.00                | 9.97          | 100.00              | 6            | 125                      | 0.17            | 0.10                 |
| 300          | 16.12         | 0.00                | 8.42          | 100.00              | 0            | 150                      | 0.16            | 0.12                 |
| 350          | 12.17         | 0.00                | 7.40          | 100.00              | 0            | 175                      | 0.22            | 0.12                 |
| 400          | 11.32         | 0.00                | 11.05         | 100.00              | 0            | 200                      | 0.22            | 0.13                 |
| 450          | 14.44         | 0.00                | 10.56         | 100.00              | 2            | 225                      | 0.23            | 0.12                 |
| 500          | 41.87         | 0.00                | 45.84         | 100.00              | 15           | 250                      | 0.25            | 0.17                 |

## 7. Oversell check (writes) - run 1

- **Date:** 2026-11-26, 13:41:01-13:43:38
- **Rate:** 300 req/s for 1 minute, after 1 minute of warm-up at 300 req/s (the warm-up buys too)
- **Notes:**
  - Setup: 8's (3 API · 2 Postgres · Redis off), not 4's: with 3 API copies, buys race across separate processes (`test-description.md`, 7).
  - Before the run, in both databases: `UPDATE section SET sold=0, capacity=100 WHERE id BETWEEN 101 AND 140;` + `VACUUM FULL section;`. Afterwards capacity set back to 1,000,000 and `sold` to 0.
  - Command: `k6 run -e MODE=writes -e START=300 -e STEP=0 -e STEPS=1 -e BASE_URL=<url> LoadTest-k6/script.js`.
  - 40 sections × 100 = 4,000 places. `sum(sold)` after the run: 2,000 in database a, 2,000 in database b.
  - k6's totals: 35,775 requests (35,773 buys + 2 Prometheus queries from `teardown()`), 0 failed, 31,773 refusals. 35,773 - 31,773 = 4,000 buys answered 200.
  - Dropped: 0 in the step, 227 in the warm-up. p95 5.59 ms in the step. CPU API 0.13, CPU Postgres 0.07.
  - Screenshot: `images/7-oversell-check/sc7.png`.

| Database | Capacity (each section) | Highest `sold` | sold <= capacity |
|----------|-------------------------|----------------|------------------|
| a        | 100                     | 100            | yes              |
| b        | 100                     | 100            | yes              |

- **k6 `refusals` (409 answers):** 31,773

## 8. X+Z scaling (writes) - run 1

- **Date:** 2026-11-26, 15:48:52-16:01:52
- **Step size:** 100 req/s
- **Grafana time ranges:** warm-up 15:48:52-15:49:52, 500 15:50:22-15:51:22, 600 15:51:52-15:52:52, 700 15:53:22-15:54:22, 800 15:54:52-15:55:52, 900 15:56:22-15:57:22, 1000 15:57:52-15:58:52, 1100 15:59:22-16:00:22, 1200 16:00:52-16:01:52.
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=500 -e STEP=100 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`, with `preAllocatedVUs: 30` and `maxVUs: 30` in `script.js`, as in Scenario 4.
  - Setup: as Scenario 4, but `replicas: 3` in `k8s/api.yaml`. Both databases reset before the run (`LoadTest-k6/README.md`), `sold` = 0.
  - `START=500` and step 100 instead of Scenario 4's 150 and 50: a first run at 150-500 (`other-results/sc8-other-results.md`, R2) and a coarse run at 500-1750 (R1) came first.
  - 300,731 requests, 0 failed.
  - Dropped: k6's `dropped_iterations` for the step. Got through: (step rate × 60 - dropped) / 60. Grafana's panel "Requests/sec got through" showed 800 at the end of the 800 step.
  - k6 warned `Insufficient VUs, reached 30 active VUs` in the warm-up and at 500, 700, 800, 900, 1000, 1100 and 1200.
  - **Throughput:** highest 799 at 800. Scenario 4's highest was 330.
  - p95 is over 200 ms only at 1000 (268.34), not in the steps after (`> 1200`).
  - p95 per database (`db:a` / `db:b`): 900 100.97 / 167.86, 1000 274.33 / 259.90, 1100 185.97 / 120.41, 1200 196.21 / 199.06.
  - CPU from k6's `CPU per step` lines (busiest of the 3 API pods, busiest of the 2 Postgres pods).
  - Screenshot: `images/8-x-z-scaling/sc8-500-1200.png`.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 500          | 12.43    | 0.00           | 42      | 499                 | 0.21            | 0.15                 |
| 600          | 17.80    | 0.00           | 0       | 600                 | 0.23            | 0.16                 |
| 700          | 29.73    | 0.00           | 2,065   | 666                 | 0.24            | 0.19                 |
| 800          | 21.24    | 0.00           | 81      | 799                 | 0.25            | 0.22                 |
| 900          | 139.50   | 0.00           | 19,851  | 569                 | 0.24            | 0.24                 |
| 1000         | 268.34   | 0.00           | 35,953  | 401                 | 0.21            | 0.22                 |
| 1100         | 172.76   | 0.00           | 34,298  | 528                 | 0.23            | 0.24                 |
| 1200         | 197.44   | 0.00           | 44,257  | 462                 | 0.22            | 0.24                 |

## 9. X-scaling + Redis (reads) - run 1

- **Date:** 2026-11-26, 14:52:25-15:03:57
- **Step size:** 1000 req/s
- **Notes:**
  - Command: `k6 run -e MODE=reads -e START=2000 -e STEP=1000 -e STEPS=7 -e BASE_URL=<url> LoadTest-k6/script.js`, `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`, as in Scenario 1 and 5.
  - Setup: 3 API (`replicas: 3`), 1 Postgres (`b`'s `Host` in `db-credentials.yaml` = `postgres-a-0.postgres-a`), Redis on (`CacheEnabled` = `"true"`, 2 s TTL). Scenario 5's setup plus 2 API copies.
  - Step size 1000: a coarse run, used as the result.
  - Grafana time ranges: warm-up 14:52:25-14:53:25, 2000 14:53:55-14:54:55, 3000 14:55:25-14:56:25, 4000 14:56:55-14:57:55, 5000 14:58:25-14:59:25, 6000 14:59:55-15:00:55, 7000 15:01:25-15:02:25, 8000 15:02:55-15:03:55.
  - 2,212,557 requests, 1,335 failed (0.06%). All 1,335 are `connection refused` on the tunnel port (`127.0.0.1:62897`): 365 at 14:58 and 970 at 14:59.
  - p95 never over 200 ms (`> 8000`); highest 27.83 ms at 8000. Errors never over 1% (`> 8000`).
  - `dropped_iterations`: 183 at 2000, 302 at 3000, 495 at 4000, 1,114 at 5000, 1,192 at 6000, 1,594 at 7000, 2,030 at 8000. `vus_max` reached 1000.
  - Whole run: `http_req_duration` avg 14.77 ms, median 14.65 ms, max 1.73 s.
  - 0 API pod restarts after the run.
  - CPU from k6's `CPU per step` lines. CPU API is the busiest of the 3 API pods.
  - Screenshot: `images/9-x-scaling-redis/sc9.png`.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 2000         | 8.80     | 0.00           | 0.20            | 0.01                 |
| 3000         | 15.41    | 0.00           | 0.24            | 0.01                 |
| 4000         | 18.60    | 0.00           | 0.22            | 0.02                 |
| 5000         | 19.27    | 0.12           | 0.20            | 0.01                 |
| 6000         | 23.10    | 0.27           | 0.20            | 0.01                 |
| 7000         | 26.50    | 0.00           | 0.22            | 0.01                 |
| 8000         | 27.83    | 0.00           | 0.22            | 0.01                 |
