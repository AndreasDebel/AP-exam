# Test description

How the numbers in `test-scenarios.svg` are produced. Part of issue #30. This file and the table record the design agreed in the grill session; where they disagree with `docs/exam-project.md`, these win.

## Goal

Each scenario should either **show** that a change improves the numbers, or **explain with data** why it does not in our one-laptop setup. The explanation matters as much as the improvement: it tells a future project what to fix.

## Scenarios

Each row changes one thing from its Baseline (reads or writes). Everything else stays as Baseline.

| Row                 | Setup                                   | Load   | Compare with        |
|---------------------|-----------------------------------------|--------|---------------------|
| Baseline (reads)    | 1 API · 1 Postgres · Redis off          | reads  | -                   |
| Baseline (writes)   | 1 API · 1 Postgres · Redis off          | writes | -                   |
| X-scaling the API   | 3 API · 1 Postgres · Redis off          | reads  | Baseline (reads)    |
| Z-scaling the DB    | 1 API · 2 Postgres · Redis off          | writes | Baseline (writes)   |
| Redis cache         | 1 API · 1 Postgres · Redis on (2 s TTL) | reads  | Baseline (reads)    |
| Full setup (reads)  | 3 API · 2 Postgres · Redis on           | reads  | Baseline (reads)    |
| Full setup (writes) | 3 API · 2 Postgres · Redis on           | writes | Baseline (writes)   |
| Fault isolation     | Full setup, `postgres-b` stopped        | writes | Full setup (writes) |
| Oversell check      | Full setup, low section capacity        | writes | - (pass/fail)       |

- **Reads** = `GET /sections/{id}`. **Writes** = `POST /sections/{id}/buy`. Never mixed in one run, so it is clear which one hits the limit.
- **Fault isolation** measures only the sections on `postgres-a`. The question is whether a dead database slows down the healthy sections. The per-section kill switch (Design to Be Disabled) is shown in the demo, not load-tested.
- **Oversell check** is a correctness test, not a speed test: after the run, check `sold <= capacity` in both databases, and count the 409 answers to show that refusals actually happened.

## What each cell records

Speed rows (all except the oversell check):

- **p95 > 200 ms at:** the first load step (req/s) where p95 goes over 200 ms.
- **errors > 1% at:** the first load step (req/s) where the error rate goes over 1%.
- **step size:** the step increment used, so the reader can see how precise the two limits are (a limit of 300 with step 50 means "between 250 and 300").

200 ms is our own target response time (SLO), not a law. Users stay in flow up to about 1 s (Nielsen); 200 ms on the server leaves room for network and UI. Normal local latency is a few ms to a few tens of ms, so crossing 200 ms means requests are queuing: the system is saturated.

An **error** is any answer that is not 2xx. Sections are given enough capacity that they never sell out in a speed run, so 409 ("only k places left") should not happen there.

## Load profile: stepped ramp

The load climbs in steps (k6 `ramping-arrival-rate`, which sets requests per second directly):

- **Step length:** 1 minute. The first 30 s let the system settle; the value is read from the last 30 s.
- **Step size and start:** chosen by whoever runs the test. Write it in the cell.
- **Stop:** when both limits have been crossed.

Every step is measured; the limits are read afterwards.

## Metric source

- **Table numbers:** Prometheus (built-in ASP.NET Core HTTP metrics). p95 per step: `histogram_quantile(0.95, rate(..._bucket[30s]))`, read at the end of the step.
- **Tunnel check:** run a few tests where k6's own p95 is compared with Prometheus' p95. The gap is the time spent in the `minikube service` tunnel. Write the result here.
- **Explaining why:** Grafana CPU per pod (cAdvisor). Reading it when a row does not improve:
  - All cores near 100% → the laptop is the limit, not the architecture. More nodes would help.
  - Postgres near 100%, API copies idle → the database is the bottleneck. X-scaling cannot help; Z-scaling might.
  - Everything well below 100% → the bottleneck is outside the cluster (tunnel or k6). Compare with k6's numbers.

## Setup before testing

| Change               | What                                                                                                        | Serves                                                      |
|----------------------|-------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| Minikube with 6 CPUs | `minikube delete`, then `minikube start --cpus=6 --memory=8192`. Today it is capped at 2 CPUs.              | X-scaling (2 cores would cap it); 2 left for Windows and k6 |
| cAdvisor CPU panel   | Prometheus scrapes the kubelet's built-in `/metrics/cadvisor`; a Grafana panel shows CPU per pod            | Explaining why a row does not improve                       |
| `db` metric label    | The buy handler adds `db=postgres-a` / `postgres-b` to the existing HTTP metric (`IHttpMetricsTagsFeature`) | Fault isolation; Z-scaling (load per DB)                    |
| Section capacity     | High enough that nothing sells out in a speed run; low only in the oversell check                           | Keeps 409 answers out of the speed rows                     |

`minikube delete` wipes the database volumes. Reset the databases between runs anyway, so leftover `sold` counts never affect a run.

## Runs

- **Baseline (reads and writes):** 3 runs each. Report the spread; it is our estimate of run-to-run variation.
- **Every other row:** 1 run. Judge a difference against the Baseline spread: a difference smaller than the spread is not a result.

About 13 runs of ~10 minutes, so roughly 2 hours.

## Where findings go

- `test-scenarios.svg`: blanks filled in, the one-page results sheet.
- `results.md`: raw numbers only (per step, per run). No interpretation.
- `images/`: Grafana screenshots (Prometheus data is lost when the cluster is deleted).

## Possible addition: remote load generator

All tests run with k6 on the same laptop as the cluster. A possible addition is a second set of runs with k6 on **another device**, so the load generator no longer competes with the cluster for CPU. It is not part of the table now. If we add it:

- k6 reaches the laptop through a Windows port proxy in front of the tunnel: `netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=<tunnel-port> connectaddress=127.0.0.1`, plus a firewall rule.
- Do **not** use `kubectl port-forward svc/api`: it sends all traffic to one pod, so X-scaling would show nothing.
- The port proxy is one extra hop the local runs do not have, so local and remote numbers are not fully comparable.
- Untested: reaching the API from a second device has not been tried yet.

## Known error sources

- **Tunnel:** `minikube service --url` carries all local traffic and may become the bottleneck. Measured by the tunnel check above.
- **One machine:** k6, the cluster, Prometheus and Grafana share the laptop's CPU and memory.
- **Run-to-run variation:** only Baseline is repeated; other rows rely on its spread.
- **Leftover data:** reset the databases between runs.
