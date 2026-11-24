# Other results

Raw numbers only, for runs that are not one of the scenario runs in `results.md`: probes to find a sensible `START`/`STEP`, checks of the setup, and anything else tried along the way. Same table as `results.md`, so the numbers can be compared. No interpretation here, and these numbers do not go into `test-scenarios.svg`.

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`). Use k6's p95, not Grafana's: Grafana estimates it from Prometheus' buckets (see `test-description.md`). CPU: from the `CPU per step` lines k6 prints just above its summary (0.25 = its limit; 1.0 in runs A-C). Grafana screenshots go in `other-images/`. Under **Notes**: the setup, the k6 command, the API image tag, any step that showed `dropped_iterations`, and anything unusual.

## A. First try at Scenario 1's setup (reads, 50-400)

- **Date:** 2026-11-24, about 15:05-15:17
- **Setup:** Scenario 1 (1 API · 1 Postgres · Redis off): `replicas: 1`, `CacheEnabled "false"`, `b` in `db-credentials.yaml` pointing at `postgres-a`. CPU limits: 1 core for the API and each Postgres (before the change to 0.25)
- **Command:** `k6 run -e MODE=reads -e START=50 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Screenshots:** `other-images/first-test-sc1.png`, `other-images/first-test-sc1-latency.png`
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

- **Date:** 2026-11-24, about 15:41-15:47
- **Setup:** same as A
- **Command:** `k6 run -e MODE=reads -e START=400 -e STEP=200 -e STEPS=4 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 200 req/s
- **Screenshots:** `other-images/second-test-sc1.png`, `other-images/second-test-sc1-latency.png`
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

- **Date:** 2026-11-24, about 15:55-16:01
- **Setup:** same as A
- **Command:** `k6 run -e MODE=reads -e START=1300 -e STEP=300 -e STEPS=4 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 300 req/s
- **Screenshots:** `other-images/third-test-sc1.png`, `other-images/third-test-sc1-latency.png`
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
