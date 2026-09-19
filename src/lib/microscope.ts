export type ObjectiveId = "10x" | "40x";
export const OCULAR_MAGNIFICATION = 10;
export const OBJECTIVES: Record<ObjectiveId, number> = { "10x": 10, "40x": 40 };

export type StructureId = "hujayra_devori" | "yadro" | "sitoplazma" | "xloroplast" | "vakuola";

export const STRUCTURE_LABELS: Record<StructureId, string> = {
  hujayra_devori: "Hujayra devori",
  yadro: "Yadro",
  sitoplazma: "Sitoplazma",
  xloroplast: "Xloroplastlar",
  vakuola: "Vakuola",
};

export interface Sample {
  id: string;
  name: string;
  description: string;
  visibleStructures: StructureId[]; // ground truth for the labeling check
}

export const samples: Sample[] = [
  {
    id: "piyoz-pardasi",
    name: "Piyoz pardasi hujayralari",
    description: "Piyoz pallasining ichki yupqa pardasidan olingan preparat. Hujayralar g‘isht devor kabi qatorlashgan.",
    visibleStructures: ["hujayra_devori", "yadro", "sitoplazma", "vakuola"],
  },
  {
    id: "elodeya-bargi",
    name: "Elodeya bargi hujayralari",
    description: "Suv o‘tining yosh bargidan olingan preparat. Har bir hujayrada harakatlanuvchi yashil xloroplastlar ko‘rinadi.",
    visibleStructures: ["hujayra_devori", "sitoplazma", "xloroplast", "vakuola"],
  },
];

export function totalMagnification(objective: ObjectiveId): number {
  return OCULAR_MAGNIFICATION * OBJECTIVES[objective];
}

// Distance (0-100 scale) between the current focus knob position and the
// correct focus for the current objective — this is the only thing focus
// blur depends on; it never changes which structures are visible.
export function focusOffset(focusValue: number, target: number): number {
  return Math.abs(focusValue - target);
}

export function buildMicroscopeContext(sampleId: string, objective: ObjectiveId, focusValue: number, focusTarget: number, light: number) {
  const sample = samples.find((s) => s.id === sampleId);
  return {
    experiment: "Mikroskop kuzatuvi",
    notes: "Model faqat shu ikkita tayyor preparat va ikkita obyektiv darajasini (10x, 40x) qo‘llab-quvvatlaydi. Kattalashtirish = okulyar (10x) x obyektiv. Fokus va yorug‘lik faqat tasvir aniqligi/yorqinligini o‘zgartiradi, hujayra tarkibini o‘zgartirmaydi.",
    sample: sample?.name,
    visibleStructures: sample?.visibleStructures.map((s) => STRUCTURE_LABELS[s]),
    objective,
    totalMagnification: totalMagnification(objective),
    inFocus: focusOffset(focusValue, focusTarget) < 8,
    light,
  };
}
