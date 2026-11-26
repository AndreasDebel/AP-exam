# Other results: Scenario 1, Baseline (reads)

Raw numbers only, for runs that are not one of the scenario runs in `../results.md`: probes to find a sensible `START`/`STEP`, checks of the setup, and anything else tried along the way. Same table as `results.md`, so the numbers can be compared. No interpretation here, and these numbers do not go into `test-scenarios.svg`.

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`). Use k6's p95, not Grafana's: Grafana estimates it from Prometheus' buckets (see `../test-description.md`). CPU: from the `CPU per step` lines k6 prints just above its summary (0.25 = its limit; 1.0 in runs A-C). Grafana screenshots go in `../other-images/`. Under **Notes**: the setup, the k6 command, the API image tag, any step that showed `dropped_iterations`, and anything unusual.

## A. First try at Scenario 1's setup (reads, 50-400)

- **Purpose:** find the limit: the first load step where p95 goes over 200 ms (see `test-description.md`).
- **Date:** 2026-11-24, about 15:05-15:17
- **Setup:** Scenario 1 (1 API · 1 Postgres · Redis off): `replicas: 1`, `CacheEnabled "false"`, `b` in `db-credentials.yaml` pointing at `postgres-a`. CPU limits: 1 core for the API and each Postgres (before the change to 0.25)
- **Command:** `k6 run -e MODE=reads -e START=50 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Screenshots:** `other-images/1-sc1.png`, `other-images/1-sc1-latency.png`
- **Notes:**
  - 107,994 requests in total, 0 failed. `db:a` and `db:b` within 0.5 ms of each other at every step (both go to `postgres-a`).
  - `dropped_iterations`: 4 at 350, 7 at 400. All other steps 0.
  - p95 went down as the load went up: 25.0 ms at 50 to 4.7 ms at 400.
  - Grafana's "Read latency (p95)" showed a flat ~4.75 ms all run.
  - CPU per pod not recorded.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 50           | 25.01    | 0.00           |                 |                      |
| 100          | 14.34    | 0.00           |                 |                      |
| 150          | 10.52    | 0.00           |                 |                      |
| 200          | 8.64     | 0.00           |                 |                      |
| 250          | 6.78     | 0.00           |                 |                      |
| 300          | 6.10     | 0.00           |                 |                      |
| 350          | 5.42     | 0.00           |                 |                      |
| 400          | 4.68     | 0.00           |        0.321    |        0.116         |

## B. Scenario 1's setup at higher load (reads, 400-1000)

- **Purpose:** find the limit: the first load step where p95 goes over 200 ms (see `test-description.md`).
- **Date:** 2026-11-24, about 15:41-15:47
- **Setup:** same as A
- **Command:** `k6 run -e MODE=reads -e START=400 -e STEP=200 -e STEPS=4 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 200 req/s
- **Screenshots:** `other-images/2-sc1.png`, `other-images/2-sc1-latency.png`
- **Notes:**
  - 167,622 requests in total, 0 failed. `db:a` and `db:b` within 0.2 ms of each other at every step.
  - `dropped_iterations`: 20 at 400, 75 at 600, 143 at 800, 151 at 1000.
  - `vus_max` grew to 178 (k6 started 20).
  - Prometheus showed the API receiving the full rate in every step (about 400, 600, 800 and 1000 req/s).
  - CPU: one-minute average ending at each step's end, queried from Prometheus after the run.
  - Slowest single request: 178 ms (at 1000).

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 400          | 4.78     | 0.00           | 0.41            | 0.13                 |
| 600          | 4.22     | 0.00           | 0.40            | 0.15                 |
| 800          | 6.91     | 0.00           | 0.43            | 0.18                 |
| 1000         | 31.82    | 0.00           | 0.44            | 0.30                 |

## C. Scenario 1's setup at even higher load (reads, 1300-2200)

- **Purpose:** find the limit: the first load step where p95 goes over 200 ms (see `test-description.md`).
- **Date:** 2026-11-24, about 15:55-16:01
- **Setup:** same as A
- **Command:** `k6 run -e MODE=reads -e START=1300 -e STEP=300 -e STEPS=4 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 300 req/s
- **Screenshots:** `other-images/3-sc1.png`, `other-images/3-sc1-latency.png`
- **Notes:**
  - 417,683 requests in total, 0 failed. `db:a` and `db:b` within 0.4 ms of each other at every step.
  - `dropped_iterations`: 277 at 1300, 587 at 1600, 513 at 1900, 950 at 2200.
  - `vus_max` grew to 639.
  - Prometheus showed the API receiving the full rate in every step (about 1300, 1600, 1900 and 2200 req/s).
  - CPU: one-minute average ending at each step's end, queried from Prometheus after the run.
  - Grafana's "CPU per pod" panel (still with the `[30s]` window) had gaps in the API line during this run.
  - Slowest single request: 294 ms (at 2200).

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1300         | 6.78     | 0.00           | 0.64            | 0.29                 |
| 1600         | 15.34    | 0.00           | 0.74            | 0.39                 |
| 1900         | 13.67    | 0.00           | 0.78            | 0.48                 |
| 2200         | 24.15    | 0.00           | 0.63            | 0.52                 |

