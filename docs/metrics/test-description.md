# Test description

How the numbers in `test-scenarios.svg` are produced. Part of issue #30. This file and the table record the agreed design; where they disagree with `docs/exam-project.md`, these win.

## Goal

Each scenario should either **show** that a change improves the numbers, or **explain with data** why it does not in our one-laptop setup. The explanation matters as much as the improvement: it tells a future project what to fix.

## Scenarios

Each row changes one thing from the row it is compared with. Everything else stays the same.

| #   | Row               | Setup                                   | Load   | Compare with         |
|-----|-------------------|-----------------------------------------|--------|----------------------|
| 1   | Baseline (reads)  | 1 API · 1 Postgres · Redis off          | reads  | -                    |
| 2   | Baseline (writes) | 1 API · 1 Postgres · Redis off          | writes | -                    |
| 3   | X-scaling the API | 3 API · 1 Postgres · Redis off          | reads  | 1. Baseline (reads)  |
| 4   | Z-scaling the DB  | 1 API · 2 Postgres · Redis off          | writes | 2. Baseline (writes) |
| 5   | Redis cache       | 1 API · 1 Postgres · Redis on (2 s TTL) | reads  | 1. Baseline (reads)  |
| 6   | Fault isolation   | 4's setup, `postgres-b` stopped         | writes | 4. Z-scaling the DB  |
| 7   | Oversell check    | 4's setup, low section capacity         | writes | - (pass/fail)        |

- **Reads** = `GET /sections/{id}`. **Writes** = `POST /sections/{id}/buy`. Never mixed in one run, so it is clear which one hits the limit.
- **How to switch setup:**
  - API copies: `replicas` in `k8s/api.yaml`.
  - Redis: `CacheEnabled` in `k8s/api.yaml`.
  - 1 or 2 Postgres: in `k8s/db-credentials.yaml`, point `b`'s `Host` at `postgres-a-0.postgres-a` for 1 Postgres. Then every section uses database a.
  - Run `kubectl apply -k k8s` after each change.
- **6. Fault isolation** asks: when database b dies, do buyers on database a notice? k6 runs the same load as 4. Z-scaling, spread over all 40 sections, so requests to the dead database keep loading the shared API (as buyers would keep trying). k6 tags every request with its database (`db:a` / `db:b`) and prints the response time for each separately. The table values come from `db:a`. Also write down how the `db:b` requests failed (a fast error, or a hang). The per-section kill switch (Design to Be Disabled) is shown in the demo, not load-tested.
- **7. Oversell check** is a correctness test, not a speed test. Before the run, set a low capacity in both databases: `UPDATE section SET capacity = 100 WHERE id BETWEEN 101 AND 140;`. After the run, check `sold <= capacity` in both databases, and read k6's `refusals` count to show that refusals actually happened.

## What each cell records

Speed rows (1-6, all except 7. Oversell check):

- **p95 > 200 ms at:** the first load step (req/s) where p95 goes over 200 ms.
- **errors > 1% at:** the first load step (req/s) where the error rate goes over 1%.
- **step size:** the step increment used, so the reader can see how precise the two limits are (a limit of 300 with step 50 means "between 250 and 300").

200 ms is our own target response time (SLO), not a law. Users stay in flow up to about 1 s (Nielsen); 200 ms on the server leaves room for network and UI. Normal local latency is a few ms to a few tens of ms, so crossing 200 ms means requests are queuing: the system is saturated.

An **error** is any answer that is not 2xx or 409. Sections have so many places that they never sell out in a speed run, so 409 does not happen there anyway.

## Load profile: all steps in one k6 run

One k6 run holds every step of a scenario run: 1 minute at a fixed rate per step (k6 `constant-arrival-rate`), then a 30 s pause, then the next step at a higher rate. `START`, `STEP` and `STEPS` set the first rate, the increment and the number of steps. k6's summary prints p95, error rate and `dropped_iterations` for each step separately (named after its rate, e.g. `scenario:rate_150`), and Grafana shows all the steps on one graph. Commands are in `LoadTest-k6/README.md`.

- **Step size:** decided during the Baseline runs, one for reads and one for writes, then reused unchanged for every later row of the same load type. Rows compared with each other must share a step size, or a difference may only be precision. Write it in the cell.
- **Start:** free per row. A row expected to hold more load may start higher; only the step size must match.
- **Stop:** choose `STEPS` so the run crosses both limits; if it does not, run again with a higher `START`. Or stop earlier if the person running the test judges that a limit will not be reached. Then write `> 400` in the cell, where 400 is the last step measured, and give the reason in the run's notes in `results.md`.
- **Baseline cells:** the average of the 3 runs' limits, plus **max spread**: the largest distance from that average to any one run. E.g. runs at 250 / 300 / 300 give `avg 283`, `max spread ± 33`. The 3 single values go in `results.md`.
- **k6 could not keep up:** if a step's `dropped_iterations` is above 0, k6 did not manage to send that step's rate. Write it in the run's notes: that step measured k6, not our system.

