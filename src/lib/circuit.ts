export type TerminalId = 'src_pos' | 'src_neg' | 'amm_a' | 'amm_b' | 'res_a' | 'res_b' | 'volt_a' | 'volt_b';

export const terminals: Record<TerminalId, { x: number; y: number; label: string }> = {
  src_pos: { x: 70, y: 120, label: 'Manba +' },
  src_neg: { x: 70, y: 320, label: 'Manba −' },
  amm_a: { x: 230, y: 60, label: 'Ampermetr A' },
  amm_b: { x: 390, y: 60, label: 'Ampermetr B' },
  res_a: { x: 560, y: 110, label: 'Rezistor A' },
  res_b: { x: 560, y: 330, label: 'Rezistor B' },
  volt_a: { x: 460, y: 390, label: 'Voltmetr A' },
  volt_b: { x: 620, y: 390, label: 'Voltmetr B' },
};

export type Wire = [TerminalId, TerminalId];

export interface CircuitState {
  voltage: number; // V, allowed 1-24
  resistance: number; // ohm, allowed 1-1000
  wires: Wire[];
  selected: TerminalId | null;
  measurements: { voltage: number; resistance: number; current: number }[];
}

export const VOLTAGE_RANGE = { min: 1, max: 24 };
export const RESISTANCE_RANGE = { min: 1, max: 1000 };

export const initialCircuitState: CircuitState = {
  voltage: 9,
  resistance: 100,
  wires: [],
  selected: null,
  measurements: [],
};

function find(parent: Map<TerminalId, TerminalId>, id: TerminalId): TerminalId {
  let root = id;
  while (parent.get(root) !== root) root = parent.get(root)!;
  return root;
}

function buildUnionFind(wires: Wire[]): Map<TerminalId, TerminalId> {
  const parent = new Map<TerminalId, TerminalId>();
  (Object.keys(terminals) as TerminalId[]).forEach((t) => parent.set(t, t));
  const union = (a: TerminalId, b: TerminalId) => {
    const ra = find(parent, a);
    const rb = find(parent, b);
    if (ra !== rb) parent.set(ra, rb);
  };
  wires.forEach(([a, b]) => union(a, b));
  return parent;
}

export type CircuitStatus = 'open' | 'short-source' | 'short-resistor' | 'ammeter-bypassed' | 'closed';

export interface CircuitEvaluation {
  status: CircuitStatus;
  message: string;
  current: number | null; // amps
  voltmeterReading: number | null; // volts
  voltmeterOk: boolean;
}

// Real Ohm's-law evaluation of a fixed single-source/single-resistor loop.
// The three current-carrying components (source, ammeter, resistor) must form
// a single 3-node closed loop (each merged node touched by exactly two of the
// three component-edges) for current to flow at all — this is the standard
// graph-theory way to check "is this actually a series loop", not a guess.
export function evaluateCircuit(state: CircuitState): CircuitEvaluation {
  const parent = buildUnionFind(state.wires);
  const f = (t: TerminalId) => find(parent, t);

  if (f('src_pos') === f('src_neg')) {
    return { status: 'short-source', message: 'Qisqa tutashuv: manba ikkala uchi rezistorsiz to‘g‘ridan-to‘g‘ri ulangan. Bu modelda cheksiz tok hisoblanmaydi — avval shu simni olib tashlang.', current: null, voltmeterReading: null, voltmeterOk: false };
  }
  if (f('res_a') === f('res_b')) {
    return { status: 'short-resistor', message: 'Rezistorning ikkala uchi bir-biriga qisqa tutashgan. Rezistorni aylanib o‘tuvchi simni olib tashlang.', current: null, voltmeterReading: null, voltmeterOk: false };
  }

  const edges: { nodes: [TerminalId, TerminalId]; kind: 'source' | 'ammeter' | 'resistor' }[] = [
    { nodes: ['src_pos', 'src_neg'], kind: 'source' },
    { nodes: ['amm_a', 'amm_b'], kind: 'ammeter' },
    { nodes: ['res_a', 'res_b'], kind: 'resistor' },
  ];
  const nodeIds = edges.flatMap((e) => [f(e.nodes[0]), f(e.nodes[1])]);
  const uniqueNodes = [...new Set(nodeIds)];
  const degreeOk = uniqueNodes.length === 3 && uniqueNodes.every((n) => nodeIds.filter((x) => x === n).length === 2);

  if (!degreeOk) {
    // Did the user complete a loop between source and resistor while skipping the ammeter?
    const bypassed = f('src_pos') === f('res_a') || f('src_pos') === f('res_b') || f('src_neg') === f('res_a') || f('src_neg') === f('res_b');
    if (bypassed) return { status: 'ammeter-bypassed', message: 'Ampermetr zanjirga ketma-ket ulanmagan — tok manbadan to‘g‘ridan-to‘g‘ri rezistorga o‘tib ketyapti. Ampermetrni orada qoldirib ulang.', current: null, voltmeterReading: null, voltmeterOk: false };
    return { status: 'open', message: 'Zanjir hali yopilmagan. Manba, ampermetr va rezistorni ketma-ket ulang.', current: null, voltmeterReading: null, voltmeterOk: false };
  }

  const current = state.voltage / state.resistance;
  const vNodes = [f('volt_a'), f('volt_b')];
  const voltmeterOk = new Set(vNodes).size === 2 && edges.some((e) => {
    const pair = new Set([f(e.nodes[0]), f(e.nodes[1])]);
    return pair.size === 2 && vNodes.every((n) => pair.has(n));
  });
  let voltmeterReading: number | null = null;
  if (voltmeterOk) {
    const matched = edges.find((e) => {
      const pair = new Set([f(e.nodes[0]), f(e.nodes[1])]);
      return vNodes.every((n) => pair.has(n));
    })!;
    voltmeterReading = matched.kind === 'ammeter' ? 0 : state.voltage; // ideal ammeter drops 0V; source and resistor read the same V here
  }

  return {
    status: 'closed',
    message: voltmeterOk ? 'Zanjir to‘g‘ri yopildi.' : 'Zanjir yopildi va tok oqmoqda, lekin voltmetr hali biror element bilan parallel ulanmagan.',
    current,
    voltmeterReading,
    voltmeterOk,
  };
}

export function connectTerminals(state: CircuitState, a: TerminalId, b: TerminalId): { state: CircuitState; error?: string } {
  if (a === b) return { state, error: 'Bitta terminalni o‘ziga ulab bo‘lmaydi.' };
  const exists = state.wires.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  if (exists) return { state, error: 'Bu ikki terminal allaqachon ulangan.' };
  return { state: { ...state, wires: [...state.wires, [a, b]], selected: null } };
}

export function removeWire(state: CircuitState, index: number): CircuitState {
  return { ...state, wires: state.wires.filter((_, i) => i !== index) };
}

export function buildCircuitContext(state: CircuitState, evaluation: CircuitEvaluation) {
  return {
    experiment: 'Oddiy elektr zanjiri',
    notes: 'Model faqat bitta manba, bitta rezistor, bitta ampermetr va bitta voltmetrdan iborat oddiy ketma-ket zanjirni qo‘llab-quvvatlaydi (Om qonuni: I = V/R). Parallel yoki ko‘p qarshilikli zanjirlar bu modelda mavjud emas.',
    voltage: state.voltage,
    resistance: state.resistance,
    wireCount: state.wires.length,
    status: evaluation.status,
    current: evaluation.current,
    voltmeterReading: evaluation.voltmeterReading,
  };
}
