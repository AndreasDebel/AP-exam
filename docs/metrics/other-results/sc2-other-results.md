# Other results: Scenario 2, Baseline (writes)

Raw numbers only, for runs that are not one of the scenario runs in `../results.md`: probes to find a sensible `START`/`STEP`, checks of the setup, and anything else tried along the way. Same table as `results.md`, so the numbers can be compared. No interpretation here, and these numbers do not go into `test-scenarios.svg`.

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`). Use k6's p95, not Grafana's: Grafana estimates it from Prometheus' buckets (see `../test-description.md`). CPU: from the `CPU per step` lines k6 prints just above its summary (0.25 = its limit; 1.0 in runs A-C). Grafana screenshots go in `../other-images/`. Under **Notes**: the setup, the k6 command, the API image tag, any step that showed `dropped_iterations`, and anything unusual.

## K. Scenario 2's setup, coarse probe (writes, 100-1000)

- **Used as:** probe only, to find where the writes limit lies before choosing a step size for `2. Baseline (writes)`.
- **Date:** 2026-11-25, 12:33:21-12:49:27
- **Setup:** same cluster as I1-I3 (not restarted, databases not reset; only reads had run before, so `sold` started at 0). `script.js` unchanged (`preAllocatedVUs: 20`, `maxVUs: 1000`).
- **Command:** `k6 run -e MODE=writes -e START=100 -e STEP=100 -e STEPS=10 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 100 req/s
- **Screenshots:** none
- **Notes:**
  - 206,015 requests in total. Errors came from the API: 3,280 `NpgsqlException: The connection pool has been exhausted ... 'Max Pool Size' (currently 30) or 'Timeout' (currently 3 seconds)` in the API log. A buy holds its connection for the whole transaction (row lock), so at high rates the 30 connections are all busy and the rest wait up to 3 s, then fail. 3 further requests failed with `EOF` (tunnel) at 400-500.
  - `dropped_iterations`: 0 at 100, 340 at 200, 555 at 300, 269 at 400, 428 at 500, 11,206 at 600, 18,851 at 700, 25,578 at 800, 33,691 at 900, 39,054 at 1000. `vus_max` reached 1000 from 600 on, so from 600 k6 did not send the planned rate.
  - p95 is not monotonic: 1.59 s at 200 and 1.7 s at 300, but 485 ms at 400. Only 100 is under 200 ms. With 100 req/s steps the limit is somewhere between 100 and 200, too coarse to place it.
  - Errors start at 600 and stay above 0 from there.
  - CPU from k6's `CPU per step` lines. Neither pod is clearly at its 0.25 cap at every step, which fits a pool (waiting) limit rather than a CPU limit.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 100          | 26.23    | 0.00           | 0.19            | 0.13                 |
| 200          | 1590.00  | 0.00           | 0.16            | 0.24                 |
| 300          | 1700.00  | 0.00           | 0.15            | 0.20                 |
| 400          | 484.85   | 0.00           | 0.23            | 0.22                 |
| 500          | 804.63   | 0.00           | 0.22            | 0.25                 |
| 600          | 4420.00  | 11.82          | 0.20            | 0.20                 |
| 700          | 3690.00  | 18.86          | 0.21            | 0.20                 |
| 800          | 3640.00  | 22.96          | 0.19            | 0.20                 |
| 900          | 4250.00  | 35.78          | 0.21            | 0.18                 |
| 1000         | 3660.00  | 24.94          | 0.19            | 0.21                 |

## L. Scenario 2's setup, 25 req/s steps (writes, 25-275)

