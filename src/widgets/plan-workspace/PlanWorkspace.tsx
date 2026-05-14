import { type PointerEvent, useRef, useState } from "react";
import type { EquipmentDefinition, EquipmentWithPlacement } from "../../domain/equipment/Equipment";
import { buildPreliminaryRoutes } from "../../application/boiler-room/routing/buildPreliminaryRoutes";
import { resolveWorldConnectionPoints } from "../../application/boiler-room/equipment/resolveConnectionPoints";
import type { HelpKey } from "../../shared/config/workspaces";
import { categoryLabel, equipmentMark, pointColor, shortEquipmentName } from "../../shared/formatting/boilerRoomFormatters";
import { ZoomControls } from "../../shared/ui/ZoomControls";
import { EquipmentPlanSymbol } from "../../features/plan-editor/EquipmentPlanSymbol";

export const PlanWorkspace = ({
  equipment,
  routes,
  selectedId,
  addMenuOpen,
  catalog,
  onSelect,
  onMove,
  onRotate,
  onDelete,
  onConnect,
  onConfirmConnections,
  onAdd,
  onToggleAdd,
  onHelp,
  zoom,
  onZoomChange,
}: {
  equipment: EquipmentWithPlacement[];
  routes: ReturnType<typeof buildPreliminaryRoutes>;
  selectedId: string;
  addMenuOpen: boolean;
  catalog: EquipmentDefinition[];
  onSelect: (id: string) => void;
  onMove: (id: string, xMm: number, yMm: number) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onConnect: () => void;
  onConfirmConnections: () => void;
  onAdd: (definition: EquipmentDefinition) => void;
  onToggleAdd: () => void;
  onHelp: (key: HelpKey) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const origin = { x: 0, y: 0 };
  const room = equipment[0]?.placement ? { widthMm: 6000, lengthMm: 4500 } : { widthMm: 6000, lengthMm: 4500 };
  const margin = 600;
  const planViewBox = `${-margin} ${-margin} ${room.widthMm + margin * 2} ${room.lengthMm + margin * 2}`;
  const pointFromEvent = (event: PointerEvent<SVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { xMm: 0, yMm: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformed = point.matrixTransform(svg.getScreenCTM()?.inverse());
    return { xMm: transformed.x - origin.x, yMm: transformed.y - origin.y };
  };
  const startDrag = (event: PointerEvent<SVGGElement>, item: EquipmentWithPlacement) => {
    if (!item.placement) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    setDrag({ id: item.instance.id, dx: point.xMm - item.placement.xMm, dy: point.yMm - item.placement.yMm });
    onSelect(item.instance.id);
  };
  const startPan = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 || drag) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPan({ x: event.clientX, y: event.clientY, scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop });
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (drag) {
      const point = pointFromEvent(event);
      onMove(drag.id, Math.round((point.xMm - drag.dx) / 25) * 25, Math.round((point.yMm - drag.dy) / 25) * 25);
      return;
    }
    if (pan) {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.x);
      viewport.scrollTop = pan.scrollTop - (event.clientY - pan.y);
    }
  };
  const stopPointer = () => {
    setDrag(null);
    setPan(null);
  };
  return (
    <section>
      <div className="workspaceHeader toolbarHeader">
        <div>
          <p className="eyebrow">Физическое размещение</p>
          <h2>План помещения</h2>
        </div>
        <div className="buttonRow">
          <button type="button" onMouseEnter={() => onHelp("add")} onClick={onToggleAdd}>Добавить объект</button>
          <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConnect}>Соединить автоматически</button>
          <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConfirmConnections}>Подтвердить связи</button>
          <ZoomControls value={zoom} onChange={onZoomChange} />
        </div>
      </div>
      {addMenuOpen && (
        <div className="addMenu">
          {catalog.filter((definition) => definition.category !== "dev_fixture").map((definition) => (
            <button key={definition.id} type="button" onClick={() => onAdd(definition)}>
              {definition.name}<small>{categoryLabel(definition.category)}</small>
            </button>
          ))}
        </div>
      )}
      <div ref={viewportRef} className="zoomViewport">
        <div className="zoomContent" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
          <svg
            ref={svgRef}
            className="planCanvas"
            viewBox={planViewBox}
            role="img"
            aria-label="План помещения"
            onPointerDown={startPan}
            onPointerMove={move}
            onPointerUp={stopPointer}
            onPointerCancel={stopPointer}
          >
        <defs>
          <pattern id="grid" width="500" height="500" patternUnits="userSpaceOnUse">
            <path d="M 500 0 L 0 0 0 500" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          </pattern>
        </defs>
        <rect x={-margin} y={-margin} width={room.widthMm + margin * 2} height={room.lengthMm + margin * 2} fill="#ffffff" />
        <rect x={origin.x} y={origin.y} width={room.widthMm} height={room.lengthMm} fill="url(#grid)" stroke="#0f172a" strokeWidth="35" />
        <text x={origin.x} y={origin.y - 260} fontSize="150">Рабочий план размещения · сетка 500 мм</text>
        {routes.map((route) => route.points.length > 1 && (
          <polyline
            key={route.id}
            points={route.points.map((point) => `${origin.x + point.xMm},${origin.y + point.yMm}`).join(" ")}
            fill="none"
            stroke={route.medium === "natural_gas" ? "#a16207" : route.id.includes("t2") ? "#1d4ed8" : "#b91c1c"}
            strokeWidth="70"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={route.status === "needs_confirmation" ? "160 110" : undefined}
          />
        ))}
        {equipment.map((item) => {
          if (!item.placement?.placed) return null;
          const x = origin.x + item.body.xMm;
          const y = origin.y + item.body.yMm;
          const width = item.body.widthMm;
          const height = item.body.depthMm;
          const selected = selectedId === item.instance.id;
          const mark = equipmentMark(item);
          return (
            <g key={item.instance.id} onPointerDown={(event) => startDrag(event, item)} className={selected ? "selectedSvg draggable" : "draggable"}>
              <rect x={x - item.definition.serviceZones.leftMm} y={y - item.definition.serviceZones.rearMm} width={width + item.definition.serviceZones.leftMm + item.definition.serviceZones.rightMm} height={height + item.definition.serviceZones.frontMm + item.definition.serviceZones.rearMm} fill="#e0f2fe" opacity="0.28" stroke="#38bdf8" strokeWidth="18" strokeDasharray="80 50" />
              <EquipmentPlanSymbol x={x} y={y} width={width} height={height} item={item} />
              <text x={x + width / 2} y={y + height / 2 + 45} textAnchor="middle" fontSize="120" fontWeight="700">{mark}</text>
              {selected && resolveWorldConnectionPoints(item.instance, item.definition, item.placement).map((point) => <circle key={point.pointId} cx={origin.x + point.xMm} cy={origin.y + point.yMm} r="55" fill={pointColor(point.type)} stroke="#ffffff" strokeWidth="16" />)}
            </g>
          );
        })}
        <g transform={`translate(0 ${room.lengthMm + 320})`}>
          <text x="0" y="0" fontSize="140" fontWeight="700">Состав</text>
          {equipment.slice(0, 8).map((item, index) => (
            <text key={item.instance.id} x={(index % 4) * 1800} y={240 + Math.floor(index / 4) * 190} fontSize="120">
              {equipmentMark(item)} - {shortEquipmentName(item)}
            </text>
          ))}
        </g>
          </svg>
        </div>
      </div>
      <div className="planActions">
        <span className="planHint">Навигация: тяните пустое место плана. Редактирование: тяните объект. Голубой контур — зона обслуживания.</span>
        <button type="button" onClick={() => onRotate(selectedId)}>Повернуть выбранный</button>
        <button type="button" className="dangerButton" onClick={() => onDelete(selectedId)}>Удалить выбранный</button>
      </div>
    </section>
  );
};