## D. Scenario 1's setup with 0.25 CPU (reads, 400-1000)

- **Purpose:** find the limit: the first load step where p95 goes over 200 ms (see `test-description.md`).
- **Date:** 2026-11-24, about 16:24:52-16:30:52
- **Setup:** as A, but CPU limits 0.25 core for the API and each Postgres (commit `ce47877`). Applied with `kubectl apply -k k8s` a few minutes before the run, so the API and Postgres pods were freshly started.
- **Command:** `k6 run -e MODE=reads -e START=400 -e STEP=200 -e STEPS=4 -e BASE_URL=<url> LoadTest-k6/script.js` (same steps as B)
- **Step size:** 200 req/s
- **Screenshots:** `other-images/4-sc1-0.25cpu.png`, `other-images/4-sc1-0.25cpu-latency.png`
- **Notes:**
  - 166,648 requests in total, 0 failed. `db:a` and `db:b` within 8 ms of each other at every step.
  - `dropped_iterations`: 310 at 400, 123 at 600, 377 at 800, 552 at 1000.
  - `vus_max` reached 1000 (k6 started 209).
  - Prometheus showed the API receiving the full rate in every step (about 400, 600, 800 and 1000 req/s).
  - CPU: not copied from k6's output. Queried from Prometheus after the run with the same query and step-end times as `script.js`.
  - Slowest single request: 1.68 s (at 400).
  - Grafana's "Requests/sec per API pod" also listed the removed pod `api-6bcc9654fb-mdv8g` (from before the apply) with 0 req/s.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 400          | 306.83   | 0.00           | 0.20            | 0.16                 |
| 600          | 97.17    | 0.00           | 0.24            | 0.17                 |
| 800          | 152.17   | 0.00           | 0.21            | 0.22                 |
| 1000         | 87.68    | 0.00           | 0.23            | 0.20                 |

## E. Scenario 1's setup with 0.25 CPU, one step at 2000 (reads)

- **Purpose:** see how the setup reacts far above D's highest step, to understand why D's p95 did not rise steadily.
- **Date:** 2026-11-24, about 21:39:38-21:42:10
- **Setup:** same as D. The pods had been running for about 5 hours (not freshly started). First run with the warm-up in `script.js`.
- **Command:** `k6 run -e MODE=reads -e START=2000 -e STEP=0 -e STEPS=1 -e BASE_URL=<url> LoadTest-k6/script.js` (1 min warm-up at 2000, 30 s pause, 1 min at 2000)
- **Step size:** one step only
- **Screenshots:** none
- **Notes:**
  - Step: 87,612 requests, 0 failed. `db:a` and `db:b` within 0.2 ms of each other.
  - `dropped_iterations`: 32,389 in the step (of about 120,000 planned), 25,527 in the warm-up.
  - `vus_max` reached 1000 in the first second of the warm-up and stayed at the cap.
  - Prometheus showed the API receiving about 1440 req/s in the step, not 2000.
  - 167 failed requests, all in the warm-up: `connectex: No connection could be made because the target machine actively refused it` on the tunnel's local port.
  - CPU from k6's `CPU per step` line.
  - Slowest single request: 1.41 s. Median 639 ms.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 2000         | 947.41   | 0.00           | 0.18            | 0.25                 |