- **Used as:** meant as `2. Baseline (writes) - run 1`, but p95 never crossed 200 ms, so the run was stopped after run 1 (runs 2-3 not started).
- **Date:** 2026-11-25, 12:56:37-13:14:08
- **Setup:** same cluster as K (not restarted, databases not reset after K: `sold` started at about 5,000 per section of 1,000,000). `script.js` unchanged.
- **Command:** `k6 run -e MODE=writes -e START=25 -e STEP=25 -e STEPS=11 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 25 req/s
- **Screenshots:** none
- **Notes:**
  - 100,359 requests, 0 failed, 0 warnings. `vus_max` reached 170.
  - `dropped_iterations`: 36 at 175, 15 at 225, 104 at 250, 18 at 275; 0 elsewhere.
  - p95 stays under 70 ms all the way to 275. So K's 1.6 s at 200-300 was not the writes limit. K warmed up at only 100 req/s, so K's 200 step was probably the API's connection pool still growing (pool exhausted errors appeared only in K), not saturation.
  - CPU from k6's `CPU per step` lines. Neither pod reached its 0.25 cap; the API came closest (0.24 at 225).

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 25           | 41.61    | 0.00           | 0.05            | 0.03                 |
| 50           | 23.25    | 0.00           | 0.09            | 0.05                 |
| 75           | 18.03    | 0.00           | 0.12            | 0.07                 |
| 100          | 12.67    | 0.00           | 0.15            | 0.08                 |
| 125          | 10.62    | 0.00           | 0.18            | 0.10                 |
| 150          | 9.40     | 0.00           | 0.20            | 0.12                 |
| 175          | 16.60    | 0.00           | 0.19            | 0.14                 |
| 200          | 16.82    | 0.00           | 0.23            | 0.15                 |
| 225          | 27.69    | 0.00           | 0.24            | 0.16                 |
| 250          | 59.86    | 0.00           | 0.18            | 0.17                 |
| 275          | 66.89    | 0.00           | 0.17            | 0.15                 |

## M. Scenario 2's setup, 50 req/s steps (writes, 250-600)

- **Used as:** was `2. Baseline (writes) - run 1` in `results.md`, until N1 and N2 showed the runs drifting. Started as a probe, to place the writes limit after L stayed under 200 ms up to 275.
- **Date:** 2026-11-25, 13:16:44-13:29:56
- **Setup:** same cluster as K and L (not restarted, databases not reset). `script.js` unchanged.
- **Command:** `k6 run -e MODE=writes -e START=250 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Screenshots:** none
- **Notes:**
  - 202,669 requests. Failures only at 600 (0.23%): 63 `connection pool has been exhausted` in the API log, plus 1 `EOF` (tunnel).
  - `dropped_iterations`: 89 at 250, 51 at 300, 99 at 350, 501 at 400, 232 at 450, 1,399 at 500, 4,338 at 550, 9,551 at 600. `vus_max` reached 1000 from 500 on.
  - p95 stays over 200 ms from 350. Postgres is at or near its 0.25 cap from 350 on, so here, unlike K, the limit is Postgres CPU.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 250          | 122.67   | 0.00           | 0.18            | 0.16                 |
| 300          | 93.55    | 0.00           | 0.19            | 0.22                 |
| 350          | 243.88   | 0.00           | 0.20            | 0.24                 |
| 400          | 1090.00  | 0.00           | 0.17            | 0.25                 |
| 450          | 391.68   | 0.00           | 0.24            | 0.24                 |
| 500          | 2190.00  | 0.00           | 0.21            | 0.25                 |
| 550          | 2280.00  | 0.00           | 0.21            | 0.25                 |
| 600          | 2850.00  | 0.23           | 0.20            | 0.25                 |

## N1. Scenario 2's setup, repeat of M (writes, 250-600)

