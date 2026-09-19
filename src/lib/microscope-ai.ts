import { askAiTeacher, type AssistantReply, type HistoryTurn } from './ai-teacher-client';
import { buildMicroscopeContext, focusOffset, samples, STRUCTURE_LABELS, totalMagnification, type ObjectiveId } from './microscope';

export type AISource = 'remote' | 'local';
let lastSource: AISource = 'local';
export const getLastMicroscopeAISource = () => lastSource;

// Rule-based fallback, grounded in the same real state the AI would have
// received — used when the server isn't configured or the request fails.
function localMicroscopeReply(question: string, sampleId: string, objective: ObjectiveId, focusValue: number, focusTarget: number, light: number): AssistantReply {
  const sample = samples.find((s) => s.id === sampleId);
  const q = question.toLowerCase();
  const inFocus = focusOffset(focusValue, focusTarget) < 8;
  if (/kattalash|magnif/.test(q)) return { kind: 'Observed', text: `Umumiy kattalashtirish ${totalMagnification(objective)}x — okulyar (10x) va ${objective} obyektivning ko‘paytmasi.` };
  if (/fokus/.test(q)) return { kind: 'Observed', text: inFocus ? 'Tasvir hozir aniq fokusda.' : 'Tasvir hali to‘liq fokusda emas — dag‘al yoki nozik fokus tugmasini asta buring.' };
  if (/nima.*(ko‘rin|bor)/.test(q)) return { kind: 'Observed', text: sample ? `Ushbu preparatda quyidagilar ko‘rinadi: ${sample.visibleStructures.map((s) => STRUCTURE_LABELS[s]).join(', ')}.` : 'Preparat tanlanmagan.' };
  return { kind: 'Inferred', text: `Hozir ${sample?.name ?? 'preparat'} ${totalMagnification(objective)}x kattalashtirishda kuzatilmoqda.` };
}

export async function askMicroscopeAI(question: string, sampleId: string, objective: ObjectiveId, focusValue: number, focusTarget: number, light: number, history: HistoryTurn[] = []): Promise<AssistantReply> {
  try {
    const reply = await askAiTeacher(question, buildMicroscopeContext(sampleId, objective, focusValue, focusTarget, light), history);
    lastSource = 'remote';
    return reply;
  } catch (error) {
    console.warn('[microscope-ai] remote AI failed, falling back to local:', error);
  }
  lastSource = 'local';
  return localMicroscopeReply(question, sampleId, objective, focusValue, focusTarget, light);
}
