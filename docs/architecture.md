# Architecture

The application uses Vite + React + TypeScript with CSS in `src/app/globals.css`.

Main boundaries:

- `domain`: pure TypeScript models and value types. No React.
- `application/boiler-room`: use cases for setup, equipment, placement, connections, routing, validation, drawing, export, evidence and AI-review prompts.
- `infrastructure`: catalog, SVG, CAD and DXF implementations.
- `features/widgets/entities`: reserved UI composition areas as the app grows.
- `app`: React shell/bootstrap only.

Workflow is workspace-based, not a wizard:

- Inputs.
- Equipment.
- Plan.
- Schematic.
- Drawing sheet.
- Readiness.
- Export.

Derived state is recalculated: resolved equipment, connection points, world geometry, system connections, readiness, drawing and CAD. User decisions are persisted in the project model: connection point overrides, system connection overrides and route overrides.

DXF export follows:

`Project + catalog + readiness -> EngineeringDrawing -> CadDrawing -> ASCII DXF`

SVG is only a preview/export surface, not the source for DXF.