- **Used as:** was `2. Baseline (writes) - run 2` in `results.md`. Dropped because N1 and N2 got slower than M: the databases were not reset between runs, so the 40 load-test rows had built up dead row versions (old copies Postgres keeps after `UPDATE`). Disproved later: writes run 1 in `results.md` ran on fresh databases and was just as slow, so M was the outlier.
- **Date:** 2026-11-25, 14:11:49-14:24:53
- **Setup:** same cluster as K, L and M (not restarted, databases not reset since before K). N1 and N2 ran back to back.
- **Command:** same as M.
- **Step size:** 50 req/s
- **Screenshots:** none
- **Notes:**
  - 192,095 requests, 4,562 failed (2.37%).
  - `dropped_iterations`: 89 at 250, 686 at 300, 196 at 350, 534 at 400, 184 at 450, 2,593 at 500, 8,356 at 550, 13,342 at 600. `vus_max` reached 1000.
  - p95 is over 200 ms at every step, from 250 (the first step) on, so the limit is at or below 250. Errors: one blip at 400 (0.02%), then over 0 from 500 on.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 250          | 274.66   | 0.00           | 0.21            | 0.15                 |
| 300          | 2280.00  | 0.00           | 0.20            | 0.23                 |
| 350          | 249.04   | 0.00           | 0.23            | 0.21                 |
| 400          | 1180.00  | 0.02           | 0.22            | 0.24                 |
| 450          | 276.50   | 0.00           | 0.23            | 0.25                 |
| 500          | 2490.00  | 1.51           | 0.21            | 0.25                 |
| 550          | 2920.00  | 0.20           | 0.20            | 0.25                 |
| 600          | 3300.00  | 8.89           | 0.19            | 0.24                 |

## N2. Scenario 2's setup, repeat of M (writes, 250-600)

- **Used as:** was `2. Baseline (writes) - run 3` in `results.md`. Dropped because N1 and N2 got slower than M: the databases were not reset between runs, so the 40 load-test rows had built up dead row versions (old copies Postgres keeps after `UPDATE`). Disproved later: writes run 1 in `results.md` ran on fresh databases and was just as slow, so M was the outlier.
- **Date:** 2026-11-25, 14:24:53-14:37:59
- **Setup:** same cluster as K, L and M (not restarted, databases not reset since before K). N1 and N2 ran back to back.
- **Command:** same as M.
- **Step size:** 50 req/s
- **Screenshots:** none
- **Notes:**
  - 199,330 requests, 2,441 failed (1.22%).
  - `dropped_iterations`: 211 at 250, 583 at 300, 192 at 350, 507 at 400, 614 at 450, 823 at 500, 5,411 at 550, 10,605 at 600. `vus_max` reached 1000.
  - p95 is over 200 ms at every step, from 250 (the first step) on, so the limit is at or below 250. Errors over 0 from 500 on.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 250          | 610.37   | 0.00           | 0.18            | 0.21                 |
| 300          | 1790.00  | 0.00           | 0.20            | 0.24                 |
| 350          | 420.43   | 0.00           | 0.22            | 0.22                 |
| 400          | 1280.00  | 0.00           | 0.22            | 0.25                 |
| 450          | 1340.00  | 0.00           | 0.21            | 0.25                 |
| 500          | 1660.00  | 1.01           | 0.21            | 0.25                 |
| 550          | 3010.00  | 3.07           | 0.19            | 0.25                 |
| 600          | 3200.00  | 5.09           | 0.20            | 0.25                 |

## O. Scenario 2's setup, M repeated on fresh databases (writes, 250-600)

- **Used as:** was `2. Baseline (writes) - run 1` in `results.md`, until the runs from 150 (P1-P3) replaced it.
- **Date:** 2026-11-25, 15:50:03-16:03:11
- **Setup:** full reset (README step 8) just before, `sold` = 0.
- **Command:** same as M.
- **Step size:** 50 req/s
- **Screenshots:** none
- **Notes:**
  - 185,015 requests, 7,920 failed (4.28%). API log: 2,863 `connection pool has been exhausted`. 7 `EOF` (tunnel).
  - `dropped_iterations`: 103 at 250, 680 at 300, 210 at 350, 548 at 400, 1,519 at 450, 2,417 at 500, 9,038 at 550, 13,311 at 600. `vus_max` reached 1000.
  - p95 is over 200 ms at every step, from 250 (the first step) on, so the limit is at or below 250.
  - As slow as N1 and N2, although the databases were fresh. So dead rows did not cause the drift; M is the outlier.
  - CPU from k6's `CPU per step` lines.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 250          | 280.44   | 0.00           | 0.19            | 0.18                 |
