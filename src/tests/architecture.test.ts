import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const srcRoot = new URL("../", import.meta.url).pathname;

const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });

describe("architecture boundaries", () => {
  it("keeps domain/application free from React imports", () => {
    const files = [...filesUnder(join(srcRoot, "domain")), ...filesUnder(join(srcRoot, "application"))].filter((file) => file.endsWith(".ts"));
    const offenders = files.filter((file) => /from ["']react["']|react\/jsx-runtime/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("keeps App.tsx as the shell instead of a hidden workspace monolith", () => {
    const app = readFileSync(join(srcRoot, "app", "App.tsx"), "utf8");
    expect(app.split("\n").length).toBeLessThanOrEqual(300);
    expect(app).not.toMatch(/const\s+(ProjectInputsWorkspace|EquipmentWorkspace|PlanWorkspace|SchematicWorkspace|DrawingWorkspace|ReadinessWorkspace|ExportWorkspace|InspectorPanel|EquipmentCardEditor|ConnectionPointPreview|EquipmentPlanSymbol)\b/);
  });

  it("keeps the FSD widget and feature slices populated", () => {
    const expectedSlices = [
      "widgets/project-inputs-workspace/ProjectInputsWorkspace.tsx",
      "widgets/equipment-workspace/EquipmentWorkspace.tsx",
      "widgets/plan-workspace/PlanWorkspace.tsx",
      "widgets/schematic-workspace/SchematicWorkspace.tsx",
      "widgets/drawing-workspace/DrawingWorkspace.tsx",
      "widgets/readiness-workspace/ReadinessWorkspace.tsx",
      "widgets/export-workspace/ExportWorkspace.tsx",
      "widgets/inspector-panel/InspectorPanel.tsx",
      "features/equipment-editor/EquipmentCardEditor.tsx",
      "features/connection-point-editor/ConnectionPointPreview.tsx",
      "features/plan-editor/EquipmentPlanSymbol.tsx",
      "shared/config/workspaces.ts",
      "shared/formatting/boilerRoomFormatters.ts",
      "shared/ui/ZoomControls.tsx",
    ];

    const emptySlices = expectedSlices.filter((slice) => readFileSync(join(srcRoot, slice), "utf8").trim().length < 100);
    expect(emptySlices).toEqual([]);
  });
});
