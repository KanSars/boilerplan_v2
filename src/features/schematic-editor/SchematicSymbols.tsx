export const SchematicNode = ({ x, y, w, h, label, note, compact = false }: { x: number; y: number; w: number; h: number; label: string; note: string; compact?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="4" className="schematicNode" />
    {!compact && <circle cx={x + w / 2} cy={y + 48} r="24" className="schematicBoilerCircle" />}
    <text x={x + w / 2} y={compact ? y + 25 : y + 88} textAnchor="middle" className="schematicNodeLabel">{label}</text>
    <text x={x + w / 2} y={compact ? y + 43 : y + 118} textAnchor="middle" className="schematicNodeNote">{note}</text>
  </g>
);

export const SchematicValve = ({ x, y, label }: { x: number; y: number; label: string }) => (
  <g>
    <line x1={x - 34} y1={y} x2={x + 34} y2={y} className="schematicValveLine" />
    <polygon points={`${x - 20},${y - 18} ${x},${y} ${x - 20},${y + 18}`} className="schematicValve" />
    <polygon points={`${x + 20},${y - 18} ${x},${y} ${x + 20},${y + 18}`} className="schematicValve" />
    <text x={x} y={y - 28} textAnchor="middle" className="schematicSmall">{label}</text>
  </g>
);

export const SchematicArrow = ({ x, y, color, direction }: { x: number; y: number; color: string; direction: "left" | "right" | "up" }) => {
  const points = direction === "left"
    ? `${x + 12},${y - 8} ${x - 4},${y} ${x + 12},${y + 8}`
    : direction === "up"
      ? `${x - 8},${y + 12} ${x},${y - 4} ${x + 8},${y + 12}`
      : `${x - 12},${y - 8} ${x + 4},${y} ${x - 12},${y + 8}`;
  return <polygon points={points} fill={color} />;
};
