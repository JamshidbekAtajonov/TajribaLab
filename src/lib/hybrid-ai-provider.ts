import { remoteAIProvider } from './remote-ai-provider';
import { localAIProvider } from './sandbox-ai';
import type { AIProvider, AssistantReply, HistoryTurn } from './sandbox-ai';
import type { LabState } from './sandbox';

export type AISource = 'remote' | 'local';

let lastSource: AISource = 'local';
export const getLastAISource = () => lastSource;

// Tries the real AI teacher first; silently falls back to the rule-based local
// provider if the server isn't configured (no ANTHROPIC_API_KEY) or the request
// fails (offline, quota, cold start, etc). This satisfies the "AI service drops
// -> experiment continues" requirement without ever blocking the student.
export const hybridAIProvider: AIProvider = {
  async sendMessage(question: string, state: LabState, history: HistoryTurn[] = []): Promise<AssistantReply> {
    try {
      const reply = await remoteAIProvider.sendMessage(question, state, history);
      lastSource = 'remote';
      return reply;
    } catch (error) {
      console.warn('[hybrid-ai-provider] remote AI failed, falling back to local:', error);
    }
    lastSource = 'local';
    return localAIProvider.sendMessage(question, state);
  },
};
