# CLAUDE.md

## Barebone principles

This is a **learning repository**. Its code is read by a student trying to understand an architecture, not run by users who depend on it. Optimise every line for *"a beginner can follow this in one pass"* — not for robustness, generality, or elegance. The usual production instincts are the thing making this code unreadable, so set them down here.

1. **One scenario.** Name the single concrete case the code must handle, then build for
   exactly that: one request shape, one file format, one caller, one happy user. Writing
   for inputs nothing sends yet is the largest single source of code a student can't
   follow — it adds branches whose motivation is invisible in the repo.
2. **Happy path only.** No guards, retries, `try`/`catch`, fallbacks, or error branches —
   unless the failure *is* the mechanism being taught. A crash is an acceptable and
   informative outcome here; it points straight at the line that broke.
3. **One representation per concept.** One class or record per idea, used end to end. No
   DTOs, no mappers, no translation layers. If a type is awkward to serialise or share,
   change that type — adding a layer to avoid touching code you own trades one edit for a
   permanent extra hop the reader must follow.
4. **No interface until the second implementation actually runs.** An abstraction earns
   its place by having two live callers *today*, not by being plausible later. One
   interface with one implementation is a file the reader opens for nothing.
5. **Spelled out beats clever.** A six-line `foreach` a student can trace beats a one-line
   LINQ chain. Fewer lines is not the goal; fewer things to hold in your head at once is.
   Prefer obvious names and explicit steps over compression.
6. **Cosmetic change is not an improvement.** Only restructure when the change removes
   something principles 1–5 name — a branch, a hop, an abstraction, a widened input. A file
   that satisfies 1–5 is done, however plain it looks; a file that violates one isn't
   spared by being tidy. Renaming, reordering and general tidying cost the reader a
   re-read and remove nothing.
7. **Say where control comes from when the page can't.** A student reads top to bottom, so
   anywhere the next line to run isn't the next line on the page — a route/delegate
   registration whose handler lives elsewhere, an event binding in markup calling a method
   defined further down, a callback passed to a library — add a one-line comment at the
   definition naming what triggers it and when. Without it, the only way to learn a method
   runs on every request, or on every click, is to already know the framework.

   The most important case of this is a hand-off that leaves the file entirely — an HTTP
   call, a call into another project/object, anything the debugger can't step into. Mark
   that line with an ALL CAPS `// LOOK HERE!` comment naming what's on the other side (which
   file, which service). A student skimming a file should be able to spot, at a glance,
   every point where "what happens next" stops being answerable from what's on screen.

**Line count is not the metric.** Cutting a layer removes lines; expanding a clever
one-liner into steps a student can trace adds them. Both are wins here. What's being
minimised is how much a reader has to hold in their head at once — so a change that grows
the file and shrinks that load is a good change, and shorter is only evidence, never the
goal.

**Dropped on purpose, not forgotten.** Error handling, validation, and generality get
added back on request, once the mechanism underneath is understood. So whenever you skip
something a production version would have, say so in one line — in the plan, or in a code
comment. Silent narrowing is how simple code turns into subtly wrong code.

## Canvas course material

The `canvas/` folder holds the downloaded course (Arkitekturprincipper i praksis). It is **gitignored (not tracked)**, so it exists only on the original machine and may be missing in a fresh clone or on another branch checkout - check that it exists before relying on it. Everything about its structure and how to use it is in `canvas/INDEX.md` - read that first.

## Exam project

The event booking platform decisions live in `docs/exam-project.md` - read it before working on the exam project.

## Agent skills

### Issue tracker

GitHub Issues via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. See `docs/agents/domain.md`.