## F. Scenario 1's setup with 0.25 CPU, narrowing down (reads, 1100-1900)

- **Purpose:** find the limit: the first load step where p95 goes over 200 ms (see `test-description.md`). Narrows down the range between D's highest step (1000) and E (2000).
- **Date:** 2026-11-24, about 22:36:52-22:51:24
- **Setup:** same as D. The pods had been running for about 6 hours (not freshly started). Warm-up in `script.js` at 1100.
- **Command:** `k6 run -e MODE=reads -e START=1100 -e STEP=100 -e STEPS=9 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 100 req/s
- **Screenshots:** none
- **Notes:**
  - 834,820 requests in total (warm-up included), 0 failed. `db:a` and `db:b` within 2 ms of each other at steps 1100-1800, 30 ms at 1900.
  - `dropped_iterations`: 214 at 1100, 676 at 1200, 522 at 1300, 213 at 1400, 318 at 1500, 378 at 1600, 414 at 1700, 1097 at 1800, 36,997 at 1900.
  - `vus_max` reached 1000.
  - At 1900, k6 sent 77,003 requests in the step (about 1280 req/s, of 1900 planned).
  - CPU from k6's `CPU per step` lines.
  - Median latency: 13 ms at 1100, 68 ms at 1700, 326 ms at 1800, 718 ms at 1900.
  - Slowest single request: 1.78 s (at 1900).

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1100         | 59.76    | 0.00           | 0.25            | 0.21                 |
| 1200         | 71.31    | 0.00           | 0.25            | 0.23                 |
| 1300         | 60.63    | 0.00           | 0.25            | 0.21                 |
| 1400         | 66.36    | 0.00           | 0.25            | 0.25                 |
| 1500         | 76.27    | 0.00           | 0.25            | 0.25                 |
| 1600         | 103.25   | 0.00           | 0.25            | 0.25                 |
| 1700         | 152.49   | 0.00           | 0.24            | 0.25                 |
| 1800         | 475.93   | 0.00           | 0.24            | 0.25                 |
| 1900         | 1060.00  | 0.00           | 0.21            | 0.25                 |

## G. Scenario 1's setup with 0.25 CPU, 25 req/s steps (reads, 1600-1775)

- **Purpose:** find the limit at a 25 req/s step size, in the range where F crossed 200 ms (between 1700 and 1800).
- **Used as:** `1. Baseline (reads) - run 1` in `results.md` until it was replaced by I1-I3 (step size 50 instead of 25). J1 and J2 are the other two runs at 25 req/s.
- **Date:** 2026-11-25, about 09:33:50-09:46:52
- **Setup:** same as D, on a fresh Minikube (`minikube delete` + `start`). The pods had been running for about 9 minutes when the run started. Warm-up in `script.js` at 1600.
- **Command:** `k6 run -e MODE=reads -e START=1600 -e STEP=25 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 25 req/s
- **Screenshots:** `other-images/5-sc1-0.25cpu-full.png` (covers about 09:40-09:47, the last 4-5 steps)
- **Notes:**
  - 871,164 requests in total (warm-up included), 365 failed, all in the warm-up: `connectex: No connection could be made because the target machine actively refused it` on the tunnel's local port. 0 failed in the steps. `db:a` and `db:b` within 2 ms of each other at every step.
  - `dropped_iterations`: 219 at 1600, 349 at 1625, 252 at 1650, 264 at 1675, 555 at 1700, 603 at 1725, 1050 at 1750, 20,996 at 1775.
  - `vus_max` reached 1000.
  - At 1775, k6 sent 85,505 requests in the step (about 1425 req/s, of 1775 planned).
  - CPU: k6's `CPU per step` lines were not copied. Queried from Prometheus after the run with the same query as `script.js`, at step-end times estimated from the API's request counter (accurate to about ±15 s).
  - Median latency: 38 ms at 1600, 59 ms at 1700, 69 ms at 1725, 76 ms at 1750, 582 ms at 1775.
  - Slowest single request in a step: 1.73 s (at 1750).

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1600         | 83.20    | 0.00           | 0.23            | 0.22                 |
| 1625         | 73.62    | 0.00           | 0.23            | 0.23                 |
| 1650         | 79.91    | 0.00           | 0.21            | 0.25                 |
| 1675         | 84.13    | 0.00           | 0.25            | 0.25                 |
| 1700         | 176.09   | 0.00           | 0.22            | 0.21                 |
| 1725         | 215.59   | 0.00           | 0.24            | 0.25                 |
| 1750         | 414.25   | 0.00           | 0.22            | 0.23                 |
| 1775         | 894.89   | 0.00           | 0.23            | 0.23                 |

