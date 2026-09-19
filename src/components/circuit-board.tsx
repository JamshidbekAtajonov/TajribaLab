import { terminals, type CircuitState, type TerminalId, type Wire } from "@/lib/circuit";

const order: TerminalId[] = ["src_pos", "src_neg", "amm_a", "amm_b", "res_a", "res_b", "volt_a", "volt_b"];

function wirePath(a: TerminalId, b: TerminalId): string {
  const p1 = terminals[a];
  const p2 = terminals[b];
  const midX = (p1.x + p2.x) / 2;
  return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
}

export function CircuitBoard({ state, onTerminalClick, onWireClick }: { state: CircuitState; onTerminalClick: (t: TerminalId) => void; onWireClick: (index: number) => void }) {
  return (
    <svg viewBox="0 0 680 440" role="img" aria-label="Elektr zanjiri sxemasi" className="circuit-svg">
      {/* Manba */}
      <rect x="45" y="120" width="50" height="200" rx="8" className="circuit-source" />
      <text x="70" y="100" textAnchor="middle" className="circuit-label">Manba</text>
      <line x1="55" y1="160" x2="85" y2="160" className="circuit-plate" />
      <line x1="60" y1="180" x2="80" y2="180" className="circuit-plate" />

      {/* Ampermetr */}
      <circle cx="310" cy="60" r="40" className="circuit-meter" />
      <text x="310" y="66" textAnchor="middle" className="circuit-meter-label">A</text>

      {/* Rezistor (zigzag) */}
      <path d="M 560 110 L 540 140 L 580 165 L 540 190 L 580 215 L 540 240 L 580 265 L 560 300 L 560 330" className="circuit-resistor" />
      <text x="600" y="220" textAnchor="middle" className="circuit-label">Rezistor</text>

      {/* Voltmetr */}
      <circle cx="540" cy="390" r="40" className="circuit-meter" />
      <text x="540" y="396" textAnchor="middle" className="circuit-meter-label">V</text>

      {/* Sichilgan simlar */}
      {state.wires.map((w: Wire, i) => (
        <path key={i} d={wirePath(w[0], w[1])} className="circuit-wire" onClick={() => onWireClick(i)}>
          <title>O‘chirish uchun bosing</title>
        </path>
      ))}

      {/* Terminallar */}
      {order.map((id) => (
        <g key={id} onClick={() => onTerminalClick(id)} className="circuit-terminal-group">
          <circle cx={terminals[id].x} cy={terminals[id].y} r={state.selected === id ? 11 : 8} className={`circuit-terminal${state.selected === id ? " circuit-terminal-selected" : ""}`}>
            <title>{terminals[id].label}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}
