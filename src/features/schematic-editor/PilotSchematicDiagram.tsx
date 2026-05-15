import { SchematicArrow, SchematicNode, SchematicValve } from "./SchematicSymbols";

export const PilotSchematicDiagram = ({ zoom }: { zoom: number }) => (
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
);