## H. Scenario 1's setup with 1500 VUs (reads, 1600-1775), 3 runs

- **Purpose:** the 3 Baseline (reads) runs, with `preAllocatedVUs: 1500` and `maxVUs: 1500` in `script.js` (instead of 20 / 1000), so k6 would not drop iterations. Not usable: see Notes. `script.js` was set back to 20 / 1000 afterwards.
- **Date:** 2026-11-25, run 1 10:12:33-10:25:40, run 2 10:25:40-10:38:46, run 3 10:38:46-10:51:47 (back to back)
- **Setup:** same as G, same cluster (not restarted). The pods had been running for about 50 minutes at the start of run 1.
- **Command:** `k6 run -e MODE=reads -e START=1600 -e STEP=25 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 25 req/s
- **Screenshots:** none
- **Notes:**
  - About 27% of requests failed in every step of all 3 runs, from the first second of each run (about 248,000 of 906,000 per run). 0 `dropped_iterations` in every step.
  - All failures were on the tunnel's local port: `connectex: No connection could be made because the target machine actively refused it` (113,661 in run 1) and `wsarecv: An existing connection was forcibly closed by the remote host` (134,565 in run 1).
  - p95 was about 460-480 ms at every step in all 3 runs, failed requests included. p95 of the successful requests only, whole run: 45.03 / 43.97 / 46.60 ms.
  - `vus_max` was 1500 from the start.
  - Only the table for run 1 is shown; runs 2 and 3 were within 0.3 percentage points (error rate) and 21 ms (p95) of it at every step.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1600         | 458.10   | 27.29          | 0.24            | 0.24                 |
| 1625         | 463.28   | 27.30          | 0.20            | 0.24                 |
| 1650         | 472.60   | 27.53          | 0.23            | 0.24                 |
| 1675         | 470.34   | 27.25          | 0.24            | 0.24                 |
| 1700         | 468.10   | 27.30          | 0.23            | 0.25                 |
| 1725         | 466.99   | 27.30          | 0.24            | 0.25                 |
| 1750         | 460.23   | 27.40          | 0.24            | 0.25                 |
| 1775         | 461.35   | 27.33          | 0.24            | 0.25                 |

## I1. Scenario 1's setup with 0.25 CPU, 50 req/s steps (reads, 1500-1850)

- **Used as:** `1. Baseline (reads) - run 1` in `results.md`.
- **Purpose:** one of 3 runs at a 50 req/s step size (I1-I3), to see whether the limit varies less between runs than at 25 req/s (Baseline reads runs 1-3 in `results.md`).
- **Date:** 2026-11-25, 11:36:33-11:49:41
- **Setup:** same as G, same cluster (not restarted). `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`. The pods had been running for about 2.2 hours. I1-I3 ran back to back.
- **Command:** `k6 run -e MODE=reads -e START=1500 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Screenshots:** `images/1-baseline-reads/sc1-run1.png`
- **Notes:**
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

## I2. Scenario 1's setup with 0.25 CPU, 50 req/s steps (reads, 1500-1850)

