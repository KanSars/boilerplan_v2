import type { EquipmentWithPlacement } from "../../domain/equipment/Equipment";

export const EquipmentPlanSymbol = ({ x, y, width, height, item }: { x: number; y: number; width: number; height: number; item: EquipmentWithPlacement }) => {
  if (item.definition.category === "valve") {
    const cy = y + height / 2;
    const cx = x + width / 2;
    return (
      <g>
        <line x1={x} y1={cy} x2={x + width} y2={cy} stroke="#111827" strokeWidth="18" />
        <polygon points={`${cx - 70},${cy - 70} ${cx},${cy} ${cx - 70},${cy + 70}`} fill="#ffffff" stroke="#111827" strokeWidth="18" />
        <polygon points={`${cx + 70},${cy - 70} ${cx},${cy} ${cx + 70},${cy + 70}`} fill="#ffffff" stroke="#111827" strokeWidth="18" />
      </g>
    );
  }
  if (item.definition.category === "header") {
    const cy = y + height / 2;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="#ffffff" stroke="#111827" strokeWidth="18" />
        <line x1={x + 40} y1={cy} x2={x + width - 40} y2={cy} stroke="#111827" strokeWidth="22" />
        <circle cx={x + width * 0.25} cy={cy} r="32" fill="#ffffff" stroke="#111827" strokeWidth="14" />
        <circle cx={x + width * 0.5} cy={cy} r="32" fill="#ffffff" stroke="#111827" strokeWidth="14" />
        <circle cx={x + width * 0.75} cy={cy} r="32" fill="#ffffff" stroke="#111827" strokeWidth="14" />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#f8fafc" stroke="#111827" strokeWidth="18" />
      <circle cx={x + width / 2} cy={y + height * 0.28} r={Math.min(width, height) * 0.12} fill="#ffffff" stroke="#111827" strokeWidth="14" />
      <line x1={x + width * 0.24} y1={y + height * 0.68} x2={x + width * 0.76} y2={y + height * 0.68} stroke="#111827" strokeWidth="20" />
    </g>
  );
};


