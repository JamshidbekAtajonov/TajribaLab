import { focusOffset, totalMagnification, type ObjectiveId } from "@/lib/microscope";

const GRID_SIZE = 400;
const BASE_MAGNIFICATION = 100; // the grid below is drawn calibrated for 10x ocular * 10x objective

function Cell({ x, y, w, h, i, variant }: { x: number; y: number; w: number; h: number; i: number; variant: "onion" | "elodea" }) {
  const jitter = Math.sin(i * 12.9) * 4;
  if (variant === "onion") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={6} fill="#eef3e2" stroke="#8a9a6a" strokeWidth={2.5} />
        <ellipse cx={x + w * 0.4 + jitter} cy={y + h * 0.45} rx={w * 0.14} ry={h * 0.16} fill="#8a5fa8" opacity={0.75} />
      </g>
    );
  }
  const dots = [0, 1, 2, 3, 4].map((d) => {
    const dx = x + w * (0.25 + 0.12 * ((d + i) % 4)) + jitter;
    const dy = y + h * (0.3 + 0.1 * ((d * 2 + i) % 3));
    return <circle key={d} cx={dx} cy={dy} r={w * 0.055} fill="#3f8f4c" />;
  });
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#eaf5ea" stroke="#6f9a6f" strokeWidth={2.5} />
      {dots}
    </g>
  );
}

export function MicroscopeView({ sampleId, objective, focusValue, focusTarget, light }: { sampleId: string; objective: ObjectiveId; focusValue: number; focusTarget: number; light: number }) {
  const mag = totalMagnification(objective);
  const zoom = mag / BASE_MAGNIFICATION;
  const viewSize = GRID_SIZE / zoom;
  const offset = (GRID_SIZE - viewSize) / 2;
  const blur = Math.min(6, focusOffset(focusValue, focusTarget) / 6);
  const brightness = 0.4 + (light / 100) * 1.1;
  const variant = sampleId === "elodeya-bargi" ? "elodea" : "onion";

  const cells: React.ReactElement[] = [];
  const cols = 4;
  const rows = 4;
  const cw = GRID_SIZE / cols;
  const ch = GRID_SIZE / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      cells.push(<Cell key={i} i={i} x={c * cw + 4} y={r * ch + 4} w={cw - 8} h={ch - 8} variant={variant} />);
    }
  }

  return (
    <div className="microscope-eyepiece">
      <svg viewBox={`${offset} ${offset} ${viewSize} ${viewSize}`} className="microscope-eyepiece-svg" style={{ filter: `blur(${blur}px) brightness(${brightness})` }}>
        <rect x={0} y={0} width={GRID_SIZE} height={GRID_SIZE} fill="#f7fbf2" />
        {cells}
      </svg>
      <div className="microscope-eyepiece-ring" />
      <div className="microscope-mag-badge">{mag}x</div>
    </div>
  );
}
