# Other results: Scenario 5, Redis cache

Raw numbers only, for runs that are not one of the scenario runs in `../results.md`: probes to find a sensible `START`/`STEP`, checks of the setup, and anything else tried along the way. Same table as `results.md`, so the numbers can be compared. No interpretation here, and these numbers do not go into `test-scenarios.svg`.

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`). Use k6's p95, not Grafana's: Grafana estimates it from Prometheus' buckets (see `../test-description.md`). CPU: from the `CPU per step` lines k6 prints just above its summary (0.25 = its limit). Grafana screenshots go in `../other-images/`. Under **Notes**: the setup, the k6 command, the API image tag, any step that showed `dropped_iterations`, and anything unusual.

## R1. Scenario 5's setup, second coarse run (reads, 4000-8000)

- **Purpose:** look for where p95 rises above 4000, after Scenario 5's run (`../results.md`, 1500-4000) never went over 51 ms.
- **Date:** 2026-11-26, 14:33:58-14:42:36
- **Setup:** as Scenario 5: 1 API, 1 Postgres (`b`'s `Host` = `postgres-a-0.postgres-a`), Redis on (`CacheEnabled` = `"true"`, 2 s TTL). `preAllocatedVUs: 20`, `maxVUs: 3000` (Scenario 1 and 5: 1000), set for this run only.
- **Command:** `k6 run -e MODE=reads -e START=4000 -e STEP=1000 -e STEPS=5 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 1000 req/s
- **Grafana time ranges:** warm-up 14:33:58-14:34:58, 4000 14:35:28-14:36:28, 5000 14:36:58-14:37:58, 6000 14:38:28-14:39:28, 7000 14:39:58-14:40:58, 8000 14:41:28-14:42:28.
- **Screenshots:** none
- **Notes:**
  - 2,021,043 requests, 822,676 failed (40.70%).
  - Failed requests by error, all between k6 and the tunnel port (`127.0.0.1:62897`): 759,140 `connection refused`, 63,487 `An existing connection was forcibly closed by the remote host`, 48 `connected party did not properly respond`, 1 `system lacked sufficient buffer space`.
  - Failed requests by minute: 378 at 14:33 (warm-up), 25,494 at 14:35, 30,087 at 14:36, 79,822 at 14:37, 106,220 at 14:38, 71,517 at 14:39, 191,267 at 14:40, 175,647 at 14:41, 142,244 at 14:42.
  - The API pod did not restart (0 restarts after the run). `curl` to the tunnel returned 200 right after the run.
  - `dropped_iterations`: 570 at 4000, 6,447 at 5000, 1,523 at 6000, 5,057 at 7000, 3,596 at 8000. `vus_max` reached 3000.
  - Whole run: `http_req_duration` avg 47.95 ms, median 16.27 ms, max 1.7 s. The duration includes the failed requests.
  - Scenario 5's run at 4000 (`maxVUs: 1000`): p95 49.59 ms, 0.00% errors, 6,267 dropped.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|---------|-----------------|----------------------|
| 4000         | 442.71   | 21.85          | 570     | 0.23            | 0.01                 |
| 5000         | 458.14   | 28.30          | 6,447   | 0.25            | 0.04                 |
| 6000         | 40.52    | 47.99          | 1,523   | 0.20            | 0.01                 |
| 7000         | 350.49   | 47.46          | 5,057   | 0.22            | 0.03                 |
| 8000         | 41.17    | 66.72          | 3,596   | 0.21            | 0.01                 |