| 300          | 2280.00  | 0.00           | 0.19            | 0.24                 |
| 350          | 236.67   | 0.00           | 0.23            | 0.22                 |
| 400          | 1280.00  | 0.02           | 0.22            | 0.25                 |
| 450          | 2520.00  | 1.71           | 0.21            | 0.25                 |
| 500          | 2470.00  | 0.00           | 0.21            | 0.25                 |
| 550          | 2990.00  | 1.35           | 0.20            | 0.25                 |
| 600          | 3460.00  | 5.36           | 0.20            | 0.24                 |

## P1. Scenario 2's setup, 1000 VUs (writes, 150-500)

- **Used as:** was `2. Baseline (writes) - run 1` in `results.md`, until runs with 30 VUs (Y and two more) replaced it: p95 zigzagged with 1000 VUs (`error-sources.md`, 6).
- **Date:** 2026-11-25, 16:06:08-16:19:09
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`. P1-P3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 162,291 requests, 11 failed (0.01%).
  - `dropped_iterations`: 13 at 150, 168 at 200, 709 at 250, 242 at 300, 529 at 350, 273 at 400, 455 at 450, 256 at 500.
  - p95 stays over 200 ms from 200.
  - p95 does not rise with the rate: 250, 350 and 450 are slow, 300, 400 and 500 faster. Same zigzag in all 3 runs.
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

## P2. Scenario 2's setup, 1000 VUs (writes, 150-500)

- **Used as:** was `2. Baseline (writes) - run 2` in `results.md`, until runs with 30 VUs (Y and two more) replaced it: p95 zigzagged with 1000 VUs (`error-sources.md`, 6).
- **Date:** 2026-11-25, 16:19:09-16:32:16
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`. P1-P3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 162,040 requests, 2 failed (0.00%).
  - `dropped_iterations`: 127 at 150, 347 at 200, 675 at 250, 207 at 300, 591 at 350, 203 at 400, 543 at 450, 290 at 500.
  - p95 is over 200 ms at every step, from 150 (the first step) on, so the limit is at or below 150.
  - p95 does not rise with the rate: 250, 350 and 450 are slow, 300, 400 and 500 faster. Same zigzag in all 3 runs.
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

## P3. Scenario 2's setup, 1000 VUs (writes, 150-500)

- **Used as:** was `2. Baseline (writes) - run 3` in `results.md`, until runs with 30 VUs (Y and two more) replaced it: p95 zigzagged with 1000 VUs (`error-sources.md`, 6).
- **Date:** 2026-11-25, 16:32:16-16:45:22
- **Step size:** 50 req/s
- **Notes:**
  - Command: `k6 run -e MODE=writes -e START=150 -e STEP=50 -e STEPS=8 -e BASE_URL=<url> LoadTest-k6/script.js`. P1-P3 ran back to back.
  - Database reset before the run (README step 6: `UPDATE ... sold=0` + `VACUUM FULL`), `sold` = 0.
  - 162,388 requests, 66 failed (0.04%).
  - `dropped_iterations`: 0 at 150, 99 at 200, 816 at 250, 148 at 300, 640 at 350, 115 at 400, 610 at 450, 203 at 500.
  - p95 is over 200 ms from 200, except 400 (165.70 ms), so by the rule it stays over from 450.
  - p95 does not rise with the rate: 250, 350 and 450 are slow, 300, 400 and 500 faster. Same zigzag in all 3 runs.
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

## Q-X. Troubleshooting the writes zigzag (2026-11-26)

Short experiments, all on Scenario 2's setup (1 API, 1 Postgres, both at 0.25 core, `Maximum Pool Size=30`). Same cluster for all, started about 17 minutes before Q, no reset between runs. Not run with `script.js` but with an experiment copy (writes only) that takes the list of rates, step length, pause, warm-up and `preAllocatedVUs`/`maxVUs` as parameters. Steps are 60 s unless noted. p95 per 10 s comes from k6's `--out csv`, not from the summary. No CPU column: these runs were short, and Prometheus' 20 s CPU rates came out patchy (cAdvisor updates its counters only every ~10-15 s).

