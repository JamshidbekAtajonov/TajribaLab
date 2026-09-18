import type { TitrationResult, TitrationState } from "@/lib/titration";

interface Scene2DProps {
  state: TitrationState;
  result: TitrationResult;
  dripping?: boolean;
  swirling?: boolean;
}

export function LabScene2D({ state, result, dripping, swirling }: Scene2DProps) {
  const fill = state.acidMl > 0 ? Math.min(70, 10 + result.totalMl) : 0;
  const buretteH = (state.baseInBuretteMl / 50) * 190;
  const liquidClass =
    result.color === "rangsiz" ? "acid-liquid" : result.color === "och pushti" ? "pink-liquid" : "deep-pink-liquid";
  const canDrip = Boolean(dripping) && state.flaskPlaced && state.baseInBuretteMl > 0;

  return (
    <div className="lab-2d">
      <div className="diagram-title">Titrash qurilmasi · 2D sxema</div>
      <svg viewBox="0 0 600 500" role="img" aria-label="Byuretka va kolbaning ikki o‘lchovli ko‘rinishi">
        <rect x="145" y="55" width="14" height="350" rx="5" className="metal" />
        <rect x="145" y="65" width="190" height="12" rx="5" className="metal" />
        <rect x="294" y="72" width="32" height="230" rx="12" className="glass" />
        <rect
          x="301"
          y={80 + (1 - state.baseInBuretteMl / 50) * 190}
          width="18"
          height={buretteH}
          rx="7"
          className="base-liquid"
          style={{ transition: "y .4s ease, height .4s ease" }}
        />
        <line x1="310" y1="302" x2="310" y2="350" className="tube" />
        <line
          x1="285"
          y1="317"
          x2="335"
          y2="317"
          className="valve"
          style={{
            transformOrigin: "310px 317px",
            transform: state.valveOpen ? "rotate(90deg)" : "none",
            transition: "transform .3s ease",
          }}
        />
        {canDrip && (
          <>
            <circle cx="310" r="6" className="drop">
              <animate attributeName="cy" values="352;430" dur="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.2" dur="0.7s" repeatCount="indefinite" />
            </circle>
            {state.valveOpen && <line x1="310" y1="350" x2="310" y2="380" className="tube" />}
          </>
        )}

        {state.flaskPlaced && (
          <g style={{ transformOrigin: "310px 400px" }}>
            {swirling && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 310 445;4 310 445;-4 310 445;0 310 445"
                dur="0.5s"
                repeatCount="indefinite"
              />
            )}
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -60;0 0"
              dur="0.45s"
              fill="freeze"
            />
            <path d="M235 445 L260 355 L285 335 L335 335 L360 355 L385 445 Z" className="glass" />
            {fill > 0 && (
              <path
                d={`M248 ${445 - fill} Q310 ${435 - fill} 372 ${445 - fill} L385 445 L235 445 Z`}
                className={liquidClass}
                style={{ transition: "d .4s ease, fill .5s ease" }}
              />
            )}
            {state.indicatorAdded && (
              <text x="250" y="470" className="diagram-label">
                Fenolftalein qo‘shilgan
              </text>
            )}
          </g>
        )}
        {!state.flaskPlaced && (
          <text x="250" y="420" className="diagram-label">
            Kolba hali joylashtirilmagan
          </text>
        )}

        <text x="345" y="175" className="diagram-label">
          NaOH {state.baseInBuretteMl.toFixed(1)} ml
        </text>
        <text x="395" y="410" className="diagram-label">
          pH {result.ph.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}
