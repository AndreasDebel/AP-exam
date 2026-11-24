# Results

Raw numbers only: one section per run, one table row per load step. No interpretation here.

All runs are made on the same machine, so the rows can be compared:

- **Machine:** Intel Core i3-12100F (4 cores, 8 threads), 32 GB RAM, Windows 11. Minikube started with `--cpus=6 --memory=6000`.

Each section is one k6 run; each table row is one load step in it. Copy the step's p95 and error rate from k6's summary (the lines tagged `scenario:rate_<step>`) (see `test-description.md`). Add or delete step rows as needed. CPU: from the `CPU per step` lines k6 prints just above its summary (busiest API pod and busiest Postgres pod, 0.25 = its limit). Under **Notes**: the API image tag, any step that showed `dropped_iterations`, and anything unusual.

## 1. Baseline (reads) - run 1

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 1. Baseline (reads) - run 2

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 1. Baseline (reads) - run 3

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 2. Baseline (writes) - run 1

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 2. Baseline (writes) - run 2

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 2. Baseline (writes) - run 3

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 3. X-scaling the API (reads) - run 1

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 4. Z-scaling the DB (writes) - run 1

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 5. Redis cache (reads) - run 1

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 (ms) | Error rate (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|----------|----------------|-----------------|----------------------|
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |
|              |          |                |                 |                      |

## 6. Fault isolation (writes) - run 1

- **Date:**
- **Step size:** ___ req/s
- **Notes:**

| Step (req/s) | p95 db:a (ms) | Error rate db:a (%) | p95 db:b (ms) | Error rate db:b (%) | CPU API (cores) | CPU Postgres (cores) |
|--------------|---------------|---------------------|---------------|---------------------|-----------------|----------------------|
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |
|              |               |                     |               |                     |                 |                      |

## 7. Oversell check (writes) - run 1

- **Date:**
- **Rate:** ___ req/s for 1 minute
- **Notes:**

| Database | Capacity (each section) | Highest `sold` | sold <= capacity |
|----------|-------------------------|----------------|------------------|
| a        | 100                     |                | yes / no         |
| b        | 100                     |                | yes / no         |

- **k6 `refusals` (409 answers):**
