import { useState } from "react";
import type { EquipmentDefinition, EquipmentWithPlacement } from "../../domain/equipment/Equipment";
import { translateData, translateDirection, translatePointType } from "../../shared/formatting/boilerRoomFormatters";
import { ConnectionPointPreview } from "../connection-point-editor/ConnectionPointPreview";

export const EquipmentCardEditor = ({ item, catalog, onCatalogUpdate }: { item: EquipmentWithPlacement; catalog: EquipmentDefinition[]; onCatalogUpdate: (catalog: EquipmentDefinition[]) => void }) => {
  const [pointId, setPointId] = useState(item.definition.connectionPoints[0]?.id ?? "");
  const updateDefinition = (patch: Partial<EquipmentDefinition>) => {
    onCatalogUpdate(catalog.map((definition) => (definition.id === item.definition.id ? { ...definition, ...patch } : definition)));
  };
  const updateConnectionPoint = (id: string, patch: Partial<EquipmentDefinition["connectionPoints"][number]>) => {
    updateDefinition({ connectionPoints: item.definition.connectionPoints.map((point) => (point.id === id ? { ...point, ...patch } : point)) });
  };
  const selectedPoint = item.definition.connectionPoints.find((point) => point.id === pointId) ?? item.definition.connectionPoints[0];
  return (
    <div className="editorPane">
      <h3>{item.instance.label}: карточка оборудования</h3>
      <div className="cardEditorGrid">
        <label>Название<input value={item.definition.name} onChange={(event) => updateDefinition({ name: event.target.value })} /></label>
        <label>Производитель<input value={item.definition.manufacturer ?? ""} onChange={(event) => updateDefinition({ manufacturer: event.target.value })} /></label>
        <label>Модель<input value={item.definition.model ?? ""} onChange={(event) => updateDefinition({ model: event.target.value })} /></label>
      </div>
      <h4>Предпросмотр точек подключения</h4>
      <ConnectionPointPreview item={item} selectedPointId={pointId} onSelect={setPointId} />
      <h4>Точки подключения каталога</h4>
      <div className="cpGrid">
        {item.definition.connectionPoints.map((point) => (
          <button key={point.id} type="button" className={point.id === pointId ? "cpRow active" : "cpRow"} onClick={() => setPointId(point.id)}>
            <strong>{point.label}</strong>
            <span>{translatePointType(point.type)} · DN{point.dnMm ?? "-"} · {translateDirection(point.direction)}</span>
            <small>X {point.localX}, Y {point.localY}, Z {point.localZ ?? "-"} · {translateData(point.status)} · {point.confidence}</small>
          </button>
        ))}
      </div>
      {selectedPoint && (
        <div className="pointEditor">
          <label>Метка<input value={selectedPoint.label} onChange={(event) => updateConnectionPoint(selectedPoint.id, { label: event.target.value })} /></label>
          <label>X, мм<input type="number" value={selectedPoint.localX} onChange={(event) => updateConnectionPoint(selectedPoint.id, { localX: Number(event.target.value) })} /></label>
          <label>Y, мм<input type="number" value={selectedPoint.localY} onChange={(event) => updateConnectionPoint(selectedPoint.id, { localY: Number(event.target.value) })} /></label>
          <label>Z, мм<input type="number" value={selectedPoint.localZ ?? ""} onChange={(event) => updateConnectionPoint(selectedPoint.id, { localZ: event.target.value ? Number(event.target.value) : undefined })} /></label>
          <label>DN, мм<input type="number" value={selectedPoint.dnMm ?? ""} onChange={(event) => updateConnectionPoint(selectedPoint.id, { dnMm: event.target.value ? Number(event.target.value) : undefined })} /></label>
        </div>
      )}
      <small>Это режим правки карточки каталога. Правка конкретного экземпляра находится в правом инспекторе как override.</small>
    </div>
  );
};


