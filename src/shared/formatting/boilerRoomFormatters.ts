export const categoryLabel = (category: string) => ({
  boiler: "Котлы",
  header: "Коллекторы",
  valve: "Арматура",
  pump: "Насосы",
  filter: "Фильтры",
  sensor: "КИП",
  flue: "Дымоход",
  dev_fixture: "DEV fixture",
}[category] ?? "Другое");

export const equipmentMark = (item: EquipmentWithPlacement): string => {
  if (item.instance.role === "primary_boiler") return "К1";
  if (item.instance.role === "supply_header") return "КП1";
  if (item.instance.role === "return_header") return "КО1";
  if (item.instance.role === "supply_shutoff") return "ЗК1";
  if (item.instance.role === "return_shutoff") return "ЗК2";
  if (item.instance.role === "gas_shutoff") return "ЗКГ1";
  return item.instance.label.length <= 8 ? item.instance.label : item.instance.label.slice(0, 8);
};

export const shortEquipmentName = (item: EquipmentWithPlacement): string => {
  if (item.definition.category === "boiler") return "котел RGT-100";
  if (item.instance.role === "supply_header") return "коллектор подачи";
  if (item.instance.role === "return_header") return "коллектор обратки";
  if (item.definition.category === "valve") return item.instance.role === "gas_shutoff" ? "кран газ DN25" : "кран DN32";
  return item.definition.name;
};

export const translateCategory = (category: string) => ({
  input: "Исходные данные",
  equipment: "Оборудование",
  placement: "Размещение",
  connection: "Соединения",
  routing: "Трассы",
  calculation: "Расчеты",
  drawing: "Чертеж",
  evidence: "Источники",
}[category] ?? category);

export const translateReadiness = (value: string) => ({
  draft: "черновик",
  incomplete: "не завершено",
  blocked: "заблокировано",
  readyForDraftDxf: "готово к черновому DXF",
  readyForFinalPackage: "готово к финальному пакету",
}[value] ?? value);

export const translateExport = (value: string) => ({ draft_available: "черновик доступен", final_blocked: "финал заблокирован", final_ready: "финал готов" }[value] ?? value);
export const translateReview = (value: string) => ({ draft: "черновик", needs_data: "нужны данные", needs_confirmation: "нужно подтвердить", verified: "проверено", resolved: "закрыто", not_applicable: "не применимо", blocked: "блокер", manual_cad_action: "ручное CAD-действие" }[value] ?? value);
export const translateConnection = (value: string) => ({ auto_detected: "найдено автоматически", user_confirmed: "подтверждено", user_overridden: "переопределено", blocked: "заблокировано", ambiguous: "неоднозначно" }[value] ?? value);
export const translateSeverity = (value: string) => ({ info: "инфо", warning: "предупреждение", error: "ошибка", blocker: "блокер" }[value] ?? value);
export const translateData = (value: string) => ({ unknown: "неизвестно", placeholder: "заглушка, требует замены", user_provided: "от пользователя", catalog: "каталог", passport: "паспорт", calculated: "расчет", verified: "проверено", overridden: "уточнено", not_applicable: "не применимо", blocked: "блокер" }[value] ?? value);
export const translatePointType = (value: string) => ({ supply: "подача", return: "обратка", gas: "газ", flue: "дымоход", electric: "электрика", signal: "сигнал", drain: "дренаж", "make-up": "подпитка", other: "другое" }[value] ?? value);
export const translateDirection = (value?: string) => ({ left: "влево", right: "вправо", top: "вверх на плане", bottom: "вниз на плане", front: "фронт", back: "зад", up: "вверх", down: "вниз" }[value ?? ""] ?? "не задано");
export const pointColor = (type: string) => ({ supply: "#dc2626", return: "#2563eb", gas: "#a16207", flue: "#475569", electric: "#7c3aed", signal: "#0891b2" }[type] ?? "#0369a1");
export const stroke = (layer: string) => layer === "PIPE_SUPPLY" ? "#b91c1c" : layer === "PIPE_RETURN" ? "#1d4ed8" : layer === "PIPE_GAS" ? "#a16207" : layer === "WARNING" ? "#b45309" : "#111827";
export const sourceStatusText = (source: string, confidence: number): string => `Источник: ${source}. Уверенность ${Math.round(confidence * 100)}%.`;
export const exportFileLabel = (file: string): string => ({
  "project.draft.json": "JSON проекта",
  "equipment.draft.csv": "CSV состава оборудования",
  "plan.draft.svg": "SVG плана помещения",
  "sheet.draft.svg": "SVG листа A3",
  "drawing.draft.dxf": "DXF черновой",
  "diagnostic-report.draft.md": "Диагностический отчет",
  "cover-letter.draft.md": "Сопроводительное письмо",
}[file] ?? file);
export const connectionLabel = (itemId: string, pointId: string): string => {
  const item = {
    inst_boiler_1: "К1",
    inst_supply_header: "КП1",
    inst_return_header: "КО1",
    inst_valve_supply_1: "ЗК1",
    inst_valve_return_1: "ЗК2",
    inst_valve_gas_1: "ЗКГ1",
  }[itemId] ?? itemId;
  const point = {
    supply: "подача",
    return: "обратка",
    gas: "газ",
    flue: "дымоход",
    "supply-main": "вход подачи",
    "return-main": "вход обратки",
    outlet: "выход",
    inlet: "вход",
  }[pointId] ?? pointId;
  return `${item}: ${point}`;
};
import type { EquipmentWithPlacement } from "../../domain/equipment/Equipment";
