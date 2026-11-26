# docs/metrics

Load tests and metrics for the exam (issue #30). How to start everything and run a test: `LoadTest-k6/README.md`.

| File / folder         | Contents                                                                                |
|-----------------------|-----------------------------------------------------------------------------------------|
| `test-description.md` | Agreed load-test design: scenarios, limits, load profile, metric source, setup, runs    |
| `test-scenarios.svg`  | The scenario table; blanks are filled in with the limits once the tests have run        |
| `results.md`          | Raw numbers only: one table per run, one row per load step                              |
| `other-results/`      | Same tables for runs outside the scenarios (probes, setup checks); a file per scenario  |
| `error-sources.md`    | Problems met while setting up the tests, and what we do about each                      |
| `other-images/`       | Grafana screenshots for the runs in `other-results/`                                    |
| `images/`             | Grafana screenshots, one subfolder per scenario 1-7 (Prometheus data is lost with it)   |

## Status (written 2026-11-25)

Temporary note. Delete this section no later than 2026-11-28, when it is 3 days old.

- **Scenario 1, Baseline (reads):** done. 3 runs in `results.md`, p95 limit 1767 ± 33 req/s, errors from > 1850.
- **Scenario 2, Baseline (writes):** not usable yet. Runs 1-3 in `results.md` (150-500, database reset before each) give limits 200, ≤ 150 and 450. p95 zigzags instead of rising with the rate: 250, 350 and 450 are slow in every run, 300, 400 and 500 faster. Earlier runs (K-O) are in `other-results/sc2-other-results.md`.
- **Ruled out:** dead row versions from old runs. Run O on fresh databases was as slow as the runs before it.
- **Next step: troubleshoot the zigzag before more runs.** Ideas:
  - Check in Grafana (16:06-16:45) whether the slow periods come at fixed times, independent of the steps.
  - Autovacuum ran 53 times on `section`: compare its times (`log_autovacuum_min_duration = 0`) with the slow periods.
  - Postgres checkpoints (every 5 min) and CPU throttling at the 0.25 limit.
  - The API's connection pool (max 30): look for `pool has been exhausted` per step in the API log.
- **Scenarios 3-7:** not started. `test-scenarios.svg` not filled in yet.