- **Used as:** `1. Baseline (reads) - run 2` in `results.md`.
- **Purpose:** one of 3 runs at a 50 req/s step size (I1-I3), to see whether the limit varies less between runs than at 25 req/s (Baseline reads runs 1-3 in `results.md`).
- **Date:** 2026-11-25, 11:49:41-12:02:45
- **Setup:** same as G, same cluster (not restarted). `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`. The pods had been running for about 2.4 hours. I1-I3 ran back to back.
- **Command:** `k6 run -e MODE=reads -e START=1500 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Screenshots:** `images/1-baseline-reads/sc1-run2.png`
- **Notes:**
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

## I3. Scenario 1's setup with 0.25 CPU, 50 req/s steps (reads, 1500-1850)

- **Used as:** `1. Baseline (reads) - run 3` in `results.md`.
- **Purpose:** one of 3 runs at a 50 req/s step size (I1-I3), to see whether the limit varies less between runs than at 25 req/s (Baseline reads runs 1-3 in `results.md`).
- **Date:** 2026-11-25, 12:02:45-12:15:47
- **Setup:** same as G, same cluster (not restarted). `script.js` with `preAllocatedVUs: 20`, `maxVUs: 1000`. The pods had been running for about 2.6 hours. I1-I3 ran back to back.
- **Command:** `k6 run -e MODE=reads -e START=1500 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Screenshots:** `images/1-baseline-reads/sc1-run3.png`
- **Notes:**
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

## J1. Scenario 1's setup with 0.25 CPU, 25 req/s steps (reads, 1600-1775)

- **Purpose:** runs 2 and 3 of the first Baseline (reads), at 25 req/s with G as run 1. Replaced by I1-I3 in `results.md`: the limit varied more between runs (±83 req/s) than the 25 req/s step size.
- **Date:** 2026-11-25, 10:55:41-11:08:46
- **Setup:** same as G, same cluster (not restarted).
- **Command:** `k6 run -e MODE=reads -e START=1600 -e STEP=25 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 25 req/s
- **Screenshots:** none
- **Notes:**
  - The pods had been running for about 1.5 hours.
  - 140 failed requests, all in the first 2 s of the warm-up (tunnel refused the connection). 0 failed in the steps.
  - `dropped_iterations`: 160 at 1600, 677 at 1625, 355 at 1650, 281 at 1675, 270 at 1700, 307 at 1725, 351 at 1750, 396 at 1775. `vus_max` reached 1000.
  - p95 went over 200 ms at 1625 only, and was below 200 ms at every later step.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1600         | 73.67    | 0.00           | 0.24            | 0.25                 |
| 1625         | 278.45   | 0.00           | 0.24            | 0.25                 |
| 1650         | 103.13   | 0.00           | 0.24            | 0.25                 |
| 1675         | 90.20    | 0.00           | 0.24            | 0.25                 |
| 1700         | 96.32    | 0.00           | 0.25            | 0.25                 |
| 1725         | 108.06   | 0.00           | 0.24            | 0.25                 |
| 1750         | 113.03   | 0.00           | 0.25            | 0.25                 |
| 1775         | 150.82   | 0.00           | 0.24            | 0.25                 |

## J2. Scenario 1's setup with 0.25 CPU, 25 req/s steps (reads, 1600-1775)

- **Purpose:** runs 2 and 3 of the first Baseline (reads), at 25 req/s with G as run 1. Replaced by I1-I3 in `results.md`: the limit varied more between runs (±83 req/s) than the 25 req/s step size.
- **Date:** 2026-11-25, 11:08:46-11:21:48
- **Setup:** same as G, same cluster (not restarted).
- **Command:** `k6 run -e MODE=reads -e START=1600 -e STEP=25 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 25 req/s
- **Screenshots:** none
- **Notes:**
  - Ran straight after J1. The pods had been running for about 1.7 hours.
  - 62 failed requests, all at 1750, within one second at the start of the step (11:19:17; tunnel refused the connection).
  - `dropped_iterations`: 577 at 1600, 453 at 1625, 293 at 1650, 413 at 1675, 421 at 1700, 313 at 1725, 347 at 1750, 15,693 at 1775. `vus_max` reached 1000.
  - At 1775, k6 sent 90,807 requests in the step (about 1510 req/s, of 1775 planned).
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 1600         | 101.89   | 0.00           | 0.24            | 0.25                 |
| 1625         | 96.66    | 0.00           | 0.24            | 0.25                 |
| 1650         | 88.49    | 0.00           | 0.24            | 0.25                 |
| 1675         | 101.21   | 0.00           | 0.25            | 0.25                 |
| 1700         | 109.03   | 0.00           | 0.24            | 0.21                 |
| 1725         | 101.32   | 0.00           | 0.20            | 0.25                 |
| 1750         | 124.80   | 0.05           | 0.24            | 0.25                 |
| 1775         | 835.23   | 0.00           | 0.22            | 0.25                 |
