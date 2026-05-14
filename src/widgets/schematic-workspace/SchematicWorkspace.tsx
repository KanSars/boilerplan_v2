import type { SystemConnection } from "../../domain/connection/SystemConnection";
import { confirmSystemConnection } from "../../application/boiler-room/connections/confirmSystemConnection";
import { overrideSystemConnection } from "../../application/boiler-room/connections/overrideSystemConnection";
import { resolveSystemConnections } from "../../application/boiler-room/connections/resolveSystemConnections";
import type { HelpKey } from "../../shared/config/workspaces";
import { connectionLabel, translateConnection, translateReview } from "../../shared/formatting/boilerRoomFormatters";
import { ZoomControls } from "../../shared/ui/ZoomControls";

export const SchematicWorkspace = ({
  connections,
  onConfirmAll,
  onConnection,
  onHelp,
  zoom,
  onZoomChange,
}: {
  connections: ReturnType<typeof resolveSystemConnections>;
  onConfirmAll: () => void;
  onConnection: (connection: SystemConnection) => void;
  onHelp: (key: HelpKey) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => (
  <section>
    <div className="workspaceHeader toolbarHeader">
      <div>
        <p className="eyebrow">Логика системы</p>
        <h2>Схема соединений</h2>
      </div>
      <div className="buttonRow">
        <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConfirmAll}>Подтвердить все автосвязи</button>
        <ZoomControls value={zoom} onChange={onZoomChange} />
      </div>
    </div>
    <div className="schematicViewport">
      <div className="schematicStage" style={{ width: `${980 * zoom}px`, height: `${500 * zoom}px` }}>
        <svg className="schematicSvg" viewBox="0 0 980 500" role="img" aria-label="Технологическая схема соединений">
          <text x="28" y="34" className="schematicTitle">Принципиальная схема подключений</text>
          <SchematicNode x={90} y={210} w={150} h={150} label="К1" note="Котел RGT-100" />
          <SchematicNode x={640} y={122} w={250} h={64} label="КП1" note="Коллектор подачи DN32" compact />
          <SchematicNode x={640} y={368} w={250} h={64} label="КО1" note="Коллектор обратки DN32" compact />
          <SchematicValve x={430} y={154} label="ЗК1" />
          <SchematicValve x={430} y={400} label="ЗК2" />
          <SchematicValve x={165} y={430} label="ЗКГ1" />
          <path className="schematicPipe supply" d="M240 252 L335 252 L335 154 L396 154" />
          <path className="schematicPipe supply" d="M464 154 L640 154" />
          <SchematicArrow x={560} y={154} color="#b91c1c" direction="right" />
          <path className="schematicPipe return" d="M640 400 L464 400" />
          <path className="schematicPipe return" d="M396 400 L335 400 L335 318 L240 318" />
          <SchematicArrow x={300} y={318} color="#1d4ed8" direction="left" />
          <path className="schematicPipe gas" d="M165 480 L165 464" />
          <path className="schematicPipe gas" d="M165 396 L165 360" />
          <SchematicArrow x={165} y={394} color="#a16207" direction="up" />
          <path className="schematicPipe flue" d="M165 210 L165 88" />
          <text x="344" y="138" className="schematicLabel supplyText">T1 DN32</text>
          <text x="468" y="426" className="schematicLabel returnText">T2 DN32</text>
          <text x="190" y="456" className="schematicLabel gasText">Г DN25</text>
          <text x="188" y="122" className="schematicLabel">Дымоход DN200</text>
          <text x="640" y="226" className="schematicSmall">к системе отопления</text>
          <text x="640" y="472" className="schematicSmall">от системы отопления</text>
          <g transform="translate(28 480)">
            <line x1="0" y1="0" x2="42" y2="0" className="schematicPipe supply" />
            <text x="54" y="5" className="schematicSmall">T1 подача</text>
            <line x1="180" y1="0" x2="222" y2="0" className="schematicPipe return" />
            <text x="234" y="5" className="schematicSmall">T2 обратка</text>
            <line x1="370" y1="0" x2="412" y2="0" className="schematicPipe gas" />
            <text x="424" y="5" className="schematicSmall">Г газ</text>
          </g>
        </svg>
      </div>
    </div>
    <section className="connectionDetails">
      <h3>Связи схемы ({connections.length})</h3>
      <p className="muted">Здесь подтверждаются автосвязи, переопределяются спорные решения и фиксируются ручные CAD-действия.</p>
      <div className="connectionList">
        {connections.map((connection) => (
          <article key={connection.id} className="connectionCard">
            <strong>{connection.lineType} DN{connection.dnMm ?? "-"}</strong>
            <p>{connectionLabel(connection.from.itemId, connection.from.pointId)} {"->"} {connection.to ? connectionLabel(connection.to.itemId, connection.to.pointId) : "ручное оформление"}</p>
            <span>{translateConnection(connection.status)} · {translateReview(connection.reviewStatus)}</span>
            <small>{connection.explanation}</small>
            <div className="buttonRow left">
              <button type="button" onClick={() => onConnection(confirmSystemConnection(connection, "Подтверждено в схеме"))}>Подтвердить</button>
              <button type="button" onClick={() => onConnection(overrideSystemConnection(connection, { dnMm: connection.dnMm }, "Пользователь подтвердил ручное переопределение связи"))}>Переопределить</button>
              <button type="button" onClick={() => onConnection({ ...connection, status: "blocked", reviewStatus: "manual_cad_action", source: "user", userDecision: { decidedAt: new Date().toISOString(), reason: "Требуется ручное CAD-оформление", previousStatus: connection.status } })}>В ручное CAD</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  </section>
);

const SchematicNode = ({ x, y, w, h, label, note, compact = false }: { x: number; y: number; w: number; h: number; label: string; note: string; compact?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="4" className="schematicNode" />
    {!compact && <circle cx={x + w / 2} cy={y + 48} r="24" className="schematicBoilerCircle" />}
    <text x={x + w / 2} y={compact ? y + 25 : y + 88} textAnchor="middle" className="schematicNodeLabel">{label}</text>
    <text x={x + w / 2} y={compact ? y + 43 : y + 118} textAnchor="middle" className="schematicNodeNote">{note}</text>
  </g>
);

const SchematicValve = ({ x, y, label }: { x: number; y: number; label: string }) => (
  <g>
    <line x1={x - 34} y1={y} x2={x + 34} y2={y} className="schematicValveLine" />
    <polygon points={`${x - 20},${y - 18} ${x},${y} ${x - 20},${y + 18}`} className="schematicValve" />
    <polygon points={`${x + 20},${y - 18} ${x},${y} ${x + 20},${y + 18}`} className="schematicValve" />
    <text x={x} y={y - 28} textAnchor="middle" className="schematicSmall">{label}</text>
  </g>
);

const SchematicArrow = ({ x, y, color, direction }: { x: number; y: number; color: string; direction: "left" | "right" | "up" }) => {
  const points = direction === "left"
    ? `${x + 12},${y - 8} ${x - 4},${y} ${x + 12},${y + 8}`
    : direction === "up"
      ? `${x - 8},${y + 12} ${x},${y - 4} ${x + 8},${y + 12}`
      : `${x - 12},${y - 8} ${x + 4},${y} ${x - 12},${y + 8}`;
  return <polygon points={points} fill={color} />;
};


