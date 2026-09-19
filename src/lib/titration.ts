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

export function buildTitrationContext(state: TitrationState, result: TitrationResult) {
  return {
    experiment: "Kislota–ishqor titrlash",
    notes: "Model 25°C dagi 0,1 M atrofidagi kuchli bir asosli kislota (HCl) va kuchli ishqor (NaOH) mol balansidan pH ni hisoblaydi. Faqat shu ikki modda va shu formula modellashtirilgan — boshqa reagent yoki reaksiya bu tajribada mavjud emas.",
    step: state.step,
    stepDescription: titrationStepDescriptionForContext(state.step),
    flaskPlaced: state.flaskPlaced,
    acidMl: state.acidMl,
    acidMolarity: state.acidMolarity,
    baseMolarity: state.baseMolarity,
    baseInBuretteMl: state.baseInBuretteMl,
    baseAddedMl: state.baseAddedMl,
    indicatorAdded: state.indicatorAdded,
    initialReadingRecorded: state.initialReadingRecorded,
    finalReadingRecorded: state.finalReadingRecorded,
    valveOpen: state.valveOpen,
    mixed: state.mixed,
    observations: state.observations,
    result,
  };
}

function titrationStepDescriptionForContext(step: number): string {
  const labels = [
    "Maqsad va model shartlari o‘qilmoqda",
    "Kolba byuretka ostiga joylashtirilmoqda",
    "HCl eritmasi kolbaga o‘tkazilmoqda",
    "Fenolftalein indikatori qo‘shilmoqda",
    "Byuretka NaOH bilan to‘ldirilib, boshlang‘ich o‘qish yozilmoqda",
    "NaOH asta tomizilmoqda",
    "Yakuniy o‘qish yozilmoqda",
    "Natija va xulosa saqlanmoqda",
  ];
  return labels[step] ?? "Noma’lum bosqich";
}