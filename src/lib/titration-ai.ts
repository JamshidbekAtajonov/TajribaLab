import { askAiTeacher, type AssistantReply, type HistoryTurn } from './ai-teacher-client';
import { buildTitrationContext, type TitrationResult, type TitrationState } from './titration';

export type AISource = 'remote' | 'local';
let lastSource: AISource = 'local';
export const getLastTitrationAISource = () => lastSource;

// Rule-based fallback, grounded in the same calculated result the real AI would
// have received — used when the server isn't configured or the request fails.
function localTitrationReply(question: string, state: TitrationState, result: TitrationResult): AssistantReply {
  const q = question.toLowerCase();
  if (/ph|nega.*(rang|o‘zgar)/.test(q)) return { kind: 'Inferred', text: `Hozir pH ${result.ph.toFixed(2)}. Bu qiymat kislota va ishqorning qolgan mol miqdori hamda jami ${result.totalMl.toFixed(1)} ml hajmdan hisoblandi.` };
  if (/ekvivalent/.test(q)) return { kind: 'Observed', text: `Ekvivalent nuqta holati: ${result.equivalence}.` };
  if (/nima.*(o‘zgardi|holat|bo‘ldi)/.test(q)) return { kind: 'Observed', text: `Hozir ${state.baseAddedMl.toFixed(1)} ml NaOH qo‘shilgan. Ekvivalent nuqta holati: ${result.equivalence}.` };
  return { kind: 'Inferred', text: `Joriy holat: pH ${result.ph.toFixed(2)}, ${state.baseAddedMl.toFixed(1)} ml NaOH qo‘shilgan, indikator rangi ${result.color}.` };
}

export async function askTitrationAI(question: string, state: TitrationState, result: TitrationResult, history: HistoryTurn[] = []): Promise<AssistantReply> {
  try {
    const reply = await askAiTeacher(question, buildTitrationContext(state, result), history);
    lastSource = 'remote';
    return reply;
  } catch (error) {
    console.warn('[titration-ai] remote AI failed, falling back to local:', error);
  }
  lastSource = 'local';
  return localTitrationReply(question, state, result);
}
