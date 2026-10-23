# Event booking walking skeleton: one Blazor WASM page that books a ticket

## Context

First slice of a larger system (API, DB, proxy, k8s later). This ticket creates a standalone Blazor WebAssembly app in `ui/` with one page where a visitor books a ticket for one event.

**The one scenario:** One visitor opens the page, sees the single hard-coded event ("Spring Concert", its date, tickets left), types their name, clicks **Book ticket**, and sees "Booked: <name>" with tickets-left down by one.

**Decisions already made with the user:**
- Skeleton for a larger system, so there is a marked seam for the future API call. Beat: a finished one-page app.
- `net10.0`, project `EventBooking.Ui` in `ui/`. The API will be `EventBooking.Api` beside it.
- One page, so no router, layout or `_Imports.razor`. Beat: the template's `App` + `Router` + `MainLayout`.
- No backend in this ticket. Booking is in memory and lost on refresh. Next tickets: API with in-memory storage, then a DB.
- Seam is a one-line comment in `BookTicket()`. Beat: a `BookingApi` class with one fake implementation.
- Hard-coded event, no styling, run with `dotnet run` only (no Docker yet).
- Git repo at the `ita-6sem` root with a .NET `.gitignore`, remote `AndreasDebel/AP-exam` (public). Secrets are never committed. Recheck when `infra/` appears.

## Step 1: `ui/EventBooking.Ui.csproj`

From `dotnet new blazorwasm --empty -n EventBooking.Ui -o ui -f net10.0`, unchanged. WASM needs this SDK, so it can't shrink.

## Step 2: `ui/Program.cs`

About 8 lines. `Book` is the root component mounted on `#app`. No `HeadOutlet`, no `HttpClient`.

## Step 3: `ui/wwwroot/index.html`

`#app` div and the Blazor script, plus the template's preload link and import map (the framework fingerprinting needs them). No CSS, favicon or error UI.

## Step 4: `ui/Book.razor`

The whole app, about 35 lines: four fields plus the event data, and one method, `BookTicket()`. The method is not called `Book` because a member can't share its class's name. Comments name what triggers `@bind` and `@onclick`, and mark where the API call will go.

## Step 5: repo setup

`git init -b main` at the root, `dotnet new gitignore`, public repo `AP-exam`, one local commit. Push only after the user says so.

## Deliberately skipped

- **Router, `App.razor`, `MainLayout.razor`, `_Imports.razor`** — one page. Add back by making `App` the root component again.
- **Backend and database** — the scenario only needs a booking to happen in the browser. Next tickets.
- **`Event` / `Booking` classes** — one event and one booking, so plain fields. Add when a second event or persisted booking exists.
- **Validation (empty name, sold out)** — one cooperative visitor. Add `if (attendeeName == "") return;` and a `ticketsLeft > 0` check.
- **Multiple events** — add a `List` and a `foreach`.
- **Persistence across refresh** — not part of the mechanism.
- **Styling, favicon, error UI** — not part of the mechanism.
- **Docker / k8s** — belongs to the ticket that introduces `infra/` and the proxy.
- **Tests** — one visible click. Add bUnit once there is logic worth pinning.

## Verification

1. `dotnet build` in `ui/` gives `Build succeeded`, 0 warnings, 0 errors. (Done.)
2. `dotnet run` prints `Now listening on: http://localhost:5286`, and the served page contains `<div id="app">`. (Done.)
3. In a browser, the page shows "Spring Concert", "Tickets left: 50", a textbox and a button. Typing "Anna" and clicking **Book ticket** shows "Booked: Anna" and "Tickets left: 49". (Not yet checked in a browser.)
4. The observation the exercise is about: DevTools → Network shows no request when you book, because `BookTicket()` runs in the browser.
