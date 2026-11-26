# Results

Raw numbers only: one section per run, one table row per load step. No interpretation here.

All runs are made on the same machine, so the rows can be compared:

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Each section is one k6 run; each table row is one load step in it. Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`) (see `test-description.md`). Add or delete step rows as needed. CPU: from the `CPU per step` lines k6 prints just above its summary (busiest API pod and busiest Postgres pod, 0.25 = its limit). Under **Notes**: the API image tag, any step that showed `dropped_iterations`, and anything unusual.

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

| Run        | p95 > 200 ms at (req/s) | errors > 1% at (req/s) |
|------------|-------------------------|------------------------|
| 1          | 250                     | > 350                  |
| 2          | 200                     | > 350                  |
| 3          | 200                     | > 350                  |
| Average    | 217                     | > 350                  |
| Max spread | ± 33 (run 1)            | - (not reached)        |

- Average: (250 + 200 + 200) / 3 = 216.7. Max spread: 250 - 216.7 = 33.3.
- No request failed in any of the 3 runs, so the error limit is above the last step, 350.

## 3. X-scaling the API (reads) - run 1

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

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

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 6. Fault isolation (writes) - run 1

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 db:a (ms) | Error rate db:a (%) | p95 db:b (ms) | Error rate db:b (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|---------------|---------------------|---------------|---------------------|-----------------|----------------------|
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |

## 7. Oversell check (writes) - run 1

- **Date:**
- **Rate:** ___ req/s for 1 minute
- **Notes:**

| Database | Capacity (each section) | Highest `sold` | sold <= capacity |
|----------|-------------------------|----------------|------------------|
| a        | 100                     |                | yes / no         |
| b        | 100                     |                | yes / no         |

- **k6 `refusals` (409 answers):**
