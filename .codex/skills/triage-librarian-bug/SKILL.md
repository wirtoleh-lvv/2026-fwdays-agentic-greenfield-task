---
name: triage-librarian-bug
description: Investigate one reported Librarian bug by mapping it to canonical requirement IDs and OpenSpec scenarios, reproducing it where possible, tracing the browser, API, provider, or local-storage path, and identifying an evidenced root-cause hypothesis. Use for bug triage, UAT report validation, regression investigation, or deciding whether behavior is a defect, expected, environmental, or a requirement gap. Do not implement the fix.
---

# Triage a Librarian Bug

Investigate exactly one report as a read-only analyst. Do not modify code, tests, requirements, or OpenSpec artifacts.

## Normalize the Report

Record the reported behavior, expected behavior, steps, environment, input class, and any screenshots or logs. Distinguish observed facts from reporter conclusions. Ask only for information that cannot be discovered locally and materially blocks reproduction.

## Map and Trace

1. Read `AGENTS.md`, `docs/requirements/README.md`, and the narrowest relevant requirement files.
2. Find the governing OpenSpec scenarios and ADRs. If none governs the expected behavior, classify a requirement gap instead of inventing a rule.
3. Reproduce through the public seam when practical.
4. Trace the relevant path:
   - UI → state transition → browser persistence
   - UI → API route → request validation → provider adapter → response normalization
   - reload → browser persistence read → rendered library state
5. Check sibling locations for the same failure mechanism.

## Decide a Verdict

Use one verdict:

- `confirmed-defect`: observed behavior contradicts a requirement or legitimate input crashes or corrupts the flow
- `works-as-specified`: behavior matches an explicit requirement or scenario
- `environment`: configuration, browser capability, provider availability, or local environment causes the symptom
- `cannot-reproduce`: the supplied steps do not produce the symptom after documented checks
- `requirement-gap`: expected behavior is not canonically defined

## Report

Return the report summary, requirement IDs and quoted scenario names, verdict, reproduction evidence, root-cause mechanism, verified `file:line` evidence, related class members, correction direction, regression-test idea, confidence, and remaining unknowns.

Separate root cause from symptom. Do not claim certainty from static inspection alone when runtime evidence is required.
