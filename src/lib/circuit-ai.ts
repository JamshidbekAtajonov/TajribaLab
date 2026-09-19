import { askAiTeacher, type AssistantReply, type HistoryTurn } from './ai-teacher-client';
import { buildCircuitContext, type CircuitEvaluation, type CircuitState } from './circuit';

export type AISource = 'remote' | 'local';
let lastSource: AISource = 'local';
export const getLastCircuitAISource = () => lastSource;

// Rule-based fallback, grounded in the same evaluation the real AI would have
// received — used when the server isn't configured or the request fails.
function localCircuitReply(question: string, state: CircuitState, evaluation: CircuitEvaluation): AssistantReply {
  const q = question.toLowerCase();
  if (/ampermetr|tok/.test(q)) {
    if (evaluation.current === null) return { kind: 'Observed', text: 'Zanjir hali yopilmagani uchun ampermetr hech qanday tok o‘lchamayapti.' };
    return { kind: 'Observed', text: `Ampermetr ${(evaluation.current * 1000).toFixed(1)} mA ko‘rsatmoqda — bu Om qonuni bo‘yicha I = U/R = ${state.voltage} V / ${state.resistance} Ω dan hisoblandi.` };
  }
  if (/voltmetr|kuchlanish/.test(q)) {
    if (evaluation.voltmeterReading === null) return { kind: 'Observed', text: 'Voltmetr hali to‘g‘ri ulanmagani uchun kuchlanish o‘lchanmayapti.' };
    return { kind: 'Observed', text: `Voltmetr ${evaluation.voltmeterReading.toFixed(1)} V ko‘rsatmoqda.` };
  }
  if (/qisqa tutash/.test(q)) return { kind: 'Observed', text: evaluation.status.startsWith('short') ? 'Ha, hozir qisqa tutashuv aniqlandi — ' + evaluation.message : 'Hozircha qisqa tutashuv aniqlanmadi.' };
  return { kind: 'Observed', text: evaluation.message };
}

export async function askCircuitAI(question: string, state: CircuitState, evaluation: CircuitEvaluation, history: HistoryTurn[] = []): Promise<AssistantReply> {
  try {
    const reply = await askAiTeacher(question, buildCircuitContext(state, evaluation), history);
    lastSource = 'remote';
    return reply;
  } catch (error) {
    console.warn('[circuit-ai] remote AI failed, falling back to local:', error);
  }
  lastSource = 'local';
  return localCircuitReply(question, state, evaluation);
}
