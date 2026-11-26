# Other results: Scenario 8, X+Z scaling

Raw numbers only, for runs that are not one of the scenario runs in `../results.md`: probes to find a sensible `START`/`STEP`, checks of the setup, and anything else tried along the way. Same table as `results.md`, so the numbers can be compared. No interpretation here, and these numbers do not go into `test-scenarios.svg`.

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`). Use k6's p95, not Grafana's: Grafana estimates it from Prometheus' buckets (see `../test-description.md`). CPU: from the `CPU per step` lines k6 prints just above its summary (0.25 = its limit). Grafana screenshots go in `../other-images/`. Under **Notes**: the setup, the k6 command, the API image tag, any step that showed `dropped_iterations`, and anything unusual.

## R1. Scenario 8's setup, coarse run above 500 (writes, 500-1750)

- **Purpose:** look for where p95 rises above 500, after Scenario 8's run 1 (`../results.md`, 150-500) never went over 11.40 ms.
- **Date:** 2026-11-26, 15:31:46-15:41:49
- **Setup:** as Scenario 8: 3 API, 2 Postgres (`b`'s `Host` = `postgres-b-0.postgres-b`), Redis off (`CacheEnabled` = `"false"`). `preAllocatedVUs: 30`, `maxVUs: 30`. Both databases reset before the run (`LoadTest-k6/README.md`), `sold` = 0.
- **Command:** `k6 run -e MODE=writes -e START=500 -e STEP=250 -e STEPS=6 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 250 req/s
- **Grafana time ranges:** warm-up 15:31:46-15:32:46, 500 15:33:16-15:34:16, 750 15:34:46-15:35:46, 1000 15:36:16-15:37:16, 1250 15:37:46-15:38:46, 1500 15:39:16-15:40:16, 1750 15:40:46-15:41:46.
- **Screenshots:** `../other-images/sc8-coarse.png`
- **Notes:**
  - 189,286 requests, 0 failed.
  - Dropped: k6's `dropped_iterations` for the step. Got through: (step rate × 60 - dropped) / 60.
  - k6 warned `Insufficient VUs, reached 30 active VUs` in the warm-up and in every step from 750.
  - p95 per database (`db:a` / `db:b`): 1000 200.30 / 232.42, 1250 203.59 / 297.89, 1500 174.23 / 380.34, 1750 281.79 / 292.19.
  - CPU from k6's `CPU per step` lines (busiest of the 3 API pods, busiest of the 2 Postgres pods).

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 500          | 5.85     | 0.00           | 0       | 500                 | 0.19            | 0.13                 |
| 750          | 15.03    | 0.00           | 20      | 750                 | 0.24            | 0.21                 |
| 1000         | 206.01   | 0.00           | 33,022  | 450                 | 0.21            | 0.23                 |
| 1250         | 285.28   | 0.00           | 54,171  | 347                 | 0.21            | 0.24                 |
| 1500         | 294.60   | 0.00           | 70,188  | 330                 | 0.20            | 0.25                 |
| 1750         | 288.31   | 0.00           | 85,175  | 330                 | 0.21            | 0.24                 |

## R2. Scenario 8's first run (writes, 150-500)

- **Purpose:** Scenario 8's first run, with Scenario 4's load test unchanged. It ended at 500 without p95 rising, so it was replaced in `../results.md` by the run at 500-1200 (step 100), after R1.
- **Date:** 2026-11-26, 12:52:46-13:05:46 (before R1)
- **Setup:** as Scenario 4, but `replicas: 3` in `k8s/api.yaml`. `preAllocatedVUs: 30`, `maxVUs: 30`. Both databases reset before the run (`LoadTest-k6/README.md`), `sold` = 0.
- **Command:** `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Grafana time ranges:** warm-up 12:52:46-12:53:46, 150 12:54:16-12:55:16, 200 12:55:46-12:56:46, 250 12:57:16-12:58:16, 300 12:58:46-12:59:46, 350 13:00:16-13:01:16, 400 13:01:46-13:02:46, 450 13:03:16-13:04:16, 500 13:04:46-13:05:46.
- **Screenshots:** `../other-images/sc8-150-500.png`
- **Notes:**
  - 164,140 requests, 0 failed. After the run `sold` summed to 81,973 in database a and 82,151 in database b, over 20 sections each.
  - Dropped: k6's `dropped_iterations` for the step. Got through: (step rate × 60 - dropped) / 60.
  - Throughput: highest 500 at 500, the last step.
  - p95 is never over 200 ms (`> 500`); highest 11.40 ms at 400.
  - CPU from k6's `CPU per step` lines (busiest of the 3 API pods, busiest of the 2 Postgres pods).

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 150          | 10.92    | 0.00           | 0       | 150                 | 0.12            | 0.07                 |
| 200          | 7.56     | 0.00           | 0       | 200                 | 0.10            | 0.08                 |
| 250          | 8.44     | 0.00           | 202     | 247                 | 0.13            | 0.09                 |
| 300          | 5.40     | 0.00           | 0       | 300                 | 0.15            | 0.10                 |
| 350          | 4.88     | 0.00           | 0       | 350                 | 0.15            | 0.11                 |
| 400          | 11.40    | 0.00           | 142     | 398                 | 0.17            | 0.11                 |
| 450          | 5.30     | 0.00           | 539     | 441                 | 0.18            | 0.12                 |
| 500          | 5.31     | 0.00           | 0       | 500                 | 0.19            | 0.13                 |