## Metric source

- **Table numbers:** k6's own summary after each run. `http_req_duration ... p(95)=` is the response time, `http_req_failed` is the error rate. k6 remembers every single response time, so its p95 is exact. (Prometheus only counts responses in "boxes", and 200 ms falls between its 100 ms and 250 ms boxes, so it would guess right where we read the limit.)
- **Explaining why:** the Grafana dashboard (`docs/Grafana_dashboards.json`): response time for reads and buys, error rate, requests per API pod, and CPU per pod. Take screenshots during the runs; Prometheus data is lost with the cluster. Reading CPU per pod when a row does not improve:
  - API pods at their limit (0.25 core each) → the API is the bottleneck. More copies help.
  - Postgres at its limit (0.25 core) → the database is the bottleneck. X-scaling cannot help; Z-scaling might.
  - Nothing at its limit → the bottleneck is outside the cluster (the `minikube service` tunnel or k6).

## Setup before testing

| Change               | What                                                                                                                                                                                                                                                                                                                                              | Serves                                                                   |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| Minikube with 6 CPUs | `minikube delete`, then `minikube start --cpus=6 --memory=6000` (Docker Desktop had about 6.6 GB to give). 6 is more than the pod limits below add up to (about 2.25 cores with 3 API copies); the pod limits, not this number, keep the laptop's 4 physical cores free for Windows and k6. Check that Docker Desktop is allowed at least 6 CPUs. | Room for every pod to reach its limit                                    |
| CPU limits           | Each API copy and each Postgres: at most 0.25 core. Redis, Prometheus, Grafana: a small cap. (In the yaml files under `resources`.) With 1 core each, no pod reached its limit even at 2200 req/s (`other-results.md`, runs A-C).                                                                                                                 | X- and Z-scaling add real cores instead of sharing the same ones         |
| CPU per pod          | Prometheus reads cAdvisor (Kubernetes' built-in meter for CPU per container); a Grafana panel shows it                                                                                                                                                                                                                                            | Explaining why a row does not improve                                    |
| DB connection cap    | `Maximum Pool Size=30` in both connection strings. 3 copies × 30 stays under Postgres' default 100                                                                                                                                                                                                                                                | Keeps "too many clients" errors out of X-scaling                         |
| 40 sections          | Speed runs use sections 101-140: 101-120 in database a, 121-140 in database b. k6 spreads requests evenly across them. Sections 1-4 are the demo's                                                                                                                                                                                                | Buys spread over many rows, so the database, not one row lock, gets busy |
| Section capacity     | 1,000,000 places, so nothing sells out in a speed run; low only in the oversell check                                                                                                                                                                                                                                                             | Keeps 409 answers out of the speed rows                                  |

Reset the databases between runs, so leftover `sold` counts never affect a run (how: `LoadTest-k6/README.md`, step 8).

## Runs

- **1-2 Baseline (reads and writes):** 3 runs each (each run = all its steps). Report the spread; it is our estimate of run-to-run variation.
- **3-7, every other row:** 1 run. Judge a difference against the Baseline spread: a difference smaller than the spread is not a result.

About 10 runs of 5-8 steps of 1.5 minutes (1 minute of load + 30 s pause), plus the oversell check, so roughly 2 hours.

## Where findings go

- `test-scenarios.svg`: blanks filled in, the one-page results sheet.
- `results.md`: raw numbers only (per step, per run). No interpretation.
- `images/`: Grafana screenshots, one subfolder per scenario (`1-baseline-reads/` … `7-oversell-check/`).

## Known error sources

- **Tunnel:** k6 reaches the API through `minikube service --url`, which carries all traffic and may become the bottleneck. It is the same for every row, so rows can still be compared. If CPU per pod shows nothing at its limit while p95 climbs, the tunnel or k6 is the likely cause.
- **One machine:** k6, the cluster, Prometheus and Grafana share the laptop's CPU and memory. The CPU limits keep the pods apart, but not k6.
- **Row locks:** every buy locks its section's row until it is done. With 40 sections this is spread out, but a real sale where everyone wants the same section would queue on that one row, and more databases would not help. That is an argument for how we would scale further (more, smaller sections).
- **Warm-up:** each step's p95 covers the whole minute, including the first seconds while the system settles.
- **Run-to-run variation:** only Baseline is repeated; other rows rely on its spread.
- **Leftover data:** reset the databases between runs.

## Next time

- Run k6 inside the cluster or on its own machine, so the tunnel and the shared laptop drop out of the numbers.
- Measure p95 inside the API too: add a 200 ms bucket to the API's response-time histogram (`api/Program.cs`), and record Prometheus' p95 next to k6's in `results.md`. Where k6's p95 is far above the API's own, the time is spent in the tunnel or k6, not in our system.
- A cluster with several nodes, so X- and Z-scaling get their own hardware instead of cores on one laptop.