### Q. Same rate in every step: 300, 300, 300, 300

- **Settings:** warm-up 150, pause 30 s, VUs 20 / 1000 (as `script.js`).
- **Notes:**
  - The zigzag is still there at a constant rate: slow, fast, slow, fast. So it does not come from the rate.
  - Slow periods start 10-20 s into a step and last 20-50 s, p50 up to 1.4 s. The 4th step stayed fast the whole minute.
  - The API's own p95 (Prometheus) had the same slow periods, so they are in the API/database, not in the tunnel.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped |
|--------------|----------|----------------|---------|
| 300          | 1380.00  | 0.00           | 511     |
| 300          | 706.41   | 0.00           | 336     |
| 300          | 1600.00  | 0.00           | 546     |
| 300          | 290.51   | 0.00           | 155     |

### R. Cold start straight at 300, one 120 s step

- **Settings:** no warm-up, VUs 20 / 1000.
- **Notes:**
  - First 30 s collapsed: p50 3 s, 840 failed (`pool has been exhausted` after the 3 s timeout), `maxVUs` 1000 reached.
  - Then the remaining 80 s ran stable at 300: p95 75-180 ms per 10 s. So 300 can be sustained once it has calmed down.
  - `pg_stat_activity` sampled during the collapse: all 30 connections busy, 5-13 of them waiting on a row lock, and many `idle in transaction` (holding the row lock, waiting for the API to send the next command).

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped |
|--------------|----------|----------------|---------|
| 300          | 3150.00  | 2.40           | 1,057   |

### S. 300, 300, 300 with no pause

- **Settings:** warm-up 150, pause 0, VUs 20 / 1000.
- **Notes:**
  - The jump from 150 to 300 collapsed for about 40 s (p50 up to 2.5 s). After that it stayed stable through the rest of step 1 and all of steps 2 and 3.
  - From about 3 minutes in, 30% of requests failed in about 1 ms with status 0: `wsarecv: An existing connection was forcibly closed by the remote host` on the tunnel's port. The server side was fine (p95 under 250 ms). The tunnel still answered afterwards.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped |
|--------------|----------|----------------|---------|
| 300          | 2640.00  | 0.00           | 878     |
| 300          | 193.88   | 0.00           | 102     |
| 300          | 224.72   | 29.76          | 90      |

### T. As Q, but at most 100 VUs

- **Settings:** warm-up 150, pause 30 s, VUs 50 / 100.
- **Notes:** no collapse over 1 s. p50 about 15 ms; the p95 comes from the first ~10 s of each step and short blips.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped |
|--------------|----------|----------------|---------|
| 300          | 383.63   | 0.00           | 865     |
| 300          | 303.21   | 0.00           | 394     |
| 300          | 520.76   | 0.00           | 1,210   |

### U. As T, but 10 s pause

- **Settings:** warm-up 150, pause 10 s, VUs 50 / 100.
- **Notes:** slow from the first step on and never recovered: about 240 req/s got through, p50 200-400 ms. Postgres checked right after: `section` is 136 kB, almost all updates are HOT (rewritten in place), autovacuum every few minutes, so no bloat.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped |
|--------------|----------|----------------|---------|
| 300          | 612.66   | 0.00           | 3,791   |
| 300          | 1440.00  | 0.07           | 7,930   |
| 300          | 784.48   | 0.00           | 3,872   |

### V. As Q, but 30 VUs (= the API's connection pool)

- **Settings:** warm-up 150, pause 30 s, VUs 30 / 30.
- **Notes:**
  - Step 1: p50 5 ms, the full 300 req/s.
  - About 10 s into step 2 (10:16:29), the same 30 requests in flight got slow (p50 90 ms) and throughput fell to about 200 req/s for the rest of the run. Postgres' checkpoint (every 5 min) ran at 10:16:23, but Q's slow periods did not match the checkpoints.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped |
|--------------|----------|----------------|---------|
| 300          | 44.84    | 0.00           | 59      |
| 300          | 248.29   | 0.00           | 4,577   |
| 300          | 271.64   | 0.00           | 5,572   |

### W. As V, with `synchronous_commit = off`

- **Settings:** as V. Before the run: `ALTER DATABASE booking SET synchronous_commit = off` and the API's connections terminated, so commits do not wait for the disk. Reset afterwards (`ALTER DATABASE booking RESET synchronous_commit`).
- **Notes:** no better than V: about 230 req/s got through. So waiting for the disk is not what makes it slow. The three steps were within 8 ms of each other.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped |
|--------------|----------|----------------|---------|
| 300          | 264.94   | 0.00           | 4,108   |
| 300          | 260.31   | 0.00           | 3,929   |
| 300          | 268.13   | 0.00           | 4,613   |

### X. Staircase 150-350 with 30 VUs

- **Settings:** warm-up 150, pause 30 s, VUs 30 / 30, `synchronous_commit` back on.
- **Notes:**
  - No zigzag: p95 and dropped iterations both rise with the rate. p95 goes over 200 ms at 250.
  - Requests that got through per second: 150, 190, 209, 190, 202. The ceiling is about 200 req/s. Above it, p95 stops rising (at most 30 requests can wait at once), and the overload shows as dropped iterations instead.

| Step (req/s) | p95 (ms) | Error rate (%) | Dropped |
|--------------|----------|----------------|---------|
| 150          | 58.58    | 0.00           | 0       |
| 200          | 179.95   | 0.00           | 574     |
| 250          | 224.88   | 0.00           | 2,456   |
| 300          | 293.79   | 0.00           | 6,623   |
| 350          | 285.88   | 0.00           | 8,852   |

## Y. Scenario 2's setup, X from 100 with `script.js` (writes, 100-350)

- **Purpose:** candidate for the real Baseline (writes): X's settings, run with `script.js` itself.
- **Used as:** `2. Baseline (writes) - run 1` in `results.md`.
- **Date:** 2026-11-26, 11:10:15-11:20:19
- **Setup:** as Q-X, same cluster. Database reset just before (README step 6, `sold` = 0, `VACUUM FULL`). `script.js` temporarily changed to `preAllocatedVUs: 30` and `maxVUs: 30` in the warm-up and in every step (not committed).
- **Command:** `k6 run -e MODE=writes -e START=100 -e STEP=50 -e STEPS=6 -e BASE_URL=<url> LoadTest-k6/script.js`
- **Step size:** 50 req/s
- **Screenshots:** none
- **Notes:**
  - 66,732 requests, 0 failed.
  - `dropped_iterations`: 0 at 100, 0 at 150, 913 at 200, 4,401 at 250, 6,085 at 300, 8,834 at 350. k6 warned `reached 30 active VUs` once in the warm-up and once in each step from 200.
  - Requests that got through per second: 100, 150, 185, 177, 199, 203. Same ceiling of about 200 req/s as X.
  - p95 goes over 200 ms at 250 and stays over, as in X. 100 is slower than 150 (89 vs 52 ms).
  - CPU from k6's `CPU per step` lines. Postgres at 350 (0.15) is lower than at 300, although just as many requests got through.

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
| 100          | 89.23    | 0.00           | 0.23            | 0.15                 |
| 150          | 52.43    | 0.00           | 0.21            | 0.15                 |
| 200          | 192.32   | 0.00           | 0.21            | 0.19                 |
| 250          | 280.43   | 0.00           | 0.24            | 0.24                 |
| 300          | 275.20   | 0.00           | 0.22            | 0.24                 |
| 350          | 283.10   | 0.00           | 0.18            | 0.15                 |
