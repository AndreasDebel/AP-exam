# Results

Raw numbers only: one section per run, one table row per load step. No interpretation here.

All runs are made on the same machine, so the rows can be compared:

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Each section is one k6 run; each table row is one load step in it. Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`) (see `test-description.md`). Add or delete step rows as needed. CPU: from the `CPU per step` lines k6 prints just above its summary (busiest API pod and busiest Postgres pod, 0.25 = its limit). Under **Notes**: the API image tag, any step that showed `dropped_iterations`, and anything unusual.

## 1. Baseline (reads) - run 1

- **Date:** 2026-11-25, 11:36:33-11:49:41
- **Step size:** 50 req/s
- **Notes:**
  - Same run as I1 in `other-results.md` (full notes there).
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
  - Same run as I2 in `other-results.md` (full notes there).
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
  - Same run as I3 in `other-results.md` (full notes there).
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

## 2. Baseline (writes) - run 1

- **Date:** 2026-11-25, 16:06:08-16:19:09
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`. Runs 1-3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 162,291 requests, 11 failed (0.01%).
  - `dropped_iterations`: 13 at 150, 168 at 200, 709 at 250, 242 at 300, 529 at 350, 273 at 400, 455 at 450, 256 at 500.
  - p95 stays over 200 ms from 200.
  - p95 does not rise with the rate: 250, 350 and 450 are slow, 300, 400 and 500 faster. Same zigzag in all 3 runs, cause unknown.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 150          | 54.36    | 0.00           | 0.17            | 0.13                 |
| 200          | 800.94   | 0.00           | 0.20            | 0.25                 |
| 250          | 2810.00  | 0.07           | 0.17            | 0.25                 |
| 300          | 601.68   | 0.00           | 0.20            | 0.21                 |
| 350          | 1440.00  | 0.00           | 0.21            | 0.24                 |
| 400          | 513.84   | 0.00           | 0.22            | 0.23                 |
| 450          | 888.58   | 0.00           | 0.21            | 0.24                 |
| 500          | 456.91   | 0.00           | 0.21            | 0.21                 |

## 2. Baseline (writes) - run 2

- **Date:** 2026-11-25, 16:19:09-16:32:16
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`. Runs 1-3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 162,040 requests, 2 failed (0.00%).
  - `dropped_iterations`: 127 at 150, 347 at 200, 675 at 250, 207 at 300, 591 at 350, 203 at 400, 543 at 450, 290 at 500.
  - p95 is over 200 ms at every step, from 150 (the first step) on, so the limit is at or below 150.
  - p95 does not rise with the rate: 250, 350 and 450 are slow, 300, 400 and 500 faster. Same zigzag in all 3 runs, cause unknown.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 150          | 792.71   | 0.00           | 0.20            | 0.17                 |
| 200          | 1570.00  | 0.00           | 0.19            | 0.24                 |
| 250          | 2480.00  | 0.00           | 0.18            | 0.24                 |
| 300          | 576.31   | 0.00           | 0.19            | 0.23                 |
| 350          | 1580.00  | 0.00           | 0.20            | 0.23                 |
| 400          | 328.78   | 0.00           | 0.22            | 0.23                 |
| 450          | 1090.00  | 0.00           | 0.22            | 0.25                 |
| 500          | 462.68   | 0.00           | 0.23            | 0.25                 |

## 2. Baseline (writes) - run 3

- **Date:** 2026-11-25, 16:32:16-16:45:22
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`. Runs 1-3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 162,388 requests, 66 failed (0.04%).
  - `dropped_iterations`: 0 at 150, 99 at 200, 816 at 250, 148 at 300, 640 at 350, 115 at 400, 610 at 450, 203 at 500.
  - p95 is over 200 ms from 200, except 400 (165.70 ms), so by the rule it stays over from 450.
  - p95 does not rise with the rate: 250, 350 and 450 are slow, 300, 400 and 500 faster. Same zigzag in all 3 runs, cause unknown.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 150          | 31.84    | 0.00           | 0.20            | 0.13                 |
| 200          | 400.14   | 0.00           | 0.19            | 0.19                 |
| 250          | 3100.00  | 0.46           | 0.18            | 0.25                 |
| 300          | 411.77   | 0.00           | 0.21            | 0.20                 |
| 350          | 1630.00  | 0.00           | 0.19            | 0.23                 |
| 400          | 165.70   | 0.00           | 0.24            | 0.19                 |
| 450          | 1280.00  | 0.00           | 0.23            | 0.25                 |
| 500          | 283.95   | 0.00           | 0.22            | 0.25                 |

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
