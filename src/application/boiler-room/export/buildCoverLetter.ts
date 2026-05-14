import type { CoverLetter } from "../../../domain/export/CoverLetter";
import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ProjectReadinessReport } from "../../../domain/validation/Validation";

export const buildCoverLetter = (project: Project, catalog: EquipmentDefinition[], readiness: ProjectReadinessReport): CoverLetter => ({
  projectSummary: `${project.name}: подготовка DXF для финального оформления в CAD в области пилота РФ, отдельно стоящая газовая водогрейная котельная.`,
  inputDataSummary: [
    `Помещение ${project.room.widthMm} x ${project.room.lengthMm} x ${project.room.heightMm} мм.`,
    `Мощность ${project.projectInputs.targetPowerKw} кВт, график ${project.projectInputs.temperatureSchedule.supplyC}/${project.projectInputs.temperatureSchedule.returnC}.`,
    `Топливо: природный газ, теплоноситель: вода.`,
  ],
  equipmentSummary: project.equipmentItems.map((item) => {
    const definition = catalog.find((entry) => entry.id === item.definitionId);
    return `${item.label}: ${definition?.name ?? item.definitionId}`;
  }),
  acceptedSolutions: [
    "Арматура моделируется как обычное оборудование с connection points.",
    "DXF строится по цепочке EngineeringDrawing -> CadDrawing -> ASCII DXF, не из SVG.",
    "Draft exports доступны всегда, final package требует закрытия blockers и review-required состояний.",
  ],
  drawingPackageSummary: [
    "Лист A3 содержит план размещения, технологическую схему, легенду, DN и title block.",
    `Текущий статус готовности: ${readiness.status}.`,
  ],
  manualCadActions: readiness.manualCadActions,
  limitations: [
    "Пакет не является подписанной рабочей документацией и не заменяет ответственность проектировщика.",
    "Placeholder/dev источники явно маркируются и блокируют final package, если влияют на инженерные данные.",
  ],
  evidenceSources: project.evidenceSnapshotRefs,
  generatedAt: new Date().toISOString(),
  version: project.version,
});

export const formatCoverLetterMarkdown = (letter: CoverLetter): string => [
  "# Сопроводительное письмо",
  "",
  letter.projectSummary,
  "",
  "## Исходные данные",
  ...letter.inputDataSummary.map((item) => `- ${item}`),
  "",
  "## Состав оборудования",
  ...letter.equipmentSummary.map((item) => `- ${item}`),
  "",
  "## Принятые решения",
  ...letter.acceptedSolutions.map((item) => `- ${item}`),
  "",
  "## Пакет чертежа",
  ...letter.drawingPackageSummary.map((item) => `- ${item}`),
  "",
  "## Ручные CAD-действия",
  ...(letter.manualCadActions.length ? letter.manualCadActions.map((item) => `- ${item.title}: ${item.description}`) : ["- Нет блокирующих ручных инженерных неизвестностей; оформительские CAD-действия перечисляются отдельно при появлении."]),
  "",
  "## Ограничения",
  ...letter.limitations.map((item) => `- ${item}`),
  "",
  `Сформировано: ${letter.generatedAt}`,
].join("\n");
