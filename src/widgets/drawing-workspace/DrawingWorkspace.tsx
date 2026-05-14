import { buildEngineeringDrawing } from "../../application/boiler-room/drawing/buildEngineeringDrawing";
import { stroke } from "../../shared/formatting/boilerRoomFormatters";
import { ZoomControls } from "../../shared/ui/ZoomControls";

export const DrawingWorkspace = ({
  drawing,
  zoom,
  onZoomChange,
}: {
  drawing: ReturnType<typeof buildEngineeringDrawing>;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => (
  <section>
    <div className="workspaceHeader toolbarHeader">
      <div>
        <p className="eyebrow">Модель чертежного листа</p>
      <h2>Чертёж A3</h2>
        <p>Здесь лист для CAD-оформления: рамка, штамп, план, схема, легенда, DN и предупреждения черновика.</p>
      </div>
      <div className="buttonRow">
        <ZoomControls value={zoom} onChange={onZoomChange} />
      </div>
    </div>
    <div className="drawingViewport">
      <svg
        className="sheetCanvas"
        style={{ width: `${840 * zoom}px`, height: `${594 * zoom}px` }}
        viewBox="0 0 420 297"
        role="img"
        aria-label="Предпросмотр листа A3"
      >
        {drawing.entities.map((entity, index) => {
          if (entity.type === "rect") return <rect key={index} x={entity.x} y={entity.y} width={entity.width} height={entity.height} fill={entity.fill ?? "none"} stroke={stroke(entity.layer)} strokeWidth="0.35" />;
          if (entity.type === "line") return <polyline key={index} points={entity.points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke={stroke(entity.layer)} strokeWidth="0.5" />;
          if (entity.type === "circle") return <circle key={index} cx={entity.cx} cy={entity.cy} r={entity.r} fill={entity.fill ?? "#fff"} stroke={stroke(entity.layer)} strokeWidth="0.35" />;
          return <text key={index} x={entity.x} y={entity.y} fontSize={entity.height} textAnchor={entity.align ?? "start"} fontWeight={entity.weight ?? "normal"} fill={stroke(entity.layer)}>{entity.value}</text>;
        })}
      </svg>
    </div>
  </section>
);


