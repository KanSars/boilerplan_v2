# Product Scope

Boilerplan AI v2 prepares a DXF boiler-room drawing for final CAD оформление and generates an accompanying package with inputs, accepted decisions, checks, sources, limitations and manual CAD actions.

Pilot scope is intentionally narrow:

- Russia / РФ.
- Standalone gas hot-water boiler room.
- RGT-100 / КСВА-100 around 99 kW.
- Natural gas, about 12 m3/h, gas pressure up to 3 kPa.
- DN32 T1/T2, DN25 gas, DN200 flue.
- STOUT SDG-0016-005002 supply and return headers.
- Shutoff valves are real equipment instances, not symbols.

MVP means narrow but strict. Draft exports can be incomplete and must say so. Final package is blocked by unresolved blockers, `needs_data`, placeholder facts that affect engineering decisions, and unconfirmed review-required items.

AI is scoped as an assistant for strict evidence questions and letter drafting from structured facts. It does not inspect SVG, invent requirements, or replace formal geometry/calculation logic.
