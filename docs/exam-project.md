# Exam project: event booking platform (decisions so far)

What the assignment requires (baseline, principle menu, fit criteria) lives in `docs/assignment.md`. This file holds only the decisions about this project.

Scenario: a major event's ticket sales open and a rush of buyers hits the system. Demoed with a load generator that simulates the rush.

## Domain decisions

- **Invariant:** a seat can never be sold twice.
- **Reservation model:** a user holds 4 seats for ~10 minutes while paying. Unpaid holds expire and the seats become available again.
- **Seat authority:** a write database decides seat ownership atomically (e.g. `UPDATE ... WHERE owner IS NULL`).
- **Always pick a section first.** No "best available seats" across sections.
- **Same-section rule:** a user's 4 seats are always in one section, so a reservation never spans databases.
- **Hold expiry is lazy.** No sweeper, no Redis TTL. A seat is free if `status = 'available' OR (status = 'held' AND hold_until < now)`. A `sold` seat never matches, whatever `hold_until` says.
- **Payment is simulated:** a button that calls `/confirm`.
- **Confirm is an atomic claim, checked by the server:** `UPDATE seat SET status='sold' WHERE id=@id AND owner=@user AND status='held' AND hold_until > now`. 0 rows updated means "hold expired".
- **Frontend countdown is UX only.** The server is the authority.
- **Dropped on purpose:** late payment, refunds, and extending the hold while a payment is in flight. A late confirm just returns "hold expired".

## Z-scaling design

- Several write databases, each owning some venue sections. A router maps section -> database. Sections outnumber databases, so several sections share one database.
- Plan for it from day one: the design must work with one database and a router with a single entry, so adding a second database is a config change, not a rewrite.

## Demo evidence

- A load generator plus metrics/logs (Prometheus, module 9) from the simulated rush.

## Open questions

- Which components are x-scaled? (Guess: the stateless API. Maybe a separate seat-map read service.)
- What is the caching position? (Seat-map reads are the likely candidate. The write database stays the authority.)
- What does the demo show as the bottleneck: seat-map reads or reserve writes?
- Hot sections (front rows) can overload one database.
- Which menu principles from `docs/assignment.md` does this project implement?
