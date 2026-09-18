export interface TitrationState {
  acidMl: number;
  baseInBuretteMl: number;
  baseAddedMl: number;
  acidMolarity: number;
  baseMolarity: number;
  indicatorAdded: boolean;
  flaskPlaced: boolean;
  initialReadingRecorded: boolean;
  finalReadingRecorded: boolean;
  valveOpen: boolean;
  mixed: boolean;
  step: number;
  mode: "3D" | "2D";
  guided: boolean;
  observations: string;
  conclusion: string;
  updatedAt: string;
}

export interface TitrationResult {
  ph: number;
  totalMl: number;
  color: "rangsiz" | "och pushti" | "to‘q pushti";
  equivalence: "oldin" | "yaqin" | "o‘tgan";
}

export const initialTitrationState: TitrationState = {
  acidMl: 0,
  baseInBuretteMl: 0,
  baseAddedMl: 0,
  acidMolarity: 0.1,
  baseMolarity: 0.1,
  indicatorAdded: false,
  flaskPlaced: false,
  initialReadingRecorded: false,
  finalReadingRecorded: false,
  valveOpen: false,
  mixed: false,
  step: 0,
  mode: "3D",
  guided: true,
  observations: "",
  conclusion: "",
  updatedAt: new Date(0).toISOString(),
};

export function calculateTitration(state: TitrationState): TitrationResult {
  const acidMoles = state.acidMolarity * state.acidMl / 1000;
  const baseMoles = state.baseMolarity * state.baseAddedMl / 1000;
  const totalL = Math.max((state.acidMl + state.baseAddedMl) / 1000, 0.000001);
  const difference = acidMoles - baseMoles;
  let ph: number;
  if (Math.abs(difference) < 1e-12 && state.acidMl > 0) ph = 7;
  else if (difference > 0) ph = -Math.log10(difference / totalL);
  else if (baseMoles > 0) ph = 14 + Math.log10((-difference) / totalL);
  else ph = 7;
  ph = Math.min(14, Math.max(0, ph));
  return {
    ph,
    totalMl: state.acidMl + state.baseAddedMl,
    color: !state.indicatorAdded || ph < 8.2 ? "rangsiz" : ph <= 10 ? "och pushti" : "to‘q pushti",
    equivalence: ph < 6.8 ? "oldin" : ph <= 7.2 ? "yaqin" : "o‘tgan",
  };
}

export const STORAGE_KEY = "tajribalab-titration-v1";