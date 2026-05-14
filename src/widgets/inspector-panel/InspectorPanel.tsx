import type { EquipmentWithPlacement } from "../../domain/equipment/Equipment";
import { resolveWorldConnectionPoints } from "../../application/boiler-room/equipment/resolveConnectionPoints";
import type { HelpKey } from "../../shared/config/workspaces";
import { translateData, translatePointType, translateReview } from "../../shared/formatting/boilerRoomFormatters";
import { NumberEdit } from "../../shared/ui/NumberEdit";
import { ConnectionPointPreview } from "../../features/connection-point-editor/ConnectionPointPreview";

export const InspectorPanel = ({
  selected,
  selectedPointId,
  onPointSelect,
  onLabel,
  onRotate,
  onDelete,
  onPointPatch,
  onHelp,
}: {
  selected: EquipmentWithPlacement;
  selectedPointId: string;
  onPointSelect: (id: string) => void;
  onLabel: (id: string, label: string) => void;
  onRotate: () => void;
  onDelete: () => void;
  onPointPatch: (field: "localX" | "localY" | "localZ" | "dnMm", value: number | undefined) => void;
  onHelp: (key: HelpKey) => void;
}) => {
  const worldPoints = selected.placement ? resolveWorldConnectionPoints(selected.instance, selected.definition, selected.placement) : [];
  const point = worldPoints.find((entry) => entry.pointId === selectedPointId) ?? worldPoints[0];
  return (
    <aside className="inspector">
      <p className="eyebrow">Инспектор объекта</p>
      <h2>{selected.instance.label}</h2>
      <label>Обозначение<input value={selected.instance.label} onChange={(event) => onLabel(selected.instance.id, event.target.value)} /></label>
      <dl>
        <dt>Тип</dt><dd>{selected.definition.name}</dd>
        <dt>Позиция</dt><dd>{selected.placement?.placed ? `${selected.placement.xMm}, ${selected.placement.yMm}, ${selected.placement.rotationDeg}°` : "не размещено"}</dd>
        <dt>Статус</dt><dd>{translateReview(selected.instance.status)}</dd>
        <dt>Уточнения</dt><dd>{selected.instance.connectionPointOverrides.length}</dd>
      </dl>
      <ConnectionPointPreview item={selected} selectedPointId={point?.pointId ?? ""} onSelect={onPointSelect} compact />
      <h3>Точки подключения экземпляра</h3>
      <div className="cpGrid">
        {worldPoints.map((entry) => (
          <button key={entry.pointId} type="button" className={entry.pointId === point?.pointId ? "cpRow active" : "cpRow"} onClick={() => onPointSelect(entry.pointId)}>
            <strong>{entry.label}</strong>
            <span>{translatePointType(entry.type)} · DN{entry.dnMm ?? "-"} · мир X {Math.round(entry.xMm)}, Y {Math.round(entry.yMm)}</span>
            <small>{entry.overrides.length ? "есть уточнение экземпляра" : "из карточки каталога"} · {translateData(entry.status)}</small>
          </button>
        ))}
      </div>
      {point && (
        <div className="pointEditor" onMouseEnter={() => onHelp("override")}>
          <h4>Уточнение выбранной точки</h4>
          <NumberEdit label="X, мм" value={point.localX} onChange={(value) => onPointPatch("localX", value)} />
          <NumberEdit label="Y, мм" value={point.localY} onChange={(value) => onPointPatch("localY", value)} />
          <NumberEdit label="Z, мм" value={point.localZ} onChange={(value) => onPointPatch("localZ", value)} />
          <NumberEdit label="DN, мм" value={point.dnMm} onChange={(value) => onPointPatch("dnMm", value)} />
        </div>
      )}
      <div className="buttonRow">
        <button type="button" onClick={onRotate}>Повернуть на 90°</button>
        <button type="button" className="dangerButton" onClick={onDelete}>Удалить</button>
      </div>
    </aside>
  );
};


