import type { SystemConnection } from "../../domain/connection/SystemConnection";
import { confirmSystemConnection } from "../../application/boiler-room/connections/confirmSystemConnection";
import { overrideSystemConnection } from "../../application/boiler-room/connections/overrideSystemConnection";
import { resolveSystemConnections } from "../../application/boiler-room/connections/resolveSystemConnections";
import { connectionLabel, translateConnection, translateReview } from "../../shared/formatting/boilerRoomFormatters";

export const SystemConnectionList = ({
  connections,
  onConnection,
}: {
  connections: ReturnType<typeof resolveSystemConnections>;
  onConnection: (connection: SystemConnection) => void;
}) => (
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
);
