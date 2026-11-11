# Exam project: event booking platform (decisions so far)

What the assignment requires (baseline, principle menu, fit criteria) lives in `docs/assignment.md`. This file holds only the decisions about this project. Terms are defined in `GLOSSARY.md`.

Scenario: a major event's ticket sales open and a rush of buyers hits the system. Demoed with a load generator that simulates the rush.

## Domain decisions

- **Invariant:** a section can never sell more places than its capacity.
- **Buyer flow:** the buyer picks a section (never specific seats) and buys 1 to 4 places in one step. Flow: `docs/visuals/buy-without-hold-flow.svg`.
- **No holds.** Payment is simulated with one button, so there is no slow step between choosing and paying that a hold would need to protect. Cost: if the section sells out after the buyer last looked, the refusal comes at the moment of buying, not earlier.
- **One buy, one section.** A buy never spans sections, so it never spans databases.
- **No seat numbers.** Places are interchangeable. A ticket says "section X, n places".
- **Section state:** a section has a capacity and a `sold` count. Nothing else is stored.
- **Availability:** `capacity - sold`.
- **Seat authority:** the section's write database decides, atomically, in one transaction that locks the section row.
- **Payment is simulated:** a button that calls `/buy`.
- **Buy is an atomic claim, checked by the server:** in one transaction, lock the section row, and if `capacity - sold >= n`, then `sold += n`. Otherwise answer "only k places left" and change nothing.
- **The number on screen is a hint.** The server is the authority.
- **Dropped on purpose:** holds (and with them hold expiry and a countdown), seat numbers, a seat map, best-available seating, real payment, refunds.

## Scaling design

- **Database engine:** Postgres, one container per database. SQLite was rejected: it is a file inside the process, so API replicas would have to share a file, and "several databases" would not be real database servers.
- **Z-scaling:** several write databases, each owning some sections. A router maps section -> database. Demo: 4 sections, 2 databases (2 sections each). The "before" is 1 database owning all 4. The design starts with one database and a router entry per section, so adding a second database is a config change, not a rewrite.
- **X-scaling:** only the stateless API runs as several replicas. All booking state lives in the database, never in API memory.
- **Caching:** Redis caches section availability only, with a TTL of 1-2 s. It is advisory. `/buy` always goes to the write database, so a stale number can only cause a clean "only k places left" answer.
- **Hot sections:** the load generator spreads requests evenly across sections. Skew toward one section would overload one database. That is a documented limitation, not built around.

## Demo evidence

A load generator plus metrics/logs (Prometheus, module 9). Two separate load tests:

| Test   | Load                 | Before          | After              | Shows              |
|--------|----------------------|-----------------|--------------------|--------------------|
| Reads  | Availability queries | 1 API, no cache | 3 APIs and Redis   | x-scaling, caching |
| Writes | Buy                  | 1 database      | 2 databases        | z-scaling          |

## Menu principles

- Forced by the baseline: Scale Out Not Up, Design for at Least 2 Axes of Scale, Design to Be Monitored, Stateless Systems.
- Added: **Isolate Faults** (kill one database, the other's sections keep selling) and **Design to Be Disabled** (a per-section kill switch the API checks).
- Cut: Asynchronous Design, Design for Rollback. Revisit only if time is left over.
