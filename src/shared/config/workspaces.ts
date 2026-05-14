export type Workspace = "inputs" | "equipment" | "plan" | "schematic" | "drawing" | "readiness" | "export";
export type HelpKey = "inputs" | "equipment" | "plan" | "schematic" | "drawing" | "readiness" | "export" | "connect" | "add" | "override" | "final";

export const workspaces: Array<{ id: Workspace; label: string; help: HelpKey }> = [
  { id: "inputs", label: "Исходные данные", help: "inputs" },
  { id: "equipment", label: "Оборудование", help: "equipment" },
  { id: "plan", label: "План", help: "plan" },
  { id: "schematic", label: "Схема", help: "schematic" },
  { id: "drawing", label: "Чертёж", help: "drawing" },
  { id: "readiness", label: "Проверка", help: "readiness" },
  { id: "export", label: "Экспорт", help: "export" },
];

export const helpText: Record<HelpKey, string> = {
  inputs: "Паспорт проекта: размеры, РФ, тип котельной, топливо, источники и достоверность данных.",
  equipment: "Состав проекта и карточки оборудования. Здесь редактируются габариты, зоны обслуживания и точки подключения.",
  plan: "Физический план. Оборудование можно перетаскивать, поворачивать, добавлять и соединять предварительными трассами.",
  schematic: "Логика подключений: T1/T2, газ, дымоход. Автосвязи нужно подтвердить или переопределить.",
  drawing: "Чертежный лист A3 с CAD-обозначениями. Это preview модели EngineeringDrawing, не источник DXF.",
  readiness: "Проверка готовности. Финальный пакет нельзя сформировать, пока есть блокеры, нужные данные или неподтвержденные решения.",
  export: "Черновые выгрузки доступны всегда. Финальный пакет доступен только после закрытия блокеров.",
  connect: "Строит предварительные трассы по логическим связям. Для финала спорные связи нужно подтвердить.",
  add: "Добавляет новый экземпляр оборудования из каталога и сразу размещает его на плане.",
  override: "Правка точки подключения для конкретного экземпляра. Каталог при этом не меняется.",
  final: "Финальный пакет блокируется, если остались инженерные неизвестности или данные-заглушки.",
};
