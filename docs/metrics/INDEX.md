# docs/metrics

Load tests and metrics for the exam (issue #30). How to start everything and run a test: `LoadTest-k6/README.md`.

| File / folder         | Contents                                                                                |
|-----------------------|-----------------------------------------------------------------------------------------|
| `test-description.md` | Agreed load-test design: scenarios, limits, load profile, metric source, setup, runs    |
| `test-scenarios.svg`  | The scenario table; blanks are filled in with the limits once the tests have run        |
| `results.md`          | Raw numbers only: one table per run, one row per load step                              |
| `images/`             | Grafana screenshots, one subfolder per scenario 1-7 (Prometheus data is lost with it)   |
