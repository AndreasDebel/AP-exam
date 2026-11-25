# Other results

Raw numbers only, for runs that are not one of the scenario runs in `results.md`: probes to find a sensible `START`/`STEP`, checks of the setup, and anything else tried along the way. Same table as `results.md`, so the numbers can be compared. No interpretation here, and these numbers do not go into `test-scenarios.svg`.

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`). Use k6's p95, not Grafana's: Grafana estimates it from Prometheus' buckets (see `test-description.md`). CPU: from the `CPU per step` lines k6 prints just above its summary (0.25 = its limit; 1.0 in runs A-C). Grafana screenshots go in `other-images/`. Under **Notes**: the setup, the k6 command, the API image tag, any step that showed `dropped_iterations`, and anything unusual.

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
