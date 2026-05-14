import type { EquipmentWithPlacement } from "../../domain/equipment/Equipment";
import { pointColor, translatePointType } from "../../shared/formatting/boilerRoomFormatters";

export const ConnectionPointPreview = ({ item, selectedPointId, onSelect, compact = false }: { item: EquipmentWithPlacement; selectedPointId: string; onSelect: (id: string) => void; compact?: boolean }) => {
  const width = item.definition.dimensions.widthMm;
  const depth = item.definition.dimensions.depthMm;
  const padding = 220;
  const selectedPoint = item.definition.connectionPoints.find((point) => point.id === selectedPointId) ?? item.definition.connectionPoints[0];
  return (
    <svg className={compact ? "pointPreview compact" : "pointPreview"} viewBox={`${-padding} ${-padding} ${width + padding * 2} ${depth + padding * 2}`} role="img" aria-label="Схема точек подключения">
      <rect x={-item.definition.serviceZones.leftMm} y={-item.definition.serviceZones.rearMm} width={width + item.definition.serviceZones.leftMm + item.definition.serviceZones.rightMm} height={depth + item.definition.serviceZones.frontMm + item.definition.serviceZones.rearMm} fill="#e0f2fe" stroke="#38bdf8" strokeDasharray="40 25" />
      <rect x="0" y="0" width={width} height={depth} fill="#f8fafc" stroke="#0f172a" strokeWidth="18" />
      {!compact && selectedPoint && (
        <text x="0" y={depth + 150} fontSize="80" fontWeight="700">
          {selectedPoint.label} · {translatePointType(selectedPoint.type)} · DN{selectedPoint.dnMm ?? "-"}
        </text>
      )}
      {item.definition.connectionPoints.map((point) => (
        <g key={point.id} className={point.id === selectedPointId ? "previewPoint active" : "previewPoint"} onClick={() => onSelect(point.id)}>
          <circle cx={point.localX} cy={point.localY} r="55" fill={pointColor(point.type)} />
        </g>
      ))}
    </svg>
  );
};


