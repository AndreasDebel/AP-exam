# Exam assignment: what it requires (independent of any system)

This file defines the assignment only. It says nothing about which system the group builds. The structure of the chosen project lives in `docs/exam-project.md`. Source texts: `canvas/modules/08 5 - X-skalering af kode - 08-09-2026/02 eksamensprojektet_v1_0.md` and the study regulation in `canvas/modules/12 1 - Intro & Principper - 18-08-2026/04 valgfag studieordning.visuals.md`.

## What is assessed

- The exam is an **individual oral examination**: 5-10 min presentation, 15-20 min questioning, 5 min grading. Internal censor, 7-point scale, one overall judgement.
- In the presentation each student shows a **self-chosen number of architecture principles** and demonstrates in a working system how they are implemented.
- The project itself is not graded. It is the basis for the exam: it must be implemented well enough to demo and defend.
- The project is group work, but every student defends alone and chooses which principles to present.
- The project is a **walking skeleton**: quality of the architecture comes first, features second.
- Before the project period starts, the group's one-page *projektdefinition* must be approved by the teachers. It is a separate artifact and is not part of this file.

## Baseline (always built, whatever the system)

| Requirement                   | Assignment wording                                  | In this project                                       |
|-------------------------------|-----------------------------------------------------|-------------------------------------------------------|
| .NET / C#                     | "skal" (must)                                       | Mandatory                                             |
| Kubernetes via Minikube       | "om muligt", e.g. Kubernetes                        | Fixed. Single-node limit is acknowledged at the exam  |
| X-scaling                     | "mulighed for skalering i x-aksen"                  | Chosen components run as several replicas in the demo |
| Monitoring                    | "skal være muligt at monitorere"                    | Live metrics running in the demo                      |
| Caching                       | "forholder til brug af caching"                     | A real caching component, running                     |
| Z-scaling of the database     | "anviser hvorledes"                                 | Actually running, not only described                  |
| Before/after measurements     | "kan udarbejdes tests" (optional in the text)       | Required for both x-scaling and z-scaling             |
| UML class, object, deploy     | "forventes" (expected)                              | All three diagrams shown at the exam                  |
| Demo of the system in drift   | "forventes en kort demo"                            | Short demo, then architecture, code base, environment |

The assignment text is softer than this table in several rows ("om muligt", "kan", "anviser"). The group has chosen the stricter reading on purpose.

## Menu (the group decides which to implement)

Principles from the AKF overview (Module 1 deck, slide 3). The group picks which to implement. Each student then chooses which of the implemented ones to present.

Already forced by the baseline: Scale Out Not Up, Design for at Least 2 Axes of Scale (x and z), Design to Be Monitored, Stateless Systems.

Candidates the group may add:

- Asynchronous Design
- Design for Rollback
- Design to Be Disabled
- Isolate Faults
- N+1 Design
- Build Small, Release Fast, Fail Small
- Use Mature Technologies
- Automation over People
- Design for Multiple Live Sites
- Buy When Non-Core
- Commodity Hardware

For now the plan is to try Asynchronous Design, Design for Rollback, Design to Be Disabled and Isolate Faults / N+1. Cutting any of them is a group decision made when it comes up.

## Fit criteria for the chosen system

Any system is allowed (the search engine from the course, a school project, an internship idea). It must have:

1. A stateless service with enough load to justify several replicas (x-scaling).
2. Data with a natural partition key, so it can be split across databases (z-scaling).
3. A read-heavy path worth caching.
4. Something measurable under load, so before/after numbers can be produced.

## Not decided here

- Which system the group builds.
- Which menu principles are implemented, and what is cut if time runs short.
- The projektdefinition text and its dates.
