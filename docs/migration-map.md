# Migration Map

## Audit of `boilerplan-ai`

- Stack: Next 16, React 19, Redux Toolkit, Vitest.
- Main UI: `src/widgets/boiler-room-editor/BoilerRoomEditor.tsx` assembles one large editor with catalog, plan, schematic, sheet, validation, review and exports.
- Useful clean domain models: `Project`, `Room`, `EquipmentDefinition`, `EquipmentInstance`, `ConnectionPoint`, `WorldConnectionPoint`, `SystemConnection`, `PipingRoute`, `EngineeringDrawing`, `CadDrawing`, evidence and review types.
- Useful services: `BoilerRoomSheetDrawingService`, `EngineeringDrawingToCadService`, `AsciiDxfWriter`, SVG/CSV/JSON exporters, validation rules, evidence report, missing data questionnaire, engineering review.
- Useful tests: geometry, connection points, system connections, pipe routing, validation, evidence, sheet drawing, exporters, review.
- Evidence dataset: old `data/evidence/typical-standalone-boiler-room` is a good reference, but it mixes pilot placeholders with working artifacts.

## Transfer Decisions

- Ported as ideas: CAD chain `EngineeringDrawing -> CadDrawing -> AsciiDxfWriter`, world connection point math, body/service-zone geometry, pilot catalog facts, evidence/rule shape, readiness/report thinking.
- Rewritten: project model, project inputs, equipment instance overrides, system connection statuses, readiness categories, export package rules, UI shell and workspaces.
- Not carried over: one-screen `BoilerRoomEditor`, markdown/demo clutter, old Next runtime, broad mock boiler catalog as real data, final “questions for engineer” output model.
- Kept only as dev fixture: old mock boiler idea is represented as `boiler-250kw-dev` and cannot pass final readiness.

## Why New App

v2 is not an in-place refactor. The old app was a vertical pilot; v2 needs clean boundaries from the start: domain and application logic outside React, separate workspaces, formal draft/final readiness, explicit evidence status and CAD export independent of SVG.
