# Other results: Scenario 4, Z-scaling the DB

Raw numbers only, for runs that are not one of the scenario runs in `../results.md`: probes to find a sensible `START`/`STEP`, checks of the setup, and anything else tried along the way. Same table as `results.md`, so the numbers can be compared. No interpretation here, and these numbers do not go into `test-scenarios.svg`.

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`). Use k6's p95, not Grafana's: Grafana estimates it from Prometheus' buckets (see `../test-description.md`). CPU: from the `CPU per step` lines k6 prints just above its summary (0.25 = its limit; 1.0 in runs A-C). Grafana screenshots go in `../other-images/`. Under **Notes**: the setup, the k6 command, the API image tag, any step that showed `dropped_iterations`, and anything unusual.

## Z1. Scenario 4's setup, preliminary (writes, 150-400)

- **Purpose:** check that Scenario 4 (Z-scaling the DB) gives consistent numbers and that 150-400 covers its limit, before the real run.
- **Date:** 2026-11-26, 12:04:08-12:14:08
- **Setup:** 1 API, 2 Postgres (`b`'s `Host` back to `postgres-b-0.postgres-b` in `k8s/db-credentials.yaml`, then `kubectl apply -k k8s` and `kubectl rollout restart deployment/api -n booking`), Redis off. Both databases reset just before (README step 6, `sold` = 0, `VACUUM FULL`). `preAllocatedVUs: 30`, `maxVUs: 30`, as in Scenario 2.
- **Command:** `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=6 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Screenshots:** none
- **Notes:**
  - 90,793 requests, 0 failed.
  - Got through: (step rate × 60 - dropped) / 60.
  - p95 never goes over 200 ms: with 30 VUs the overload shows as dropped iterations (`error-sources.md`, 6 and 7). Dropped iterations start at 250.
  - API CPU at its limit (0.25) at 300 and 350. CPU Postgres is the busiest of the two Postgres pods.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 150          | 105.58   | 0.00           | 16      | 150                 | 0.16            | 0.09                 |
| 200          | 91.83    | 0.00           | 15      | 200                 | 0.23            | 0.13                 |
| 250          | 160.66   | 0.00           | 1,175   | 230                 | 0.24            | 0.15                 |
| 300          | 156.03   | 0.00           | 1,875   | 269                 | 0.25            | 0.20                 |
| 350          | 169.90   | 0.00           | 4,143   | 281                 | 0.25            | 0.23                 |
| 400          | 176.30   | 0.00           | 7,367   | 277                 | 0.21            | 0.23                 |

## Z2. Scenario 4's setup, repeat of Z1 (writes, 150-400)

- **Purpose:** as Z1, to see the run-to-run variation.
- **Date:** 2026-11-26, 12:14:23-12:24:24
- **Setup:** as Z1, same cluster, both databases reset just before.
- **Command:** as Z1.
- **Step size:** 50 req/s
- **Screenshots:** none
- **Notes:**
  - 96,584 requests, 0 failed.
  - p95 never goes over 200 ms. Dropped iterations start at 250, as in Z1.
  - At 400, 316 req/s got through, more than Z1's 277.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | Got through (req/s) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|---------------------|-----------------|----------------------|
| 150          | 44.34    | 0.00           | 0       | 150                 | 0.16            | 0.07                 |
| 200          | 73.05    | 0.00           | 1       | 200                 | 0.23            | 0.12                 |
| 250          | 120.74   | 0.00           | 718     | 238                 | 0.23            | 0.15                 |
| 300          | 150.01   | 0.00           | 1,495   | 275                 | 0.21            | 0.20                 |
| 350          | 171.97   | 0.00           | 4,156   | 281                 | 0.25            | 0.20                 |
| 400          | 161.17   | 0.00           | 5,063   | 316                 | 0.25            | 0.21                 |
